import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

// Descriptions statiques basées sur les labels
const descriptions = {
  Acne: {
    description: 'Acne is a skin condition that occurs when your hair follicles become plugged with oil and dead skin cells, leading to whiteheads, blackheads, or pimples.',
    advice: 'Keep your face clean, avoid popping pimples, and use non-comedogenic makeup.',
    moreInfoUrl: 'https://www.google.nl/',
  },
  Eczema: {
    description: "Eczema, or atopic dermatitis, is a condition that makes your skin red and itchy. It's common in children but can occur at any age.",
    advice: 'Moisturize regularly, avoid harsh soaps and detergents, and consider using a humidifier in dry weather.',
    moreInfoUrl: 'https://www.google.nl/',
  },
  Rosacea: {
    description: 'Rosacea is a common skin condition that causes redness and visible blood vessels in your face. It may also produce small, red, pus-filled bumps.',
    advice: 'Avoid triggers like hot drinks, spicy foods, and alcohol. Use gentle skin care products and consider medical therapies if symptoms persist.',
    moreInfoUrl: 'https://www.google.nl/',
  },
  'Actinic Keratosis': {
    description: 'Actinic Keratosis is a rough, scaly patch on your skin that develops from years of exposure to the sun, and can sometimes progress to skin cancer.',
    advice: 'Seek shade, wear sun-protective clothing, and apply sunscreen regularly.',
    moreInfoUrl: 'https://www.google.nl/',
  },
  'Basal Cell Carcinoma': {
    description: 'Basal Cell Carcinoma is a type of skin cancer that begins in the basal cells. It often manifests as a slightly transparent bump on the sun-exposed skin.',
    advice: 'Consult a dermatologist for potential treatment options such as surgical removal or topical treatments.',
    moreInfoUrl: 'https://www.google.nl/',
  },
};

const HistoryScreen = ({ navigation }) => {
  const [captures, setCaptures] = useState([]);
  const { userToken, setIsLoading } = useContext(AuthContext);

  useEffect(() => {
    fetchCaptures();
  }, []);

  const fetchCaptures = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/getCaptures`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setIsLoading(false);
      setCaptures(response.data);
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to fetch captures:', error);
    }
  };

  const handleDelete = async (captureId) => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/deleteCapture/${captureId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setIsLoading(false);
      fetchCaptures();  // Refresh the list after deletion
      Alert.alert('Success', 'Capture deleted successfully');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to delete capture');
      console.error('Failed to delete capture:', error);
    }
  };

  const renderItem = ({ item }) => {
    const imageUrl = `${BASE_URL}/${item.path.replace(/\\/g, '/')}`;
    const itemDescription = descriptions[item.label]?.description || "Description not available.";

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.description} numberOfLines={2}>{itemDescription}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteIcon}>
            <Icon name="cancel" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={captures}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff'
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginRight: 10
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',  // Important pour positionner absolument l'icône
  },
  label: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold'
  },
  description: {
    fontSize: 16,
    color: '#666'
  },
  deleteIcon: {
    position: 'absolute', // Utilisation de position absolue
    right: 0,            // Aligner à droite
    top: '10%',          // Centrer verticalement
    marginTop: -12,      // Ajustement pour centrer l'icône
  }
});


export default HistoryScreen;