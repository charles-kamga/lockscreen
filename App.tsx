import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { map, filter } from 'rxjs/operators';

/**
 * Initialisation du module de biométrie native.
 */
const rnBiometrics = new ReactNativeBiometrics();

/**
 * PARAMÈTRES DE SENSIBILITÉ DU MOUVEMENT
 * SHAKE_THRESHOLD : Force d'accélération minimale pour détecter une secousse.
 *                   Plus ce chiffre est bas, plus l'app est sensible.
 * SHAKE_TIMEOUT   : Délai en millisecondes entre deux secousses pour éviter
 *                   les doubles comptages accidentels.
 */
const SHAKE_THRESHOLD = 15;
const SHAKE_TIMEOUT = 800;

const App = () => {
  // --- ÉTATS (STATES) ---
  const [isLocked, setIsLocked] = useState(true);
  const [sensorType, setSensorType] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [requiredShakes, setRequiredShakes] = useState(0);
  const [isShakeMode, setIsShakeMode] = useState(false);
  
  // Référence pour stocker le timestamp de la dernière secousse
  const lastShakeTime = useRef(0);

  // --- INITIALISATION ---
  useEffect(() => {
    checkBiometrics();
    calculateShakes();
    // Configuration de la fréquence de lecture de l'accéléromètre (100ms)
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
  }, []);

  // --- LOGIQUE DE DÉTECTION DU MOUVEMENT ---
  useEffect(() => {
    let subscription: any;

    if (isLocked && isShakeMode) {
      // Souscription au flux de données de l'accéléromètre
      subscription = accelerometer
        .pipe(
          // Calcul de la norme du vecteur accélération (Force G totale)
          map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
          // On ne garde que les mouvements dépassant notre seuil de sensibilité
          filter(force => force > SHAKE_THRESHOLD)
        )
        .subscribe(force => {
          const now = Date.now();
          // Vérification du délai "anti-rebond" (timeout)
          if (now - lastShakeTime.current > SHAKE_TIMEOUT) {
            lastShakeTime.current = now;
            
            setShakeCount((prev) => {
              const next = prev + 1;
              // Si le nombre requis de secousses est atteint
              if (next >= requiredShakes) {
                // Petit délai visuel avant le déverrouillage
                setTimeout(() => {
                  setIsLocked(false);
                  setIsShakeMode(false);
                  Alert.alert('Succès', 'Déverrouillé par mouvement !');
                }, 300);
                return next;
              }
              return next;
            });
          }
        });
    }

    // Nettoyage de la souscription lors du démontage du composant
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isLocked, isShakeMode, requiredShakes]);

  /**
   * Calcule le nombre de secousses requis selon la règle mathématique :
   * Règle : (numéro_du_jour^2) % 5
   * Lundi = 1, Mardi = 2, ..., Dimanche = 7
   * Exception : Le Vendredi (5), l'application reste déverrouillée.
   */
  const calculateShakes = () => {
    const now = new Date();
    let day = now.getDay(); // 0 = Dimanche, 1 = Lundi, ...
    
    // Ajustement pour faire correspondre Lundi à 1 et Dimanche à 7
    const adjustedDay = day === 0 ? 7 : day;

    // Gestion de l'exception du Vendredi
    if (adjustedDay === 5) {
      setIsLocked(false);
      return;
    }

    // Calcul du modulo 5 sur le carré du numéro du jour
    const shakes = Math.pow(adjustedDay, 2) % 5;
    setRequiredShakes(shakes);
  };

  /**
   * Vérifie la disponibilité des capteurs biométriques sur l'appareil.
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
    }
  };

  /**
   * Déclenche l'authentification biométrique native (Empreinte/Visage).
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
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
    }
  };

  // --- RENDU : ÉCRAN DE VERROUILLAGE ---
  if (isLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockBox}>
          <Text style={styles.title}>🔒 Sécurisé</Text>
          
          {!isShakeMode ? (
            // Mode normal : Biométrie
            <>
              <Text style={styles.subtitle}>Capteur : {sensorType}</Text>
              <TouchableOpacity 
                style={[styles.button, sensorType === 'Non disponible' && styles.buttonDisabled]} 
                onPress={handleBiometricAuth}
                disabled={sensorType === 'Non disponible'}
              >
                <Text style={styles.buttonText}>UTILISER L'EMPREINTE</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shakeToggleButton} 
                onPress={() => setIsShakeMode(true)}
              >
                <Text style={styles.shakeToggleText}>UTILISER LE MOUVEMENT</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Mode de secours : Secousses
            <View style={styles.shakeArea}>
              <Text style={styles.shakeTitle}>Mode Secours</Text>
              <Text style={styles.shakeInstruction}>
                Bougez le téléphone fermement
              </Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{shakeCount} / {requiredShakes}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {setIsShakeMode(false); setShakeCount(0);}}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Retour</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDU : APPLICATION DÉVERROUILLÉE ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.welcomeText}>🔓 Bienvenue !</Text>
        <Text style={styles.infoText}>Le système de déverrouillage sécurisé est actif.</Text>
        
        <TouchableOpacity style={styles.retryButton} onPress={() => {
          setShakeCount(0);
          calculateShakes();
          setIsLocked(true);
        }}>
          <Text style={styles.retryButtonText}>REVERROUILLER L'APP</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES ---
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
    borderRadius: 25,
    elevation: 12,
    width: '85%',
    alignItems: 'center',
  },
  contentBox: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 15,
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
    letterSpacing: 1,
  },
  shakeToggleButton: {
    marginTop: 25,
    padding: 10,
  },
  shakeToggleText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  shakeArea: {
    alignItems: 'center',
    width: '100%',
  },
  shakeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 10,
  },
  shakeInstruction: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 25,
    fontSize: 15,
  },
  progressContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#FFF3E0',
  },
  progressText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E65100',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: '#999',
    fontWeight: '500',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  infoText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 60,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default App;
