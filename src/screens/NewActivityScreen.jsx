import React, { useState, useEffect } from 'react';
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
  Platform,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useActivities } from '../context/ActivityContext';
import { COLORS, SERVICE_TYPES, PRIORITIES, STORAGE_KEYS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const NewActivityScreen = ({ navigation }) => {
  const { addActivity } = useActivities();
  const [serviceType, setServiceType] = useState('eletrica');
  const [priority, setPriority] = useState('medium');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [clients, setClients] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  const loadClients = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (stored) {
        setClients(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreate = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, descreva a atividade');
      return;
    }

    await addActivity({
      technicianId: 'tech_1', // TODO: Get from auth
      serviceType,
      description,
      priority,
      clientName: clientName.trim() || undefined,
      estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
      status: 'in_progress',
      startedAt: Date.now(),
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
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
                  onPress={() => setPriority(prio.value)}
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
            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowClientModal(true)}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.input, !clientName && styles.placeholderText]}>
                {clientName || 'Selecionar cliente'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
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
            <Text style={styles.sectionTitle}>Orçamento (MZN)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Defina o valor do orçamento"
                value={estimatedBudget}
                onChangeText={setEstimatedBudget}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
              />
              <Text style={styles.currencySymbol}>MZN</Text>
            </View>
          </View>

          {/* Botão Criar */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Criar e Iniciar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Seleção de Cliente */}
      <Modal
        visible={showClientModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Cliente</Text>
              <TouchableOpacity onPress={() => setShowClientModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente..."
                value={clientSearchQuery}
                onChangeText={setClientSearchQuery}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <FlatList
              data={clients.filter(client =>
                client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                client.phone.includes(clientSearchQuery)
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clientItem}
                  onPress={() => {
                    setClientName(item.name);
                    setShowClientModal(false);
                    setClientSearchQuery('');
                  }}
                >
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientAvatarText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.clientDetails}>
                    <Text style={styles.clientName}>{item.name}</Text>
                    <Text style={styles.clientPhone}>{item.phone}</Text>
                  </View>
                  {clientName === item.name && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>
                    {clientSearchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                  </Text>
                </View>
              }
              style={styles.clientList}
            />
          </View>
        </View>
      </Modal>
    </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  placeholderText: {
    color: COLORS.textSecondary,
  },
  currencySymbol: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clientList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clientAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
