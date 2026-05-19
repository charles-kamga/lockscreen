import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface UnlockedViewProps {
  onLock: () => void;
}

export const UnlockedView: React.FC<UnlockedViewProps> = ({ onLock }) => {
  return (
    <View style={globalStyles.contentBox}>
      <Text style={globalStyles.welcomeText}>🔓 Bienvenue !</Text>
      <Text style={globalStyles.infoText}>Le système de déverrouillage sécurisé est actif.</Text>

      <TouchableOpacity style={globalStyles.retryButton} onPress={onLock}>
        <Text style={globalStyles.retryButtonText}>REVERROUILLER L'APP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UnlockedView;
