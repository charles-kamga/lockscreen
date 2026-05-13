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

### Phase 2 : Déverrouillage Logique (Modulo 5)
Méthode de secours basée sur une logique mathématique simple (à implémenter).
1.  **Calcul** : Utilisation du jour du mois actuel (ex: 12).
2.  **Logique** : Le code attendu est `jour(au carree) % 5` (ex: 49 % 5 = 4).
3.  **Interface** : Saisie du code via un clavier numérique.

### Phase 3 : Finalisation de l'Interface
- Design de l'écran de garde (Lock Screen).
- Possibilité de basculer entre l'empreinte et le code.

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

*Note : Cette version actuelle est un prototype fonctionnel validant la partie biométrique.*
