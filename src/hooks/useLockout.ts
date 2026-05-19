import { useState, useEffect, useRef, useCallback } from 'react';
import { MAX_ATTEMPTS, LOCKOUT_DURATION } from '../constants/security';

interface UseLockoutParams {
  /** Callback déclenché au début de la phase de blocage (lance l'alarme) */
  onAlarmStart?: () => void;
  /** Callback déclenché à la fin de la phase de blocage (arrête l'alarme) */
  onAlarmStop?: () => void;
}

/**
 * Hook personnalisé pour gérer la sécurité de brute-force (Lockout).
 * Il gère de manière autonome le nombre d'échecs, le verrouillage temporel et le compte à rebours.
 */
export const useLockout = ({ onAlarmStart, onAlarmStop }: UseLockoutParams = {}) => {
  // Nombre de tentatives infructueuses accumulées par l'utilisateur
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  // Timestamp Unix (ms) indiquant la fin de la pénalité de blocage (null si libre)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  
  // Nombre de secondes restantes affichées à l'écran pendant le blocage
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // RÉFÉRENCE MUTABLE : Indispensable pour éviter le problème des "stale closures"
  // (fermetures obsolètes) où le setInterval interne capturerait une ancienne valeur d'état.
  const lockoutUntilRef = useRef<number | null>(null);

  // On synchronise en permanence la valeur de la référence avec l'état React
  useEffect(() => {
    lockoutUntilRef.current = lockoutUntil;
  }, [lockoutUntil]);

  // EFFET : Gère le minuteur asynchrone du compte à rebours pendant le blocage
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Si un blocage est actif
    if (lockoutUntil) {
      const now = Date.now();
      
      // Sécurité : s'assure qu'on est bien toujours dans la période de blocage
      if (now < lockoutUntil) {
        // Initialisation immédiate du temps restant pour éviter un saut d'affichage (saut de 0s à 60s)
        setSecondsRemaining(Math.ceil((lockoutUntil - now) / 1000));
        
        // Déclenchement de l'alarme sonore via le callback
        onAlarmStart?.();

        // Création de l'intervalle de 1 seconde (1000ms) pour faire défiler le chronomètre
        timer = setInterval(() => {
          const currentNow = Date.now();
          // Lecture sécurisée du timestamp de fin via la Ref (toujours à jour)
          const currentLockout = lockoutUntilRef.current;

          if (!currentLockout || currentNow >= currentLockout) {
            // TEMPS ÉCOULÉ : Levée du blocage et réinitialisation des variables
            setLockoutUntil(null);
            setFailedAttempts(0);
            onAlarmStop?.(); // Arrêt de l'alarme sonore
            clearInterval(timer);
          } else {
            // Calcul et mise à jour du nombre de secondes entières restantes
            setSecondsRemaining(Math.ceil((currentLockout - currentNow) / 1000));
          }
        }, 1000);
      }
    }

    // Nettoyage (cleanup) de l'intervalle au démontage du composant pour éviter les fuites de mémoire
    return () => clearInterval(timer);
  }, [lockoutUntil, onAlarmStart, onAlarmStop]);

  /**
   * Enregistre un échec d'authentification.
   * Si le nombre maximal d'échecs est atteint, applique le blocage de 60 secondes.
   */
  const registerFailure = useCallback(() => {
    setFailedAttempts((prev) => {
      const next = prev + 1;
      if (next >= MAX_ATTEMPTS) {
        // Déclenche le blocage à partir de l'heure actuelle + 1 minute (60 000 ms)
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
      }
      return next;
    });
  }, []);

  /**
   * Réinitialise totalement le système de sécurité (remet les compteurs à zéro).
   */
  const resetAttempts = useCallback(() => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    onAlarmStop?.();
  }, [onAlarmStop]);

  return {
    failedAttempts,
    lockoutUntil,
    secondsRemaining,
    registerFailure,
    resetAttempts,
  };
};
