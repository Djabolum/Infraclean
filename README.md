# Infraclean - Skill Alexa de Nettoyage Acoustique & Expulsion d'Eau

Infraclean est un concept innovant de nettoyage qui exploite les ondes acoustiques à basse fréquence diffusées par les haut-parleurs des appareils Alexa (Echo Dot, Echo, etc.) pour faire vibrer et décoller la poussière, expulser l'humidité des haut-parleurs, ou optimiser la sensibilité du microphone.

Ce dépôt contient le code source de la **Skill Alexa** prête à être déployée, ainsi qu'un **Simulateur Web interactif** permettant de tester le comportement acoustique, physique, et de simuler les commandes vocales Alexa en Français, Anglais et Espagnol.

---

## 📂 Structure du Projet

```text
Infraclean/
├── index.html                  # Interface du simulateur web interactif
├── styles.css                  # Design premium (Dark Mode, LED Alexa, visualiseur)
├── app.js                      # Logique (Web Audio API, physique des particules poussière/eau/micro, NLP Alexa)
├── alexa-skill/
│   ├── skill.json              # Manifeste de la skill Alexa (Multilingue FR, EN, ES)
│   ├── models/
│   │   ├── fr-FR.json          # Modèle d'interaction vocal en français
│   │   ├── en-US.json          # Modèle d'interaction vocal en anglais
│   │   └── es-ES.json          # Modèle d'interaction vocal en espagnol
│   └── lambda/
│       ├── index.js            # Code AWS Lambda (Node.js ASK SDK - Localisé)
│       └── package.json        # Dépendances Node.js pour Lambda
└── README.md                   # Ce guide d'installation et de déploiement
```

---

## 🚀 Guide de Déploiement de la Skill Alexa

Pour installer et utiliser cette skill sur vos propres appareils Amazon Echo, suivez les étapes ci-dessous :

### Étape 1 : Créer la Skill dans la Console Alexa Developer
1. Rendez-vous sur la [Console Alexa Developer](https://developer.amazon.com/alexa/console/ask) et connectez-vous.
2. Cliquez sur **Create Skill**.
3. Remplissez les informations suivantes :
   - **Skill Name** : `Infraclean`
   - **Primary Language** : `French (FR)` (Vous pourrez ajouter les locales `en-US` et `es-ES` ensuite).
   - **Choose a model to add to your skill** : `Custom`
   - **Choose a method to host your skill's backend resources** : `Provision your own` (ou Alexa-hosted si vous préférez que le code soit hébergé par Amazon).
4. Cliquez sur **Create Skill** en haut à droite.

### Étape 2 : Configurer le Modèle d'Interaction Vocal
1. Dans le menu de gauche de la console Alexa, allez dans **Interaction Model** > **JSON Editor**.
2. Sélectionnez la langue courante (ex: Français), puis remplacez l'intégralité du contenu JSON par celui présent dans le fichier [models/fr-FR.json](file:///c:/Users/nicol/OneDrive/Escritorio/Infraclean/alexa-skill/models/fr-FR.json) de ce projet. Cliquez sur **Save Model**.
3. (Optionnel) Pour ajouter d'autres langues, cliquez sur **Language Settings** dans la console, ajoutez `English (US)` et `Spanish (ES)`, puis collez les contenus de [en-US.json](file:///c:/Users/nicol/OneDrive/Escritorio/Infraclean/alexa-skill/models/en-US.json) et [es-ES.json](file:///c:/Users/nicol/OneDrive/Escritorio/Infraclean/alexa-skill/models/es-ES.json) respectifs dans leurs éditeurs JSON.
4. Cliquez sur **Build Model** pour chaque langue. L'apprentissage linguistique prend en général 1 à 2 minutes.

### Étape 3 : Configurer le Code Backend (AWS Lambda ou Alexa-Hosted)
Si vous avez choisi **Alexa-hosted** à l'étape 1 :
1. Allez dans l'onglet **Code** en haut de la console Alexa.
2. Remplacez le code de `index.js` par celui du fichier [lambda/index.js](file:///c:/Users/nicol/OneDrive/Escritorio/Infraclean/alexa-skill/lambda/index.js).
3. Ouvrez le fichier `package.json` et ajoutez les dépendances du fichier [lambda/package.json](file:///c:/Users/nicol/OneDrive/Escritorio/Infraclean/alexa-skill/lambda/package.json).
4. Cliquez sur **Save** puis sur **Deploy**.

Si vous utilisez votre propre fonction **AWS Lambda** :
1. Créez une fonction Lambda sur la console AWS avec le runtime **Node.js 18.x** ou **Node.js 20.x**.
2. Configurez le déclencheur (**Trigger**) sur **Alexa Skills Kit** et renseignez l'ID de votre skill (disponible sur la console Alexa).
3. Installez localement les modules Node.js de [lambda/package.json](file:///c:/Users/nicol/OneDrive/Escritorio/Infraclean/alexa-skill/lambda/package.json) avec `npm install`.
4. Compressez sous format ZIP le code de `index.js`, `package.json` et le dossier `node_modules`, puis importez-le dans votre fonction Lambda.
5. Copiez l'**ARN** de votre fonction Lambda.
6. Sur la console Alexa Developer, allez sur **Endpoint**, sélectionnez **AWS Lambda ARN**, et collez l'ARN dans le champ de la région par défaut. Cliquez sur **Save Endpoints**.

---

## 🧪 Comment tester ?

### 1. Sur le Simulateur Web Local
Ouvrez simplement le fichier `index.html` dans un navigateur moderne (Chrome, Firefox, Edge, Safari).
- Sélectionnez la langue d'interface souhaitée (Français, English, Español) dans le sélecteur du en-tête.
- Cliquez sur **Activer l'Audio** pour autoriser le son.
- **Test de la poussière** : Cliquez sur les cartes de surface (bois, verre...) ou le mode Turbo pour voir la poussière s'éjecter sous l'effet des vibrations basse fréquence cibles.
- **Test de l'expulsion d'eau** :
  1. Cliquez sur **Inonder** dans la carte Expulsion d'Eau : des gouttelettes bleues d'eau stagnante apparaissent sur la grille de l'Echo Dot.
  2. Cliquez sur **Expulser** : un signal pulsé à 165Hz s'active, secouant l'appareil pour projeter les gouttes d'eau hors de l'enceinte.
- **Test de l'amélioration d'écoute** :
  1. Cliquez sur **Optimiser** dans la carte Amélioration d'Écoute.
  2. Un balayage de fréquence aiguë (sifflement ascendant de 1kHz à 12kHz) démarre pour déloger la poussière des orifices micro du capot supérieur (représentée par des particules violettes s'échappant des micros).
  3. Le système effectue ensuite 1,5 seconde de silence pour calibrer le niveau de bruit de fond, et le statut passe en "Optimisé".
- **Test Vocal Alexa** : Saisissez ou cliquez sur des commandes vocales (ex : *« Alexa, améliore l'écoute »* ou *« Alexa, eject water »*). Alexa vous répondra vocalement et visuellement.

### 2. Sur la Console Alexa Developer ou vos appareils réels
- Activez le test en mode *Development* dans l'onglet **Test**.
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
# Infraclean
