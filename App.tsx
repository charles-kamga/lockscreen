import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

const App = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [sensorType, setSensorType] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier la disponibilité du capteur au démarrage
    checkBiometrics();
  }, []);

  /**
   * Vérifie si le matériel biométrique (empreinte, visage) est disponible
   * et configuré sur l'appareil.
   */
  const checkBiometrics = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available && biometryType === BiometryTypes.Fingerprint) {
        setSensorType('Empreinte Digitale');
      } else if (available && biometryType === BiometryTypes.FaceID) {
        setSensorType('FaceID');
      } else if (available && biometryType === BiometryTypes.Biometrics) {
        setSensorType('Biométrie');
      } else {
        setSensorType('Non disponible');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification biométrique:', error);
      setSensorType('Erreur');
    }
  };

  /**
   * Déclenche la fenêtre d'authentification système.
   * Cette fonction utilise la méthode 'simplePrompt' pour afficher
   * la boîte de dialogue native Android/iOS.
   */
  const handleBiometricAuth = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authentification requise',
        cancelButtonText: 'Annuler',
      });

      if (success) {
        setIsLocked(false);
        Alert.alert('Succès', 'Déverrouillage réussi !');
      } else {
        Alert.alert('Échec', 'L\'utilisateur a annulé l\'authentification');
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'authentification');
    }
  };

  // 1. Écran de Verrouillage
  if (isLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockBox}>
          <Text style={styles.title}>🔒 Application Verrouillée</Text>
          <Text style={styles.subtitle}>Capteur détecté : {sensorType}</Text>
          
          <TouchableOpacity 
            style={[styles.button, sensorType === 'Non disponible' && styles.buttonDisabled]} 
            onPress={handleBiometricAuth}
            disabled={sensorType === 'Non disponible'}
          >
            <Text style={styles.buttonText}>UTILISER L'EMPREINTE</Text>
          </TouchableOpacity>

          {sensorType === 'Non disponible' && (
            <Text style={styles.warning}>
              Vérifiez que vous avez configuré une empreinte dans les paramètres de l'émulateur.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // 2. L'application une fois déverrouillée
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>🔓 Bienvenue !</Text>
      <Text style={styles.infoText}>Le système de déverrouillage biométrique fonctionne.</Text>
      
      <TouchableOpacity style={styles.retryButton} onPress={() => setIsLocked(true)}>
        <Text style={styles.retryButtonText}>REVERROUILLER</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  lockBox: {
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 8,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  warning: {
    marginTop: 20,
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  infoText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  retryButton: {
    marginTop: 40,
    padding: 10,
  },
  retryButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  }
});

export default App;
