import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hazards, setHazards] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Fetch user token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Fetch nearby hazards from backend
        try {
          const response = await axios.get('http://localhost:5000/api/hazards/nearby', {
            params: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              radius: 10000 // 10km radius
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setHazards(response.data);
        } catch (error) {
          console.error('Error fetching hazards:', error);
          Alert.alert('Error', 'Failed to fetch nearby hazards');
        }
      }
    })();
  }, []);

  const handlePressMap = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    navigation.navigate('ReportHazard', { location: { latitude, longitude } });
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Button title="Try Again" onPress={() => { setErrorMsg(null); }} />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Getting location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handlePressMap}
      >
        <Marker
          coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
          title="Your Location"
        />
        {hazards.map((hazard, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: hazard.location.latitude, longitude: hazard.location.longitude }}
            title={hazard.type}
            description={hazard.description}
          />
        ))}
      </MapView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
});