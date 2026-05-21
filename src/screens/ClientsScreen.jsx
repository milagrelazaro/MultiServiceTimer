import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { STORAGE_KEYS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClientsScreen = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

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

  const saveClients = async (newClients) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(newClients));
      setClients(newClients);
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name.trim() || !newClient.phone.trim()) {
      Alert.alert('Erro', 'Nome e telefone são obrigatórios');
      return;
    }

    const client = {
      id: Date.now().toString(),
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      email: newClient.email.trim() || undefined,
      address: newClient.address.trim() || undefined,
      notes: newClient.notes.trim() || undefined,
      createdAt: Date.now(),
    };

    await saveClients([client, ...clients]);
    setModalVisible(false);
    setNewClient({ name: '', phone: '', email: '', address: '', notes: '' });
  };

  const handleDeleteClient = (id) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja apagar este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await saveClients(clients.filter(c => c.id !== id));
          },
        },
      ]
    );
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clientes</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Clients List */}
        <View style={styles.clientsSection}>
          {filteredClients.map((client) => (
            <View key={client.id} style={styles.clientCard}>
              <View style={styles.clientInfo}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>
                    {client.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <View style={styles.clientContact}>
                    <Ionicons name="call-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.clientPhone}>{client.phone}</Text>
                  </View>
                  {client.email && (
                    <View style={styles.clientContact}>
                      <Ionicons name="mail-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.clientEmail}>{client.email}</Text>
                    </View>
                  )}
                  {client.address && (
                    <View style={styles.clientContact}>
                      <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.clientAddress}>{client.address}</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteClient(client.id)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ))}

          {filteredClients.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </Text>
              {!searchQuery && (
                <Text style={styles.emptySubtext}>
                  Toque no + para adicionar seu primeiro cliente
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Client Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Cliente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do cliente"
                  value={newClient.name}
                  onChangeText={(text) => setNewClient({ ...newClient, name: text })}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+258 84 123 4567"
                  value={newClient.phone}
                  onChangeText={(text) => setNewClient({ ...newClient, phone: text })}
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="cliente@email.com"
                  value={newClient.email}
                  onChangeText={(text) => setNewClient({ ...newClient, email: text })}
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Endereço (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Endereço completo"
                  value={newClient.address}
                  onChangeText={(text) => setNewClient({ ...newClient, address: text })}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notas (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Observações sobre o cliente..."
                  value={newClient.notes}
                  onChangeText={(text) => setNewClient({ ...newClient, notes: text })}
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddClient}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    padding: 8,
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
  clientsSection: {
    padding: 16,
    paddingTop: 0,
  },
  clientCard: {
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
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  clientContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  clientEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  clientAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
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
    textAlign: 'center',
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
    maxHeight: '90%',
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
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ClientsScreen;
