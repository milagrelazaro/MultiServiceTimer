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
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants';

const SETTINGS_KEY = '@multiservicetimer_settings';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    userName: '',
    notificationsEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    }
  };

  const handleNotificationToggle = () => {
    const newSettings = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    saveSettings(newSettings);
  };

  const handleHelp = () => {
    Alert.alert('Ajuda', 'Versão 1.0.0\n\nContacte: support@multiservicetimer.com');
  };

  const handleAbout = () => {
    Alert.alert('Sobre', 'MultiService Timer v1.0.0\n\nUm aplicativo para gerir atividades de serviço.');
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da aplicação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => {
        AsyncStorage.clear();
        Alert.alert('Sessão terminada', 'Todos os dados foram limpos');
      }},
    ]);
  };

  const settingsOptions = [
    { icon: 'person-outline', title: 'Perfil', description: 'Gerir perfil do utilizador', action: () => Alert.alert('Perfil', `Nome: ${settings.userName || 'Não definido'}\n\nEdite seu nome abaixo`) },
    { icon: 'notifications-outline', title: 'Notificações', description: settings.notificationsEnabled ? 'Ativadas' : 'Desativadas', action: handleNotificationToggle, isToggle: true, toggleValue: settings.notificationsEnabled },
    { icon: 'help-circle-outline', title: 'Ajuda', description: 'FAQ e suporte', action: handleHelp },
    { icon: 'information-circle-outline', title: 'Sobre', description: 'Versão 1.0.0', action: handleAbout },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        <View style={styles.settingsList}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.settingItem} onPress={option.action}>
              <View style={styles.settingLeft}>
                <Ionicons name={option.icon} size={24} color={COLORS.primary} />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingDescription}>{option.description}</Text>
                </View>
              </View>
              {option.isToggle ? (
                <Switch
                  value={option.toggleValue}
                  onValueChange={option.action}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={option.toggleValue ? COLORS.primary : COLORS.textSecondary}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Perfil Section */}
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              value={settings.userName}
              onChangeText={(text) => saveSettings({ ...settings, userName: text })}
              placeholder="Digite seu nome"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsList: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 24,
  },
  profileSection: {
    padding: 16,
  },
  inputContainer: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
});

export default SettingsScreen;
