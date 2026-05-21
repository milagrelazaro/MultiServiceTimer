import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Activity, ActivityStatus, Pause } from '../types';
import { STORAGE_KEYS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivityContextType {
  activities: Activity[];
  currentActivity: Activity | null;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'totalPausedTime' | 'pauses' | 'materials' | 'photos' | 'isPaid'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  startActivity: (activity: Activity) => Promise<void>;
  pauseActivity: (activityId: string) => Promise<void>;
  resumeActivity: (activityId: string) => Promise<void>;
  completeActivity: (activityId: string) => Promise<void>;
  loadActivities: () => Promise<void>;
  loadCurrentActivity: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);

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

  const saveActivities = async (newActivities: Activity[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(newActivities));
      setActivities(newActivities);
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  };

  const saveCurrentActivity = async (activity: Activity | null) => {
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

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'totalPausedTime' | 'pauses' | 'materials' | 'photos' | 'isPaid'>) => {
    const newActivity: Activity = {
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

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    const newActivities = activities.map(act => 
      act.id === id ? { ...act, ...updates } : act
    );
    await saveActivities(newActivities);
    
    if (currentActivity?.id === id) {
      await saveCurrentActivity({ ...currentActivity, ...updates });
    }
  };

  const deleteActivity = async (id: string) => {
    const newActivities = activities.filter(act => act.id !== id);
    await saveActivities(newActivities);
    
    if (currentActivity?.id === id) {
      await saveCurrentActivity(null);
    }
  };

  const startActivity = async (activity: Activity) => {
    const updatedActivity: Activity = {
      ...activity,
      status: 'in_progress' as ActivityStatus,
      startedAt: Date.now(),
    };
    
    await updateActivity(activity.id, updatedActivity);
    await saveCurrentActivity(updatedActivity);
  };

  const pauseActivity = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity || activity.status !== 'in_progress') return;

    const newPause: Pause = { start: Date.now() };
    const updatedActivity: Activity = {
      ...activity,
      status: 'paused' as ActivityStatus,
      pauses: [...activity.pauses, newPause],
    };
    
    await updateActivity(activityId, updatedActivity);
    await saveCurrentActivity(updatedActivity);
  };

  const resumeActivity = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity || activity.status !== 'paused') return;

    const lastPause = activity.pauses[activity.pauses.length - 1];
    if (!lastPause || lastPause.end) return;

    const pauseDuration = Date.now() - lastPause.start;
    const updatedActivity: Activity = {
      ...activity,
      status: 'in_progress' as ActivityStatus,
      totalPausedTime: activity.totalPausedTime + pauseDuration,
      pauses: activity.pauses.map((p, i) => 
        i === activity.pauses.length - 1 ? { ...p, end: Date.now() } : p
      ),
    };
    
    await updateActivity(activityId, updatedActivity);
    await saveCurrentActivity(updatedActivity);
  };

  const completeActivity = async (activityId: string) => {
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
    const totalCost = totalTime * activity.hourlyRate;

    const updatedActivity: Activity = {
      ...activity,
      status: 'completed' as ActivityStatus,
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
