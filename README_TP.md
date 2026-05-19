# Projet Verrouillage - ICT 202

Ce projet est un système de déverrouillage sécurisé développé en React Native CLI pour le cours ICT 202. Il propose deux méthodes de vérification pour accéder au contenu de l'application.

## 📋 Plan d'implémentation

### Phase 1 : Déverrouillage Biométrique (Terminé ✅)
Utilisation du capteur d'empreinte digitale ou de la reconnaissance faciale.
1.  **Installation** : Intégration de `react-native-biometrics`. (Fait ✅)
2.  **Configuration Android** : Ajout de la permission `USE_BIOMETRIC` dans le manifest. (Fait ✅)
3.  **Détection** : Vérification automatique de la présence d'un capteur au lancement. (Fait ✅)
4.  **Authentification** : Affichage de la fenêtre système pour le scan. (Fait ✅)
5.  **Validation** : Déverrouillage de l'interface après succès du scan. (Fait ✅)

### Phase 2 : Déverrouillage par Mouvement (Secousse) (Terminé ✅)
Méthode de secours basée sur l'accéléromètre du téléphone et une logique mathématique.
1.  **Détection** : Utilisation de `react-native-sensors` pour détecter les secousses physiques du téléphone (accélération > 22 m/s²). (Fait ✅)
2.  **Calcul (Modulo 5)** : Le nombre de secousses requises dépend du jour de la semaine : `(jour_de_la_semaine²) % 5`. (Fait ✅)
3.  **Exceptions** : Le vendredi, l'application est en accès libre. Si le calcul donne 0 secousses, le bouton déverrouille l'application directement. (Fait ✅)

### Phase 3 : Interface, Audio & Sécurité (Terminé ✅)
1.  **Interface** : Design de l'écran de garde (Lock Screen) avec basculement entre biométrie et mouvement. (Fait ✅)
2.  **Feedback** : Intégration de sons (`react-native-sound`) et de retours haptiques (`Vibration`) pour les succès, échecs et chaque secousse. (Fait ✅)
3.  **Système Anti-Intrusion** : Blocage total de l'application pendant 60 secondes (avec alarme sonore) après 4 tentatives échouées. (Fait ✅)

## 🛠️ Instructions pour le Groupe

### Lancement du projet
1.  Installer les dépendances : `npm install`
2.  Lancer le serveur Metro : `npm start`
3.  Lancer l'application : `npx react-native run-android`

### Test de l'empreinte sur Émulateur
Puisque l'émulateur n'a pas de capteur physique, utilisez ces commandes :
1.  **Enregistrer une empreinte** : Aller dans *Settings > Security > Fingerprint* sur l'émulateur.
2.  **Simuler le toucher** : Quand le téléphone demande de poser le doigt, tapez dans votre terminal :
    ```bash
    adb -e emu fingerprint touch 1
    ```

*Note : Cette version est maintenant un prototype complet et fonctionnel incluant la biométrie, l'accéléromètre, l'audio et la sécurité anti-intrusion.*
