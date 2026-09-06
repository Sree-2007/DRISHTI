import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ReportHazardScreen = ({ navigation }) => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      await requestLocationPermission();
    })();
  }, []);

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to tag your report with location.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const submitReport = async () => {
    if (!type || !description || !image) {
      Alert.alert('Missing information', 'Please fill in all fields and select an image.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('description', description);
      formData.append('location', JSON.stringify(location));
      formData.append('image', {
        uri: image,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      Alert.alert('Success', 'Report submitted successfully!');
      setType('');
      setDescription('');
      setImage(null);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report a Hazard</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Hazard Type (e.g., Pothole, Broken Light)"
          value={type}
          onChangeText={setType}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          minHeight={80}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Choose Image" onPress={pickImage} />
        {Platform.OS !== 'web' && (
          <Button title="Take Photo" onPress={takePhoto} />
        )}
      </View>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Get Current Location" onPress={requestLocationPermission} />
        {location && (
          <Text style={styles.locationText}>
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <Button
        title="Submit Report"
        onPress={submitReport}
        disabled={loading}
        color="#28a745"
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </Button>
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
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 15,
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  locationText: {
    marginTop: 5,
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default ReportHazardScreen;