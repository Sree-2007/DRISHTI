import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReportHazardScreen = ({ navigation, route }) => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(route.params.location || null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
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

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need your location to report a hazard.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });
  };

  const submitReport = async () => {
    if (!type || !description || !location) {
      Alert.alert('Missing information', 'Please fill in all fields and get your location.');
      return;
    }

    setUploading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');

      // Prepare form data for image upload
      const formData = new FormData();
      formData.append('type', type);
      formData.append('description', description);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);

      // If image is selected, append it to formData
      if (image) {
        // Extract file name from uri
        const fileName = image.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('photo', {
          uri: image,
          name: fileName,
          type,
        });
      }

      const response = await axios.post('http://localhost:5000/api/hazards', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'Hazard reported successfully!');
      // Clear form
      setType('');
      setDescription('');
      setImage(null);
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit hazard report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report a Hazard</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Hazard Type (e.g., Pothole, Accident)"
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

      <View style={styles.inputContainer}>
        <Button title="Get Current Location" onPress={getCurrentLocation} />
        {location && (
          <Text style={styles.locationText}>
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Button title="Pick Image" onPress={pickImage} />
        {image && (
          <Image source={{ uri: image }} style={styles.previewImage} />
        )}
      </View>

      <Button
        title={uploading ? 'Uploading...' : 'Submit Report'}
        onPress={submitReport}
        disabled={uploading}
      />

      <Button title="Back to Map" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default ReportHazardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  locationText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  previewImage: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
});