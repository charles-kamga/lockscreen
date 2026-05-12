# Projet Verrouillage - ICT 202

Ce projet est un système de déverrouillage sécurisé développé en React Native CLI. Il implémente deux méthodes de vérification pour accéder au contenu de l'application.

## 📋 Plan d'implémentation

### Phase 1 : Déverrouillage Biométrique (Terminé ✅)
L'objectif est d'utiliser le capteur d'empreinte digitale (ou reconnaissance faciale) du téléphone.
1.  **Installation** : `react-native-biometrics` (Fait ✅)
2.  **Configuration Android** : Ajout des permissions dans le `AndroidManifest.xml`. (Fait ✅)
3.  **Détection du Capteur** : Vérifier si le matériel est disponible et configuré. (Fait ✅)
4.  **Authentification Simple** : Afficher la boîte de dialogue système Android pour la capture. (Fait ✅)
5.  **Gestion des États** : Basculer l'application de l'état "Verrouillé" à "Déverrouillé" après succès. (Fait ✅)

*Note : Cette version est un test fonctionnel validé sur émulateur.*

### Phase 2 : Déverrouillage Logique (Modulo 7)
Méthode de secours basée sur une logique algorithmique simple.
1.  **Logique** : Récupérer le jour du mois actuel.
2.  **Calcul** : Appliquer `jour % 7`.
3.  **Interface** : Champ de saisie numérique et bouton de validation.
4.  **Validation** : Comparaison de la saisie avec le résultat attendu.

### Phase 3 : Interface Globale (Lock Screen)
- Création d'une page d'accueil sécurisée (Overlay).
- Bouton pour choisir la méthode (Biométrie vs Code).
- Gestion de la persistance (optionnel) : l'app se reverrouille-t-elle à chaque redémarrage ?

## 🚀 Commandes utiles
- **Démarrer Metro** : `npm start`
- **Lancer Android** : `npx react-native run-android`
- **Simuler une empreinte (Émulateur)** : `adb -e emu fingerprint touch 1`
