import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivities } from '../context/ActivityContext';
import { COLORS } from '../constants';
import { formatTime, calculateElapsedTime, formatCurrency, formatDate, calculateTotalTime } from '../utils/timer';

const ActivityDetailScreen = ({ route, navigation }) => {
  const { activityId } = route.params;
  const { activities, updateActivity, pauseActivity, resumeActivity, completeActivity, deleteActivity } = useActivities();
  const [activity, setActivity] = useState(activities.find(a => a.id === activityId));
  const [elapsedTime, setElapsedTime] = useState(0);
  const [solutions, setSolutions] = useState(activity?.solutions || '');
  const [issues, setIssues] = useState(activity?.issues || '');
  const [materials, setMaterials] = useState(activity?.materials || []);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState('');
  const [newMaterialCost, setNewMaterialCost] = useState('');

  useEffect(() => {
    const updatedActivity = activities.find(a => a.id === activityId);
    setActivity(updatedActivity);
    if (updatedActivity) {
      setSolutions(updatedActivity.solutions || '');
      setIssues(updatedActivity.issues || '');
      setMaterials(updatedActivity.materials || []);
    }
  }, [activities, activityId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activity && activity.status === 'in_progress') {
        setElapsedTime(calculateElapsedTime(activity));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activity]);

  const handlePauseResume = async () => {
    if (!activity) return;
    
    if (activity.status === 'in_progress') {
      await pauseActivity(activity.id);
    } else if (activity.status === 'paused') {
      await resumeActivity(activity.id);
    }
  };

  const handleComplete = async () => {
    if (!activity) return;

    await updateActivity(activity.id, {
      solutions,
      issues,
      materials,
    });

    await completeActivity(activity.id);
    Alert.alert('Sucesso', 'Atividade concluída!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja apagar esta atividade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar', 
          style: 'destructive',
          onPress: async () => {
            await deleteActivity(activityId);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const addMaterial = () => {
    if (!newMaterialName.trim()) {
      Alert.alert('Erro', 'Digite o nome do material');
      return;
    }

    const newMaterial = {
      id: Date.now().toString(),
      name: newMaterialName,
      quantity: parseFloat(newMaterialQty) || 1,
      cost: parseFloat(newMaterialCost) || 0,
    };

    setMaterials([...materials, newMaterial]);
    setNewMaterialName('');
    setNewMaterialQty('');
    setNewMaterialCost('');
  };

  const removeMaterial = (id) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const saveDetails = async () => {
    if (!activity) return;
    await updateActivity(activity.id, { solutions, issues, materials });
    Alert.alert('Sucesso', 'Detalhes salvos!');
  };

  if (!activity) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Atividade não encontrada</Text>
      </SafeAreaView>
    );
  }

  const totalTime = activity.status === 'completed' ? calculateTotalTime(activity) : elapsedTime;
  const materialsCost = materials.reduce((sum, m) => sum + (m.cost * m.quantity), 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Atividade</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <View style={styles.timerHeader}>
            <View style={styles.serviceBadge}>
              <Text style={styles.serviceIcon}>{getServiceIcon(activity.serviceType)}</Text>
              <Text style={styles.serviceLabel}>{getServiceLabel(activity.serviceType)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) }]}>
              <Text style={styles.statusText}>{getStatusText(activity.status)}</Text>
            </View>
          </View>

          <Text style={styles.description}>{activity.description}</Text>

          {activity.clientName && (
            <View style={styles.clientInfo}>
              <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.clientText}>{activity.clientName}</Text>
            </View>
          )}

          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(totalTime)}</Text>
          </View>

          {activity.status !== 'completed' && (
            <View style={styles.timerActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.pauseButton]}
                onPress={handlePauseResume}
              >
                <Ionicons 
                  name={activity.status === 'in_progress' ? 'pause' : 'play'} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.actionButtonText}>
                  {activity.status === 'in_progress' ? 'Pausar' : 'Continuar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleComplete}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Informações */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Criado em:</Text>
            <Text style={styles.infoValue}>{formatDate(activity.createdAt)}</Text>
          </View>

          {activity.startedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Iniciado em:</Text>
              <Text style={styles.infoValue}>{formatDate(activity.startedAt)}</Text>
            </View>
          )}

          {activity.completedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Concluído em:</Text>
              <Text style={styles.infoValue}>{formatDate(activity.completedAt)}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prioridade:</Text>
            <Text style={[styles.infoValue, { color: getPriorityColor(activity.priority) }]}>
              {getPriorityLabel(activity.priority)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Taxa horária:</Text>
            <Text style={styles.infoValue}>{formatCurrency(activity.hourlyRate)}/hora</Text>
          </View>

          {activity.estimatedBudget && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Orçamento estimado:</Text>
              <Text style={styles.infoValue}>{formatCurrency(activity.estimatedBudget)}</Text>
            </View>
          )}

          {activity.totalCost && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Custo total:</Text>
              <Text style={[styles.infoValue, styles.costValue]}>{formatCurrency(activity.totalCost)}</Text>
            </View>
          )}
        </View>

        {/* Soluções Aplicadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soluções Aplicadas</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Descreva as soluções aplicadas..."
            value={solutions}
            onChangeText={setSolutions}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={activity.status !== 'completed'}
          />
        </View>

        {/* Avarias Encontradas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avarias Encontradas</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Descreva as avarias encontradas..."
            value={issues}
            onChangeText={setIssues}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={activity.status !== 'completed'}
          />
        </View>

        {/* Materiais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiais Utilizados</Text>
          
          {materials.map((material) => (
            <View key={material.id} style={styles.materialItem}>
              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{material.name}</Text>
                <Text style={styles.materialDetails}>
                  Qtd: {material.quantity} × {formatCurrency(material.cost)} = {formatCurrency(material.cost * material.quantity)}
                </Text>
              </View>
              {activity.status !== 'completed' && (
                <TouchableOpacity onPress={() => removeMaterial(material.id)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {activity.status !== 'completed' && (
            <View style={styles.addMaterialForm}>
              <TextInput
                style={styles.materialInput}
                placeholder="Nome do material"
                value={newMaterialName}
                onChangeText={setNewMaterialName}
                placeholderTextColor={COLORS.textSecondary}
              />
              <TextInput
                style={[styles.materialInput, styles.qtyInput]}
                placeholder="Qtd"
                value={newMaterialQty}
                onChangeText={setNewMaterialQty}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.materialInput, styles.costInput]}
                placeholder="Custo"
                value={newMaterialCost}
                onChangeText={setNewMaterialCost}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.addMaterialButton} onPress={addMaterial}>
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.materialsTotal}>
            <Text style={styles.materialsTotalLabel}>Total materiais:</Text>
            <Text style={styles.materialsTotalValue}>{formatCurrency(materialsCost)}</Text>
          </View>
        </View>

        {/* Histórico de Pausas */}
        {activity.pauses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico de Pausas</Text>
            {activity.pauses.map((pause, index) => (
              <View key={index} style={styles.pauseItem}>
                <Ionicons name="pause-circle" size={20} color={COLORS.warning} />
                <Text style={styles.pauseText}>
                  {formatDate(pause.start)} - {pause.end ? formatDate(pause.end) : 'Em andamento'}
                </Text>
                {pause.end && (
                  <Text style={styles.pauseDuration}>
                    ({Math.floor((pause.end - pause.start) / 1000 / 60)} min)
                  </Text>
                )}
              </View>
            ))}
            <View style={styles.totalPaused}>
              <Text style={styles.totalPausedLabel}>Total pausado:</Text>
              <Text style={styles.totalPausedValue}>{formatTime(Math.floor(activity.totalPausedTime / 1000))}</Text>
            </View>
          </View>
        )}

        {/* Botão Salvar */}
        {activity.status !== 'completed' && (
          <TouchableOpacity style={styles.saveButton} onPress={saveDetails}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Salvar Detalhes</Text>
          </TouchableOpacity>
        )}
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

const getPriorityColor = (priority) => {
  const colors = {
    low: COLORS.success,
    medium: COLORS.warning,
    high: COLORS.danger,
    urgent: '#D32F2F',
  };
  return colors[priority] || COLORS.textSecondary;
};

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente',
  };
  return labels[priority] || priority;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  serviceIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  serviceLabel: {
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
  description: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  timerDisplay: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
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
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.card,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  costValue: {
    color: COLORS.success,
    fontSize: 16,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  textArea: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  materialDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  addMaterialForm: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  materialInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyInput: {
    flex: 0.5,
  },
  costInput: {
    flex: 0.7,
  },
  addMaterialButton: {
    padding: 8,
  },
  materialsTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  materialsTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  materialsTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  pauseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  pauseText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  pauseDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  totalPaused: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalPausedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalPausedValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActivityDetailScreen;
