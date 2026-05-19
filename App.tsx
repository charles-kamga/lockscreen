import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, Alert, Vibration } from 'react-native';
import { useAudio } from './src/hooks/useAudio';
import { useBiometrics } from './src/hooks/useBiometrics';
import { useLockout } from './src/hooks/useLockout';
import { useShakeDetection } from './src/hooks/useShakeDetection';
import { calculateRequiredShakes } from './src/utils/securityUtils';
import { MAX_ATTEMPTS } from './src/constants/security';
import { globalStyles } from './src/styles/globalStyles';
import LockedView from './src/components/LockedView';
import UnlockedView from './src/components/UnlockedView';


const App = () => {
  // --- ÉTATS GLOBAUX ---
  // Indique si le système est verrouillé (True par défaut)
  const [isLocked, setIsLocked] = useState(true);

  // Nombre de secousses requis calculé pour aujourd'hui
  const [requiredShakes, setRequiredShakes] = useState(0);

  // --- INITIALISATION DES SERVICES (CUSTOM HOOKS) ---

  // 1. Service Audio (gestion des fichiers mp3)
  const audio = useAudio();

  // 2. Service Biométrique (capteur d'empreintes / FaceID)
  const biometrics = useBiometrics();

  // 3. Service de Lockout (brute-force) couplé directement à la sirène d'alarme audio
  const lockout = useLockout({
    onAlarmStart: audio.playAlarm, // Lance la sirène en cas de blocage actif
    onAlarmStop: audio.stopAlarm,  // Arrête la sirène à la fin de la pénalité
  });

  // --- ACTIONS DE DÉVERROUILLAGE & ACTIONS ---

  /**
   * Action appelée en cas de déverrouillage réussi (biométrie correcte ou secousses complétées).
   */
  const handleSuccess = useCallback(() => {
    audio.playUnlock(); // Bip de succès
    Vibration.vibrate([0, 500]); // Vibration longue (500ms)

    // Délais visuel avant transition pour laisser l'utilisateur ressentir le succès
    setTimeout(() => {
      setIsLocked(false); // Bascule de l'écran principal
      lockout.resetAttempts(); // Remise à zéro des compteurs de sécurité
      Alert.alert('Succès', 'Déverrouillé !');
    }, 300);
  }, [audio, lockout]);

  /**
   * Action appelée en cas d'échec d'authentification.
   */
  const handleFailure = useCallback(() => {
    audio.playError(); // Bip d'erreur
    Vibration.vibrate([0, 200, 100, 200]); // Vibration brève saccadée
    lockout.registerFailure(); // Incrémentation de la pénalité de sécurité
  }, [audio, lockout]);

  // 4. Service de détection de secousses (couplé aux actions Succès / Échec)
  const shakeDetection = useShakeDetection({
    isLocked,
    isLockedOut: !!lockout.lockoutUntil,
    requiredShakes,
    onSuccess: handleSuccess,
    onFailure: handleFailure,
  });

  /**
   * Calcule dynamiquement les règles de secousses du jour.
   */
  const runCalculateShakes = useCallback(() => {
    const shakes = calculateRequiredShakes();
    if (shakes === null) {
      // Vendredi : accès libre directement
      setIsLocked(false);
    } else {
      setRequiredShakes(shakes);
    }
  }, []);

  // Détermine les règles de secousse dès le montage du composant
  useEffect(() => {
    runCalculateShakes();
  }, [runCalculateShakes]);

  /**
   * Déclenche l'authentification biométrique lors du clic sur le bouton.
   */
  const handleBiometricTrigger = useCallback(() => {
    if (lockout.lockoutUntil || biometrics.isBiometricPending) return;
    biometrics.authenticate(handleSuccess, handleFailure);
  }, [biometrics, lockout.lockoutUntil, handleSuccess, handleFailure]);

  /**
   * Reverrouille l'application de manière propre et sécurisée (réinitialisation complète).
   */
  const handleLock = useCallback(() => {
    lockout.resetAttempts(); // Remet les tentatives à 0
    runCalculateShakes();   // Recalcule les règles du jour
    setIsLocked(true);      // Bascule l'UI sur l'écran verrouillé
  }, [lockout, runCalculateShakes]);

  // --- RENDU GRAPHIQUE CONDITIONNEL ---
  return (
    <SafeAreaView style={globalStyles.container}>
      {isLocked ? (
        // ÉCRAN VERROUILLÉ (Reçoit tous ses états et déclencheurs en props)
        <LockedView
          sensorType={biometrics.sensorType}
          failedAttempts={lockout.failedAttempts}
          maxAttempts={MAX_ATTEMPTS}
          lockoutUntil={lockout.lockoutUntil}
          secondsRemaining={lockout.secondsRemaining}
          isBiometricPending={biometrics.isBiometricPending}
          isShakeMode={shakeDetection.isShakeMode}
          shakeCount={shakeDetection.shakeCount}
          requiredShakes={requiredShakes}
          handleBiometricAuth={handleBiometricTrigger}
          enterShakeMode={shakeDetection.enterShakeMode}
          exitShakeMode={shakeDetection.exitShakeMode}
        />
      ) : (
        // ÉCRAN D'ACCUEIL DÉVERROUILLÉ
        <UnlockedView onLock={handleLock} />
      )}
    </SafeAreaView>
  );
};

export default App;
