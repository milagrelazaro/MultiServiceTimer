import React, { useState } from 'react';
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
import { COLORS, SERVICE_TYPES, PRIORITIES, DEFAULT_HOURLY_RATES } from '../constants';
import { ServiceType, Priority } from '../types';

const NewActivityScreen = ({ navigation }: any) => {
  const { addActivity } = useActivities();
  const [serviceType, setServiceType] = useState<ServiceType>('eletrica');
  const [priority, setPriority] = useState<Priority>('medium');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');

  const handleCreate = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, descreva a atividade');
      return;
    }

    const hourlyRate = DEFAULT_HOURLY_RATES[serviceType];

    await addActivity({
      technicianId: 'tech_1', // TODO: Get from auth
      serviceType,
      description,
      priority,
      clientName: clientName.trim() || undefined,
      estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
      status: 'in_progress',
      startedAt: Date.now(),
      hourlyRate,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Nova Atividade</Text>
          <Text style={styles.subtitle}>Preencha os detalhes da atividade</Text>

          {/* Tipo de Serviço */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Serviço</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceTypesScroll}>
              {SERVICE_TYPES.map((service) => (
                <TouchableOpacity
                  key={service.value}
                  style={[
                    styles.serviceTypeCard,
                    serviceType === service.value && styles.serviceTypeCardActive,
                    { borderColor: serviceType === service.value ? service.color : COLORS.border }
                  ]}
                  onPress={() => setServiceType(service.value)}
                >
                  <Text style={styles.serviceTypeIcon}>{service.icon}</Text>
                  <Text style={[
                    styles.serviceTypeLabel,
                    serviceType === service.value && styles.serviceTypeLabelActive
                  ]}>
                    {service.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Prioridade */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prioridade</Text>
            <View style={styles.prioritiesContainer}>
              {PRIORITIES.map((prio) => (
                <TouchableOpacity
                  key={prio.value}
                  style={[
                    styles.priorityCard,
                    priority === prio.value && styles.priorityCardActive,
                    { backgroundColor: priority === prio.value ? prio.color : COLORS.card }
                  ]}
                  onPress={() => setPriority(prio.value as Priority)}
                >
                  <Text style={[
                    styles.priorityLabel,
                    priority === prio.value && styles.priorityLabelActive
                  ]}>
                    {prio.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cliente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cliente (opcional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome do cliente"
                value={clientName}
                onChangeText={setClientName}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição do Problema *</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Descreva o problema ou serviço a ser realizado..."
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Orçamento Estimado */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orçamento Estimado (opcional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={estimatedBudget}
                onChangeText={setEstimatedBudget}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
              />
              <Text style={styles.currencySymbol}>MZN</Text>
            </View>
          </View>

          {/* Taxa Horária */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Taxa horária: {DEFAULT_HOURLY_RATES[serviceType].toLocaleString('pt-MZ')} MZN/hora
            </Text>
          </View>

          {/* Botão Criar */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Criar e Iniciar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  serviceTypesScroll: {
    flexDirection: 'row',
  },
  serviceTypeCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceTypeCardActive: {
    backgroundColor: COLORS.background,
  },
  serviceTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  serviceTypeLabelActive: {
    color: COLORS.primary,
  },
  prioritiesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityCardActive: {
    borderColor: COLORS.text,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  priorityLabelActive: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  currencySymbol: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 8,
  },
  textAreaContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  textArea: {
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
    flex: 1,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NewActivityScreen;
