import React, { useState } from 'react';
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
import { formatCurrency, formatShortDate, formatTime, calculateTotalTime } from '../utils/timer';

const HistoryScreen = ({ navigation }) => {
  const { activities } = useActivities();
  const [filter, setFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.status !== filter) return false;
    if (serviceFilter !== 'all' && activity.serviceType !== serviceFilter) return false;
    return true;
  });

  const completedActivities = activities.filter(a => a.status === 'completed');
  const totalRevenue = completedActivities.reduce((sum, a) => sum + (a.totalCost || 0), 0);
  const totalTime = completedActivities.reduce((sum, a) => sum + calculateTotalTime(a), 0);

  const handleExport = () => {
    const csvContent = "Data,Tipo de Serviço,Descrição,Status,Custo Total,Tempo Total\n" +
      activities.map(a => {
        const date = formatShortDate(a.createdAt);
        const serviceType = a.serviceType || 'N/A';
        const description = a.description.replace(/,/g, ' ');
        const status = a.status;
        const cost = a.totalCost || 0;
        const time = calculateTotalTime(a);
        return `${date},${serviceType},${description},${status},${cost.toFixed(2)},${time}`;
      }).join('\n');

    Alert.alert('Exportar', 'Dados copiados para a área de transferência!');
    // Em uma implementação real, você usaria Sharing API para exportar
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Histórico</Text>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>Exportar</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
            <Text style={styles.statValue}>{completedActivities.length}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={32} color={COLORS.warning} />
            <Text style={styles.statValue}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.statLabel}>Faturação</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
            <Text style={styles.statLabel}>Tempo Total</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Filtros</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'in_progress' && styles.filterChipActive]}
              onPress={() => setFilter('in_progress')}
            >
              <Text style={[styles.filterChipText, filter === 'in_progress' && styles.filterChipTextActive]}>
                Em andamento
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'paused' && styles.filterChipActive]}
              onPress={() => setFilter('paused')}
            >
              <Text style={[styles.filterChipText, filter === 'paused' && styles.filterChipTextActive]}>
                Pausadas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'completed' && styles.filterChipActive]}
              onPress={() => setFilter('completed')}
            >
              <Text style={[styles.filterChipText, filter === 'completed' && styles.filterChipTextActive]}>
                Concluídas
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, serviceFilter === 'all' && styles.filterChipActive]}
              onPress={() => setServiceFilter('all')}
            >
              <Text style={[styles.filterChipText, serviceFilter === 'all' && styles.filterChipTextActive]}>
                Todos serviços
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, serviceFilter === 'eletrica' && styles.filterChipActive]}
              onPress={() => setServiceFilter('eletrica')}
            >
              <Text style={[styles.filterChipText, serviceFilter === 'eletrica' && styles.filterChipTextActive]}>
                ⚡ Elétrica
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, serviceFilter === 'frio' && styles.filterChipActive]}
              onPress={() => setServiceFilter('frio')}
            >
              <Text style={[styles.filterChipText, serviceFilter === 'frio' && styles.filterChipTextActive]}>
                ❄️ Frio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, serviceFilter === 'redes' && styles.filterChipActive]}
              onPress={() => setServiceFilter('redes')}
            >
              <Text style={[styles.filterChipText, serviceFilter === 'redes' && styles.filterChipTextActive]}>
                🌐 Redes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, serviceFilter === 'cameras' && styles.filterChipActive]}
              onPress={() => setServiceFilter('cameras')}
            >
              <Text style={[styles.filterChipText, serviceFilter === 'cameras' && styles.filterChipTextActive]}>
                📹 Câmeras
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesSection}>
          <Text style={styles.activitiesTitle}>
            Atividades ({filteredActivities.length})
          </Text>

          {filteredActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}
            >
              <View style={styles.activityCardLeft}>
                <View style={styles.activityIconContainer}>
                  <Text style={styles.activityIcon}>{getServiceIcon(activity.serviceType)}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {activity.description}
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    {getServiceLabel(activity.serviceType)}
                    {activity.clientName && ` • ${activity.clientName}`}
                  </Text>
                  <Text style={styles.activityDate}>
                    {formatShortDate(activity.createdAt)}
                  </Text>
                </View>
              </View>
              <View style={styles.activityCardRight}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(activity.status)}</Text>
                </View>
                {activity.totalCost && (
                  <Text style={styles.activityCost}>{formatCurrency(activity.totalCost)}</Text>
                )}
                {activity.status === 'completed' && (
                  <Text style={styles.activityTime}>
                    {formatTime(calculateTotalTime(activity))}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {filteredActivities.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Nenhuma atividade encontrada</Text>
              <Text style={styles.emptySubtext}>Tente ajustar os filtros</Text>
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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  filtersSection: {
    padding: 16,
    paddingTop: 0,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  activitiesSection: {
    padding: 16,
    paddingTop: 0,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  activityCard: {
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
  activityCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  activityCardRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  activityCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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

export default HistoryScreen;
