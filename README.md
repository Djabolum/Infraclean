# Infraclean - Skill Alexa de Nettoyage Acoustique & Expulsion d'Eau

Infraclean est un concept innovant de nettoyage qui exploite les ondes acoustiques à basse fréquence diffusées par les haut-parleurs des appareils Alexa (Echo Dot, Echo, etc.) pour faire vibrer et décoller la poussière, expulser l'humidité des haut-parleurs, ou optimiser la sensibilité du microphone.

Ce dépôt cohabite sous la forme d'un **Simulateur Web interactif** (pour tester localement) et d'un projet de skill Alexa officiel conforme à la structure **ASK CLI v2** pour être directement importable.

---

## 📂 Structure du Projet (Conforme ASK CLI v2)

```text
Infraclean/
├── ask-resources.json          # Fichier de ressources ASK CLI v2 pour l'importateur
├── skill-package/              # Répertoire des métadonnées de la skill
│   ├── skill.json              # Manifeste de la skill Alexa (Multilingue FR, EN, ES)
│   └── interactionModels/
│       └── custom/
│           ├── fr-FR.json      # Modèle d'interaction vocal en français
│           ├── en-US.json      # Modèle d'interaction vocal en anglais
│           └── es-ES.json      # Modèle d'interaction vocal en espagnol
├── lambda/
│   ├── index.js                # Code AWS Lambda (Node.js ASK SDK - Localisé)
│   └── package.json            # Dépendances Node.js pour Lambda
├── index.html                  # Interface du simulateur web interactif (à ouvrir localement)
├── styles.css                  # Design du simulateur (Dark Mode, LED Alexa)
├── app.js                      # Moteur audio, physique et dialogue du simulateur
└── README.md                   # Ce guide d'installation et d'importation
```

*(Note: Les fichiers du simulateur cohabitent et sont automatiquement ignorés par l'importateur d'Amazon Alexa).*

---

## ⚡ Méthode d'Importation Rapide depuis GitHub (Recommandé)

Grâce à la structure ASK CLI v2 du dépôt, vous pouvez importer cette skill sur votre compte Amazon en un clic sans aucun copier-coller manuel :

1. **Poussez ce dépôt** sur votre compte **GitHub** (en mode public).
2. Rendez-vous sur la [Console Alexa Developer](https://developer.amazon.com/alexa/console/ask) et connectez-vous.
3. Cliquez sur **Create Skill** en haut à droite.
4. Remplissez les champs de base :
   - **Skill Name** : `Infraclean`
   - **Primary Language** : `French (FR)`
5. Dans la section **Choose a method to host your skill's backend resources**, faites défiler vers le bas et sélectionnez **Import Skill** (situé tout en bas des options d'hébergement).
6. Entrez l'URL de votre dépôt GitHub public (ex: `https://github.com/votre-compte/Infraclean.git`).
7. Cliquez sur **Create Skill** en haut à droite.

Alexa va cloner votre dépôt, lire le fichier `ask-resources.json`, compiler automatiquement vos trois modèles d'interaction (`fr-FR.json`, `en-US.json`, `es-ES.json`) et déployer le code Node.js dans l'environnement hébergé Alexa-hosted. Votre skill sera prête à être testée immédiatement !

---

## 🧪 Comment tester ?

### 1. Sur le Simulateur Web Local
Ouvrez simplement le fichier `index.html` dans un navigateur moderne (Chrome, Firefox, Edge, Safari).
- Sélectionnez la langue d'interface souhaitée (Français, English, Español) dans le sélecteur de l'en-tête.
- Cliquez sur **Activer l'Audio** pour autoriser le son.
- **Test de la poussière** : Cliquez sur les cartes de surface (bois, verre...) ou le mode Turbo pour voir la poussière s'éjecter sous l'effet des vibrations basse fréquence cibles.
- **Test de l'expulsion d'eau** :
  1. Cliquez sur **Inonder** dans la carte Expulsion d'Eau : des gouttelettes bleues d'eau stagnante apparaissent sur la grille de l'Echo Dot.
  2. Cliquez sur **Expulser** : un signal pulsé à 165Hz s'active, secouant l'appareil pour projeter les gouttes d'eau hors de l'enceinte.
- **Test de l'amélioration d'écoute** :
  1. Cliquez sur **Optimiser** dans la carte Amélioration d'Écoute.
  2. Un balayage de fréquence aiguë (sifflement de 1kHz à 12kHz) démarre pour déloger la poussière des orifices micro du capot supérieur (représentée par des particules violettes s'échappant des micros).
  3. Le système effectue ensuite 1,5 seconde de silence pour calibrer le niveau de bruit de fond, et le statut passe en "Optimisé".
- **Test Vocal Alexa** : Saisissez ou cliquez sur des commandes vocales (ex : *« Alexa, améliore l'écoute »* ou *« Alexa, eject water »*). Alexa vous répondra vocalement et visuellement.

### 2. Sur la Console Alexa Developer ou vos appareils réels
Une fois la skill importée :
- Rendez-vous dans l'onglet **Test** de la console Alexa et activez le mode *Development*.
- Énoncez à haute voix ou tapez :
  - *« Alexa, ouvre Infraclean »* / *« Alexa, open Infraclean »*
  - *« Alexa, calibre pour la table en bois »* / *« Alexa, calibrate for wood »*
  - *« Alexa, lance la détection de saleté »* / *« Alexa, start dirt detection »*
  - *« Alexa, évacue l'eau »* / *« Alexa, eject water »*
  - *« Alexa, améliore l'écoute »* / *« Alexa, improve listening »*
  - *« Alexa, active le mode turbo »* / *« Alexa, active turbo mode »*
  - *« Alexa, stop »* / *« Alexa, stop »*

---

## 🛠️ Spécifications Techniques Audio

Le nettoyage acoustique repose sur les principes de **résonance vibratoire** et de **fluidisation des particules fines** :
- **Bois (80 Hz)** : Ajusté pour déloger la poussière des fibres ligneuses sans endommager le vernis.
- **Verre (120 Hz)** : Onde plus courte pour vaincre l'attraction électrostatique sur les surfaces lisses et rigides.
- **Métal (160 Hz)** : Fréquence élevée conçue pour exciter les particules métalliques microscopiques.
- **Tissu (50 Hz)** : Infrason profond pour faire vibrer les fibres souples des tissus (canapés, coussins) et faire remonter la poussière incrustée.
- **Mode Turbo (200 Hz, Amplitude Max)** : Cycle de choc destiné aux poussières agglomérées (onde triangle).
- **Expulsion d'Eau (165 Hz, Pulsé)** : Signal modulé (ON/OFF toutes les 150 ms) à 165Hz créant des micro-impulsions de compression d'air pour évacuer l'eau hors de la grille acoustique sans saturer le haut-parleur.
- **Amélioration d'Écoute (1 kHz à 12 kHz, Sweep)** : Balayage haute fréquence continu pour éliminer la poussière sèche accumulée dans les trous étroits des microphones du capot supérieur, suivi d'un calibrage du bruit de fond.
