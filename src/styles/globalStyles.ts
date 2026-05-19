import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
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
  lockBoxAlarm: {
    borderColor: 'red',
    borderWidth: 3,
    backgroundColor: '#fff0f0',
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
    marginBottom: 10,
  },
  attemptsText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
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
  alarmView: {
    alignItems: 'center',
    marginVertical: 20,
  },
  alarmText: {
    fontSize: 20,
    color: 'red',
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
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
  },
});
