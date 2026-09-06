import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data);
        } else {
          Alert.alert('No token found', 'Please log in to view your profile.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available</Text>
        <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      {user.avatar && (
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
      )}
      <Text style={styles.info}>Name: {user.name}</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      <Text style={styles.info}>Phone: {user.phone}</Text>
      <Button title="Edit Profile" onPress={() => { /* Navigate to edit profile */ }} />
      <Button title="Logout" onPress={async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
        navigation.replace('Home'); // Assuming we have a login screen, but for now just go to home
      }} />
      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

export default ProfileScreen;

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
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginVertical: 5,
  },
});