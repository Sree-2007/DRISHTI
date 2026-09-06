import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('userToken');
      try {
        const response = await api.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        Alert.alert('Error', 'Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => /* handle press */}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={item.type === 'verification' ? 'check-circle' : 'alert-circle'}
                  size={24}
                  color={item.type === 'verification' ? '#27ae60' : '#e74c3c'}
                />
              </View>
              <View style={styles.messageContainer}>
                <Text style={styles.messageTitle}>{item.title}</Text>
                <Text style={styles.messageBody}>{item.message}</Text>
                <Text style={styles.messageTime}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#7f8c8d',
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 15,
    padding: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  messageContainer: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#2c3e50',
  },
  messageBody: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  messageTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default NotificationsScreen;