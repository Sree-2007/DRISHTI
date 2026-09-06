import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Confetti from 'react-native-confetti';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        try {
          const response = await api.get('/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching profile:', error);
          Alert.alert('Error', 'Failed to load profile. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        Alert.alert('No token', 'You are not logged in. Please log in.');
        navigation.replace('Login'); // Assuming you have a login screen
      }
    })();
  }, []);

  const celebrate = () => {
    setConfettiTrigger((prev) => prev + 1);
  };

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
        <Text>No user data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Confetti
        numberOfParticles={100}
        explosionConfettiTrigger={confettiTrigger}
        gravity={0.3}
        followParticle={false}
        particleSize={10}
        maxSize={30}
        colors={['#e94e77', '#a864fd', '#5cedc3', '#ff9f43', '#ff6b9d', '#c75bfd']}
      />
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={80} color="#3498db" />
        <Text style={styles.username}>{user.username}</Text>
        <TouchableOpacity onPress={celebrate} style={styles.celebrateButton}>
          <Text style={styles.celebrateText}>Celebrate!</Text>
        </TouchableOpacity>
      </View>

      <View style={statsContainer}>
        <Text style={statsLabel}>Trust Score</Text>
        <Text style={statsValue}>{user.trustScore}</Text>
      </View>

      <View style={statsContainer}>
        <Text style={statsLabel}>Reports Submitted</Text>
        <Text style={statsValue}>{user.reportsSubmitted}</Text>
      </View>

      <View style={statsContainer}>
        <Text style={statsLabel}>Verified Reports</Text>
        <Text style={statsValue}>{user.verifiedReports}</Text>
      </View>

      <View style={statsContainer}>
        <Text style={statsLabel}>Reputation</Text>
        <Text style={statsValue}>{user.reputation}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2c3e50',
  },
  celebrateButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 20,
  },
  celebrateText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;