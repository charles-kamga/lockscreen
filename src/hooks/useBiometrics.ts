import { useState, useEffect, useCallback } from 'react';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert } from 'react-native';

// Initialisation du module natif de biométrie
const rnBiometrics = new ReactNativeBiometrics();

/**
 * Hook personnalisé pour encapsuler l'API biométrique native (FaceID / TouchID / Empreinte digitale).
 */
export const useBiometrics = () => {
  // Le type de capteur détecté sur l'appareil (ex: 'FaceID', 'Empreinte Digitale', ou null)
  const [sensorType, setSensorType] = useState<string | null>(null);
  
  // Garde-fou anti-spam : évite d'ouvrir le prompt système plusieurs fois si l'utilisateur double-clique
  const [isBiometricPending, setIsBiometricPending] = useState(false);

  /**
   * Vérifie la disponibilité des capteurs biométriques sur l'appareil.
   */
  const checkBiometrics = useCallback(async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      if (available && biometryType === BiometryTypes.Fingerprint) {
        setSensorType('Empreinte Digitale');
      } else if (available && biometryType === BiometryTypes.FaceID) {
        setSensorType('FaceID');
      } else if (available && biometryType === BiometryTypes.Biometrics) {
        setSensorType('Biométrie');
      } else {
        setSensorType(null); // Aucun capteur ou capteur désactivé
      }
    } catch (error) {
      console.error('Erreur lors de la vérification biométrique:', error);
      setSensorType(null);
    }
  }, []);

  // Détecte la présence de capteurs au chargement du hook
  useEffect(() => {
    checkBiometrics();
  }, [checkBiometrics]);

  /**
   * Lance l'authentification biométrique (affiche le prompt natif d'empreinte ou de visage).
   * 
   * @param onSuccess Callback en cas de succès (empreinte correcte)
   * @param onFailure Callback en cas d'échec (empreinte incorrecte ou annulée par l'utilisateur)
   */
  const authenticate = useCallback(async (
    onSuccess: () => void,
    onFailure: () => void
  ) => {
    // Si une demande est déjà en cours, on ignore la requête (sécurité anti-double clic)
    if (isBiometricPending) return;

    setIsBiometricPending(true);
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authentification requise',
        cancelButtonText: '❌ Mauvais doigt ? Appuyer ici',
      });
      
      setIsBiometricPending(false);
      if (success) {
        onSuccess();
      } else {
        onFailure(); // Empreinte incorrecte
      }
    } catch (error: any) {
      // ERREUR SYSTÈME (Exemple : capteur indisponible, émulateur non configuré...)
      // Règle de sécurité : On n'incrémente pas le compteur d'échecs (pas de pénalité brute-force)
      // car il s'agit d'une erreur matérielle et non d'une tentative de piratage.
      setIsBiometricPending(false);
      const msg: string = error?.message ?? String(error);
      console.error("Erreur système biométrique:", msg);
      
      Alert.alert(
        '⚠️ Capteur indisponible',
        'Impossible de démarrer la biométrie.\n\n' +
        'Sur émulateur : allez dans Settings › Security › Fingerprint ' +
        'et enregistrez une empreinte, puis simulez-la avec :\n' +
        '  adb -e emu fingerprint touch 1',
      );
    }
  }, [isBiometricPending]);

  return {
    sensorType,
    isBiometricPending,
    authenticate,
    checkBiometrics,
  };
};
