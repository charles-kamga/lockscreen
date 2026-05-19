import { useEffect, useRef, useCallback } from 'react';
import Sound from 'react-native-sound';

// Configure la catégorie audio globale une seule fois au niveau du module.
// 'Playback' garantit que le son sera lu même si le téléphone est en mode silencieux.
Sound.setCategory('Playback');

/**
 * Hook personnalisé pour encapsuler et gérer de manière sécurisée la lecture audio
 * avec la bibliothèque native react-native-sound.
 * Il assure le chargement, la libération de la mémoire et empêche les chevauchements de sons.
 */
export const useAudio = () => {
  // Références mutables pour conserver les instances Sound sans déclencher de re-renders
  const soundUnlock = useRef<Sound | null>(null);
  const soundError  = useRef<Sound | null>(null);
  const soundAlarm  = useRef<Sound | null>(null);

  // Verrous d'exclusion mutuelle (Mutex) : empêchent qu'un son soit re-déclenché
  // s'il est déjà en cours de lecture (évite l'effet de cacophonie / écho en boucle)
  const isErrorSoundPlaying = useRef(false);
  const isAlarmSoundPlaying = useRef(false);

  // EFFET : Charge les ressources audio au démarrage et les détruit proprement à la fermeture
  useEffect(() => {
    // Chargement depuis le dossier des ressources de l'application (MAIN_BUNDLE)
    soundUnlock.current = new Sound('unlock.mp3', Sound.MAIN_BUNDLE, (err) => {
      if (err) console.warn('Erreur chargement unlock.mp3:', err);
    });
    soundError.current = new Sound('error.mp3', Sound.MAIN_BUNDLE, (err) => {
      if (err) console.warn('Erreur chargement error.mp3:', err);
    });
    soundAlarm.current = new Sound('alarm.mp3', Sound.MAIN_BUNDLE, (err) => {
      if (err) console.warn('Erreur chargement alarm.mp3:', err);
    });

    // NETTOYAGE : Libération explicite de la mémoire.
    // Très important en développement mobile pour éviter les fuites mémoire (Memory Leaks)
    return () => {
      soundUnlock.current?.release();
      soundError.current?.release();
      soundAlarm.current?.stop();
      soundAlarm.current?.release();
    };
  }, []);

  /**
   * Joue le son de succès (Déverrouillage).
   */
  const playUnlock = useCallback(() => {
    soundUnlock.current?.play();
  }, []);

  /**
   * Joue le son d'échec (Erreur).
   * Utilise un verrou pour ne pas relancer le son si l'échec précédent est toujours en cours de lecture.
   */
  const playError = useCallback(() => {
    if (!isErrorSoundPlaying.current && soundError.current) {
      isErrorSoundPlaying.current = true; // Active le verrou
      soundError.current.play(() => {
        // Callback natif appelé quand le son a fini de jouer -> on libère le verrou
        isErrorSoundPlaying.current = false;
      });
    }
  }, []);

  /**
   * Joue la sirène d'alarme en continu.
   * Utilise également un verrou anti-chevauchement.
   */
  const playAlarm = useCallback(() => {
    if (!isAlarmSoundPlaying.current && soundAlarm.current) {
      isAlarmSoundPlaying.current = true; // Active le verrou
      soundAlarm.current.play(() => {
        // Callback de fin de lecture
        isAlarmSoundPlaying.current = false;
      });
    }
  }, []);

  /**
   * Arrête immédiatement la sirène d'alarme et libère le verrou.
   */
  const stopAlarm = useCallback(() => {
    soundAlarm.current?.stop();
    isAlarmSoundPlaying.current = false;
  }, []);

  return {
    playUnlock,
    playError,
    playAlarm,
    stopAlarm,
  };
};
