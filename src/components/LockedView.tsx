import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface LockedViewProps {
  /** Le type de capteur biométrique disponible ('FaceID', 'Empreinte Digitale', ou null) */
  sensorType: string | null;
  /** Le nombre actuel de tentatives d'authentification échouées */
  failedAttempts: number;
  /** Le nombre maximal de tentatives autorisées avant blocage */
  maxAttempts: number;
  /** Timestamp indiquant la fin de la pénalité brute-force (null si non bloqué) */
  lockoutUntil: number | null;
  /** Le nombre de secondes restantes de pénalité à afficher */
  secondsRemaining: number;
  /** Indique si le prompt d'authentification biométrique est actuellement affiché à l'écran */
  isBiometricPending: boolean;
  /** Indique si l'utilisateur est dans l'écran de détection de secousses */
  isShakeMode: boolean;
  /** Nombre actuel de secousses validées par l'accéléromètre */
  shakeCount: number;
  /** Le nombre total de secousses requis pour aujourd'hui */
  requiredShakes: number;
  /** Déclencheur de l'authentification biométrique */
  handleBiometricAuth: () => void;
  /** Déclencheur pour passer en mode Secousse */
  enterShakeMode: () => void;
  /** Déclencheur pour quitter le mode Secousse et revenir au mode standard */
  exitShakeMode: () => void;
}

/**
 * Composant de Présentation pour l'écran Verrouillé (Locked).
 * Il s'occupe uniquement du rendu visuel en fonction des états fournis en props.
 */
export const LockedView: React.FC<LockedViewProps> = ({
  sensorType,
  failedAttempts,
  maxAttempts,
  lockoutUntil,
  secondsRemaining,
  isBiometricPending,
  isShakeMode,
  shakeCount,
  requiredShakes,
  handleBiometricAuth,
  enterShakeMode,
  exitShakeMode,
}) => {
  // Ajuste dynamiquement le texte du bouton selon l'état et le capteur disponible
  const biometricLabel = isBiometricPending
    ? '⏳ EN COURS...'
    : sensorType === 'FaceID'
    ? 'UTILISER FACE ID'
    : "UTILISER L'EMPREINTE";
    
  // Désactive le bouton si aucun capteur n'est configuré ou si un prompt est déjà ouvert
  const biometricAvailable = sensorType !== null;
  const biometricDisabled = !biometricAvailable || isBiometricPending;

  return (
    <View style={[globalStyles.lockBox, lockoutUntil ? globalStyles.lockBoxAlarm : null]}>
      {/* Titre dynamique (🚨 BLOQUÉ si alarme active, 🔒 Sécurisé sinon) */}
      <Text style={globalStyles.title}>{lockoutUntil ? '🚨 BLOQUÉ' : '🔒 Sécurisé'}</Text>

      {lockoutUntil ? (
        // --- CAS A : COMPTE À REBOURS DU BLOCAGE (LOCKOUT) ---
        <View style={globalStyles.alarmView}>
          <Text style={globalStyles.alarmText}>Trop d'échecs !</Text>
          <Text style={globalStyles.timerText}>Veuillez attendre {secondsRemaining}s</Text>
        </View>
      ) : (
        <>
          {!isShakeMode ? (
            // --- CAS B : ÉCRAN VERROUILLÉ STANDARD ---
            <>
              {/* Type de capteur disponible */}
              <Text style={globalStyles.subtitle}>
                Capteur : {sensorType ?? 'Non disponible'}
              </Text>
              
              {/* Compteur d'échecs visuel */}
              <Text style={globalStyles.attemptsText}>
                Essais : {failedAttempts} / {maxAttempts}
              </Text>

              {/* Bouton de déclenchement d'empreintes */}
              <TouchableOpacity
                style={[globalStyles.button, biometricDisabled && globalStyles.buttonDisabled]}
                onPress={handleBiometricAuth}
                disabled={biometricDisabled}
              >
                <Text style={globalStyles.buttonText}>{biometricLabel}</Text>
              </TouchableOpacity>

              {/* Bouton pour passer en détection de secousses (Shake Mode) */}
              <TouchableOpacity
                style={[globalStyles.button, { marginTop: 15 }]}
                onPress={enterShakeMode}
              >
                <Text style={globalStyles.buttonText}>
                  {requiredShakes === 0
                    ? '✨ ACCÈS DIRECT (EXCEPTION)'
                    : 'UTILISER LE MOUVEMENT'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // --- CAS C : MODE SECOUSSE INTERACTIF ---
            <View style={globalStyles.shakeArea}>
              <Text style={globalStyles.shakeTitle}>Mode Secousse</Text>
              <Text style={globalStyles.shakeInstruction}>
                Bougez le téléphone fermement
              </Text>
              
              {/* Jauge ronde affichant la progression en secousses */}
              <View style={globalStyles.progressContainer}>
                <Text style={globalStyles.progressText}>
                  {shakeCount} / {shakeCount >= requiredShakes ? requiredShakes : 'n'}
                </Text>
              </View>
              
              {/* Bouton de retour */}
              <TouchableOpacity onPress={exitShakeMode} style={globalStyles.cancelButton}>
                <Text style={globalStyles.cancelText}>Retour</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default LockedView;
