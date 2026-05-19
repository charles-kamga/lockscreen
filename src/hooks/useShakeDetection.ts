import { useState, useEffect, useRef, useCallback } from 'react';
import { Vibration } from 'react-native';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { map, filter } from 'rxjs/operators';
import { SHAKE_THRESHOLD, SHAKE_TIMEOUT } from '../constants/security';

interface UseShakeDetectionParams {
  /** Indique si l'application est actuellement verrouillée */
  isLocked: boolean;
  /** Indique si un blocage brute-force est en cours */
  isLockedOut: boolean;
  /** Le nombre de secousses requis calculé pour aujourd'hui */
  requiredShakes: number;
  /** Callback déclenché en cas de succès (déverrouillage) */
  onSuccess: () => void;
  /** Callback déclenché si l'utilisateur annule après avoir déjà commencé à secouer */
  onFailure: () => void;
}

/**
 * Hook personnalisé pour encapsuler l'écouteur matériel de l'accéléromètre et traiter
 * les mouvements de secousses en temps réel avec programmation réactive (RxJS).
 */
export const useShakeDetection = ({
  isLocked,
  isLockedOut,
  requiredShakes,
  onSuccess,
  onFailure,
}: UseShakeDetectionParams) => {
  // Le nombre de secousses valides actuellement effectuées par l'utilisateur
  const [shakeCount, setShakeCount] = useState(0);
  
  // Indique si l'utilisateur est entré dans l'écran de détection de secousses
  const [isShakeMode, setIsShakeMode] = useState(false);
  
  // Référence mutable contenant le timestamp Unix de la dernière secousse validée
  // Utilisée pour implémenter l'anti-rebond (debounce) sans re-render
  const lastShakeTime = useRef(0);

  // EFFET : Configure la vitesse d'échantillonnage de l'accéléromètre (100ms) au montage
  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
  }, []);

  // EFFET : Découplage intelligent. Si l'application passe à l'état "déverrouillée" (isLocked = false),
  // on réinitialise automatiquement le mode secousse pour libérer l'accéléromètre
  useEffect(() => {
    if (!isLocked) {
      setIsShakeMode(false);
      setShakeCount(0);
    }
  }, [isLocked]);

  // EFFET : Surveille le compteur de secousses et déclenche le succès dès que le seuil est atteint
  useEffect(() => {
    if (isShakeMode && requiredShakes > 0 && shakeCount >= requiredShakes && !isLockedOut) {
      onSuccess();
    }
  }, [shakeCount, isShakeMode, requiredShakes, isLockedOut, onSuccess]);

  // EFFET : Gère l'abonnement et le traitement du signal matériel via RxJS
  useEffect(() => {
    let subscription: any;

    // On écoute le capteur uniquement si : l'app est verrouillée, le mode secousse est affiché, et non bloqué
    if (isLocked && isShakeMode && !isLockedOut) {
      subscription = accelerometer
        .pipe(
          // 1. Transformation (map) : calcule la force totale (magnitude) du vecteur 3D
          // Formule physique : Force = √(x² + y² + z²) en m/s²
          map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
          
          // 2. Filtrage (filter) : ignore tous les mouvements parasites inférieurs au seuil (22 m/s²)
          filter((force) => force > SHAKE_THRESHOLD)
        )
        .subscribe(() => {
          const now = Date.now();
          
          // 3. Anti-rebond (Debounce) : vérifie qu'il s'est écoulé au moins SHAKE_TIMEOUT (800ms)
          // depuis la dernière secousse pour éviter qu'un seul mouvement ample compte double
          if (now - lastShakeTime.current > SHAKE_TIMEOUT) {
            lastShakeTime.current = now;
            Vibration.vibrate(100); // Petite vibration physique haptique pour guider l'utilisateur
            setShakeCount((prev) => prev + 1); // Incrémente le nombre de secousses validées
          }
        });
    }

    // NETTOYAGE : Désinscription cruciale du capteur dès qu'on quitte le mode secousse
    // pour préserver la batterie du smartphone et éviter les fuites mémoire
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isLocked, isShakeMode, isLockedOut]);

  /**
   * Permet d'entrer en mode secousse.
   * Si le nombre de secousses requises pour le jour actuel est de 0 (accès direct d'exception),
   * déclenche immédiatement le succès sans obliger à secouer.
   */
  const enterShakeMode = useCallback(() => {
    if (isLockedOut) return;

    if (requiredShakes === 0) {
      onSuccess();
      return;
    }
    setIsShakeMode(true);
  }, [isLockedOut, requiredShakes, onSuccess]);

  /**
   * Quitte le mode secousse (bouton Retour).
   * Règle de sécurité : Si l'utilisateur a commencé à secouer (shakeCount > 0) mais abandonne,
   * cela est comptabilisé comme un échec pour empêcher les tentatives infinies sans pénalité.
   */
  const exitShakeMode = useCallback(() => {
    if (shakeCount > 0) {
      onFailure();
    }
    setIsShakeMode(false);
    setShakeCount(0);
  }, [shakeCount, onFailure]);

  return {
    shakeCount,
    isShakeMode,
    enterShakeMode,
    exitShakeMode,
  };
};
