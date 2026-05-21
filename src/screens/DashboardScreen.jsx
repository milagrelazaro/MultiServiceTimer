import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivities } from '../context/ActivityContext';
import { COLORS } from '../constants';
import { formatTime, calculateElapsedTime, formatCurrency } from '../utils/timer';

const DashboardScreen = ({ navigation }) => {
  const { currentActivity, activities, pauseActivity, resumeActivity, completeActivity } = useActivities();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentActivity && currentActivity.status === 'in_progress') {
        setElapsedTime(calculateElapsedTime(currentActivity));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentActivity]);

  const todayActivities = activities.filter(act => {
    const today = new Date();
    const actDate = new Date(act.createdAt);
    return (
      actDate.getDate() === today.getDate() &&
      actDate.getMonth() === today.getMonth() &&
      actDate.getFullYear() === today.getFullYear()
    );
  });

  const completedToday = todayActivities.filter(act => act.status === 'completed').length;
  const totalTimeToday = todayActivities
    .filter(act => act.status === 'completed')
    .reduce((sum, act) => sum + (act.totalCost || 0), 0);

  const handlePauseResume = async () => {
    if (!currentActivity) return;
    
    if (currentActivity.status === 'in_progress') {
      await pauseActivity(currentActivity.id);
    } else if (currentActivity.status === 'paused') {
      await resumeActivity(currentActivity.id);
    }
  };

  const handleComplete = async () => {
    if (!currentActivity) return;
    await completeActivity(currentActivity.id);
    setElapsedTime(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Técnico!</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('pt-MZ', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Timer Card - Se houver atividade em andamento */}
        {currentActivity && (
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <View style={styles.serviceTypeBadge}>
                <Text style={styles.serviceTypeIcon}>
                  {getServiceIcon(currentActivity.serviceType)}
                </Text>
                <Text style={styles.serviceTypeText}>
                  {getServiceLabel(currentActivity.serviceType)}
                </Text>
              </View>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(currentActivity.status) }
              ]}>
                <Text style={styles.statusText}>
                  {getStatusText(currentActivity.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.activityDescription} numberOfLines={2}>
              {currentActivity.description}
            </Text>

            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            </View>

            <View style={styles.timerActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.pauseButton]}
                onPress={handlePauseResume}
              >
                <Ionicons 
                  name={currentActivity.status === 'in_progress' ? 'pause' : 'play'} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.actionButtonText}>
                  {currentActivity.status === 'in_progress' ? 'Pausar' : 'Continuar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleComplete}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Finalizar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.detailButton]}
                onPress={() => navigation.navigate('ActivityDetail', { activityId: currentActivity.id })}
              >
                <Ionicons name="create" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Detalhes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Nova Atividade Button - Se não houver atividade em andamento */}
        {!currentActivity && (
          <TouchableOpacity
            style={styles.newActivityButton}
            onPress={() => navigation.navigate('NewActivity')}
          >
            <Ionicons name="add-circle" size={32} color="#fff" />
            <Text style={styles.newActivityButtonText}>Nova Atividade</Text>
          </TouchableOpacity>
        )}

        {/* Resumo do Dia */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Dia</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-done-circle" size={32} color={COLORS.success} />
              <Text style={styles.summaryValue}>{completedToday}</Text>
              <Text style={styles.summaryLabel}>Concluídas</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={32} color={COLORS.primary} />
              <Text style={styles.summaryValue}>{todayActivities.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="cash" size={32} color={COLORS.warning} />
              <Text style={styles.summaryValue}>{formatCurrency(totalTimeToday)}</Text>
              <Text style={styles.summaryLabel}>Faturação</Text>
            </View>
          </View>
        </View>

        {/* Atividades Recentes */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {activities.slice(0, 5).map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}
            >
              <View style={styles.activityItemLeft}>
                <Text style={styles.activityItemIcon}>
                  {getServiceIcon(activity.serviceType)}
                </Text>
                <View style={styles.activityItemInfo}>
                  <Text style={styles.activityItemTitle} numberOfLines={1}>
                    {activity.description}
                  </Text>
                  <Text style={styles.activityItemSubtitle}>
                    {getServiceLabel(activity.serviceType)} • {activity.clientName || 'Sem cliente'}
                  </Text>
                </View>
              </View>
              <View style={styles.activityItemRight}>
                <View style={[
                  styles.activityStatusBadge,
                  { backgroundColor: getStatusColor(activity.status) }
                ]}>
                  <Text style={styles.activityStatusText}>
                    {getStatusText(activity.status)}
                  </Text>
                </View>
                {activity.totalCost && (
                  <Text style={styles.activityCost}>
                    {formatCurrency(activity.totalCost)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {activities.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma atividade ainda</Text>
              <Text style={styles.emptySubtext}>Comece criando sua primeira atividade</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getServiceIcon = (type) => {
  const icons = {
    eletrica: '⚡',
    frio: '❄️',
    redes: '🌐',
    cameras: '📹',
    hidraulica: '💧',
    ar_condicionado: '🌀',
    outro: '🔧',
  };
  return icons[type] || '🔧';
};

const getServiceLabel = (type) => {
  const labels = {
    eletrica: 'Elétrica',
    frio: 'Frio',
    redes: 'Redes',
    cameras: 'Câmeras',
    hidraulica: 'Hidráulica',
    ar_condicionado: 'Ar Condicionado',
    outro: 'Outro',
  };
  return labels[type] || 'Outro';
};

const getStatusColor = (status) => {
  const colors = {
    pending: COLORS.textSecondary,
    in_progress: COLORS.success,
    paused: COLORS.warning,
    completed: COLORS.primary,
  };
  return colors[status] || COLORS.textSecondary;
};

const getStatusText = (status) => {
  const texts = {
    pending: 'Pendente',
    in_progress: 'Em andamento',
    paused: 'Pausada',
    completed: 'Concluída',
  };
  return texts[status] || status;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  timerCard: {
    backgroundColor: COLORS.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  serviceTypeIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  activityDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  timerDisplay: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  timerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  detailButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  newActivityButton: {
    backgroundColor: COLORS.primary,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newActivityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  recentSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  activityItem: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityItemInfo: {
    flex: 1,
  },
  activityItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  activityItemSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activityItemRight: {
    alignItems: 'flex-end',
  },
  activityStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  activityStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  activityCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default DashboardScreen;
