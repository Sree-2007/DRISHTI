import React from 'react';
import { View, Text, StyleSheet, Button, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Load settings from AsyncStorage (simplified)
  useEffect(() => {
    (async () => {
      try {
        const notifications = await AsyncStorage.getItem('notificationsEnabled');
        const mode = await AsyncStorage.getItem('darkMode');
        setNotificationsEnabled(notifications === 'true');
        setDarkMode(mode === 'true');
      } catch (e) {
        // If error, use defaults
      }
    })();
  }, []);

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
      await AsyncStorage.setItem('darkMode', darkMode.toString());
      Alert.alert('Settings saved');
    } catch (e) {
      Alert.alert('Failed to save settings');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingRow}>
        <Text>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <View style={styles.settingRow}>
        <Text>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      <Button title="Save Settings" onPress={saveSettings} />
      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  },
});