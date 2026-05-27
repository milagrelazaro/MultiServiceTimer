import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

const ActivityContext = createContext(undefined);

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);

  const loadActivities = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (stored) {
        setActivities(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadCurrentActivity = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ACTIVITY);
      if (stored) {
        setCurrentActivity(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading current activity:', error);
    }
  };

  const saveActivities = async (newActivities) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(newActivities));
      setActivities(newActivities);
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  };

  const saveCurrentActivity = async (activity) => {
    try {
      if (activity) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_ACTIVITY, JSON.stringify(activity));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ACTIVITY);
      }
      setCurrentActivity(activity);
    } catch (error) {
      console.error('Error saving current activity:', error);
    }
  };

  const addActivity = async (activityData) => {
    const newActivity = {
      ...activityData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      totalPausedTime: 0,
      pauses: [],
      materials: [],
      photos: [],
      isPaid: false,
    };
    
    const newActivities = [newActivity, ...activities];
    await saveActivities(newActivities);
    
    if (activityData.status === 'in_progress') {
      await saveCurrentActivity(newActivity);
    }
  };

  const updateActivity = async (id, updates) => {
    const newActivities = activities.map(act => 
      act.id === id ? { ...act, ...updates } : act
    );
    await saveActivities(newActivities);
    
    if (currentActivity?.id === id) {
      await saveCurrentActivity({ ...currentActivity, ...updates });
    }
  };

  const deleteActivity = async (id) => {
    const newActivities = activities.filter(act => act.id !== id);
    await saveActivities(newActivities);
    
    if (currentActivity?.id === id) {
      await saveCurrentActivity(null);
    }
  };

  const startActivity = async (activity) => {
    const updatedActivity = {
      ...activity,
      status: 'in_progress',
      startedAt: Date.now(),
    };
    
    await updateActivity(activity.id, updatedActivity);
    await saveCurrentActivity(updatedActivity);
  };

  const pauseActivity = async (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity || activity.status !== 'in_progress') return;

    const newPause = { start: Date.now() };
    const updatedActivity = {
      ...activity,
      status: 'paused',
      pauses: [...activity.pauses, newPause],
    };
    
    await updateActivity(activityId, updatedActivity);
    await saveCurrentActivity(updatedActivity);
  };

  const resumeActivity = async (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity || activity.status !== 'paused') return;

    const lastPause = activity.pauses[activity.pauses.length - 1];
    if (!lastPause || lastPause.end) return;

    const pauseDuration = Date.now() - lastPause.start;
    const updatedActivity = {
      ...activity,
      status: 'in_progress',
      totalPausedTime: activity.totalPausedTime + pauseDuration,
      pauses: activity.pauses.map((p, i) => 
        i === activity.pauses.length - 1 ? { ...p, end: Date.now() } : p
      ),
    };
    
    await updateActivity(activityId, updatedActivity);
    await saveCurrentActivity(updatedActivity);
  };

  const completeActivity = async (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    let totalPausedTime = activity.totalPausedTime;
    let pauses = [...activity.pauses];

    if (activity.status === 'paused') {
      const lastPause = pauses[pauses.length - 1];
      if (lastPause && !lastPause.end) {
        totalPausedTime += Date.now() - lastPause.start;
        pauses = pauses.map((p, i) => 
          i === pauses.length - 1 ? { ...p, end: Date.now() } : p
        );
      }
    }

    const completedAt = Date.now();
    const totalTime = activity.startedAt ? (completedAt - activity.startedAt - totalPausedTime) / 1000 : 0;

    // Calcular custo total: orçamento + materiais + gasto de material próprio
    const materialsCost = (activity.materials || []).reduce((sum, m) => sum + (m.cost || 0), 0);
    const totalCost = (activity.estimatedBudget || 0) + materialsCost + (activity.ownMaterialCost || 0);

    const updatedActivity = {
      ...activity,
      status: 'completed',
      completedAt,
      totalPausedTime,
      pauses,
      totalCost,
    };
    
    await updateActivity(activityId, updatedActivity);
    await saveCurrentActivity(null);
  };

  useEffect(() => {
    loadActivities();
    loadCurrentActivity();
  }, []);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        currentActivity,
        addActivity,
        updateActivity,
        deleteActivity,
        startActivity,
        pauseActivity,
        resumeActivity,
        completeActivity,
        loadActivities,
        loadCurrentActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivities = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within ActivityProvider');
  }
  return context;
};
