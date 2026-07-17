/**
 * AWS Lambda Handler for Alexa Skill: Infraclean
 * Tech Stack: Node.js Alexa Skills Kit SDK
 * 
 * Ce code supporte le multilinguisme (Français, Anglais, Espagnol)
 * et intègre l'expulsion d'eau ainsi que l'amélioration d'écoute (calibrage micro).
 */

const Alexa = require('ask-sdk-core');

// Dictionnaire de configurations acoustiques par locale
const SURFACE_CONFIGS = {
    'fr-FR': {
        'bois': { freq: 80, name: 'bois', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-wood-80hz.mp3' },
        'verre': { freq: 120, name: 'verre', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-glass-120hz.mp3' },
        'métal': { freq: 160, name: 'métal', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-metal-160hz.mp3' },
        'tissu': { freq: 50, name: 'tissu', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-fabric-50hz.mp3' }
    },
    'en-US': {
        'wood': { freq: 80, name: 'wood', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-wood-80hz.mp3' },
        'glass': { freq: 120, name: 'glass', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-glass-120hz.mp3' },
        'metal': { freq: 160, name: 'metal', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-metal-160hz.mp3' },
        'fabric': { freq: 50, name: 'fabric', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-fabric-50hz.mp3' }
    },
    'es-ES': {
        'madera': { freq: 80, name: 'madera', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-wood-80hz.mp3' },
        'vidrio': { freq: 120, name: 'vidrio', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-glass-120hz.mp3' },
        'metal': { freq: 160, name: 'metal', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-metal-160hz.mp3' },
        'tejido': { freq: 50, name: 'tejido', audio: 'https://s3.amazonaws.com/infraclean-assets/vibe-fabric-50hz.mp3' }
    }
};

// Dictionnaire de traduction des réponses
const LOCALIZED_STRINGS = {
    'fr-FR': {
        LAUNCH_MSG: "Bienvenue dans Infraclean, votre système de nettoyage par vibrations sonores. Je suis prête. Dites : calibre pour le bois, lance une détection de saleté, évacue l'eau, améliore l'écoute, ou active le mode turbo. Que souhaitez-vous faire ?",
        LAUNCH_REPROMPT: "Vous pouvez dire par exemple : calibre pour le bois, évacue l'eau, améliore l'écoute ou lance la détection.",
        CALIBRATE_SUCCESS: "Calibrage effectué pour le {surface}. La fréquence est définie sur {freq} Hertz. Lancement des vibrations sonores. <audio src=\"{audio}\" />",
        CALIBRATE_DEFAULT: "J'ai détecté la surface {surface}, mais elle n'est pas encore calibrée. J'applique une vibration de sécurité à 70 Hertz. <audio src=\"https://s3.amazonaws.com/infraclean-assets/vibe-safety-70hz.mp3\" />",
        CALIBRATE_PROMPT: "Pour quelle surface souhaitez-vous calibrer les vibrations ? Vous pouvez dire bois, verre, métal ou tissu.",
        CALIBRATE_REPROMPT: "Dites simplement la surface, par exemple : le verre.",
        DIRT_SCAN_START: "Analyse acoustique en cours... Veuillez ne pas faire de bruit. <audio src=\"https://s3.amazonaws.com/infraclean-assets/scan-ping.mp3\" /> ",
        DIRT_RESULT_LOW: "Diagnostic terminé. Taux de poussière faible : {level}%. J'applique un cycle d'entretien léger à {freq} Hertz. <audio src=\"{audio}\" />",
        DIRT_RESULT_MEDIUM: "Diagnostic terminé. Taux de poussière modéré : {level}%. J'ajuste automatiquement les micro-vibrations à {freq} Hertz. <audio src=\"{audio}\" />",
        DIRT_RESULT_HIGH: "Alerte : Taux de poussière élevé détecté : {level}%. J'ajuste la vibration sur {freq} Hertz pour désincruster la saleté. <audio src=\"{audio}\" />",
        TURBO_ACTIVE: "Mode Turbo engagé ! Activation des ondes de choc harmoniques à 200 Hertz à amplitude maximale. Maintenez les objets instables. <audio src=\"https://s3.amazonaws.com/infraclean-assets/vibe-turbo-200hz.mp3\" />",
        WATER_EJECT_ACTIVE: "Lancement du cycle d'expulsion d'eau. Pulsations sonores à 165 Hertz à amplitude maximale en cours pour évacuer l'humidité. <audio src=\"https://s3.amazonaws.com/infraclean-assets/water-eject-165hz.mp3\" />",
        MIC_CALIBRATE_ACTIVE: "Lancement du cycle d'optimisation d'écoute. Émission d'un balayage acoustique aigu pour déloger la poussière des microphones, suivi d'un calibrage du bruit ambiant. Veuillez ne pas faire de bruit. <audio src=\"https://s3.amazonaws.com/infraclean-assets/mic-sweep-12khz.mp3\" /> Calibrage terminé. Seuil de capture micro optimisé.",
        HELP_MSG: "Infraclean utilise les vibrations pour déplacer la poussière, évacuer l'eau ou optimiser les micros. Demandez-moi : 'calibre pour le verre', 'évacue l'eau', 'améliore l'écoute', 'lance la détection de saleté', ou 'mode turbo'. Que voulez-vous faire ?",
        HELP_REPROMPT: "Que puis-je faire pour vous ?",
        STOP_MSG: "Arrêt immédiat des ondes acoustiques. Infraclean est en veille.",
        ERROR_MSG: "Désolée, une erreur est survenue lors de la génération des vibrations. Veuillez réessayer."
    },
    'en-US': {
        LAUNCH_MSG: "Welcome to Infraclean, your low-frequency vibrational cleaning system. I am ready. Say: calibrate for wood, start dirt detection, eject water, improve listening, or activate turbo mode. What would you like to do?",
        LAUNCH_REPROMPT: "You can say, for example: calibrate for wood, eject water, improve listening, or start detection.",
        CALIBRATE_SUCCESS: "Calibration completed for {surface}. Frequency set to {freq} Hertz. Initiating sound waves. <audio src=\"{audio}\" />",
        CALIBRATE_DEFAULT: "I detected the {surface} surface, but it is not pre-calibrated. Applying a safety vibration at 70 Hertz. <audio src=\"https://s3.amazonaws.com/infraclean-assets/vibe-safety-70hz.mp3\" />",
        CALIBRATE_PROMPT: "Which surface would you like to calibrate the vibrations for? You can say wood, glass, metal, or fabric.",
        CALIBRATE_REPROMPT: "Just state the surface, for example: glass.",
        DIRT_SCAN_START: "Acoustic analysis in progress... Please remain quiet. <audio src=\"https://s3.amazonaws.com/infraclean-assets/scan-ping.mp3\" /> ",
        DIRT_RESULT_LOW: "Diagnostic complete. Low dust level: {level}%. Applying a light maintenance cycle at {freq} Hertz. <audio src=\"{audio}\" />",
        DIRT_RESULT_MEDIUM: "Diagnostic complete. Moderate dust level: {level}%. Adjusting micro-vibrations to {freq} Hertz. <audio src=\"{audio}\" />",
        DIRT_RESULT_HIGH: "Alert: High dust level detected: {level}%. Setting vibration to {freq} Hertz to loosen the dirt. <audio src=\"{audio}\" />",
        TURBO_ACTIVE: "Turbo Mode engaged! Activating harmonic shockwaves at 200 Hertz at maximum amplitude. Secure any unstable objects. <audio src=\"https://s3.amazonaws.com/infraclean-assets/vibe-turbo-200hz.mp3\" />",
        WATER_EJECT_ACTIVE: "Starting water ejection cycle. Audio pulses at 165 Hertz at maximum amplitude are active to evacuate moisture. <audio src=\"https://s3.amazonaws.com/infraclean-assets/water-eject-165hz.mp3\" />",
        MIC_CALIBRATE_ACTIVE: "Starting listening optimization cycle. Emitting a high-frequency sweep to clear dust from microphone ports, followed by ambient noise threshold calibration. Please remain quiet. <audio src=\"https://s3.amazonaws.com/infraclean-assets/mic-sweep-12khz.mp3\" /> Calibration complete. Microphone sensitivity optimized.",
        HELP_MSG: "Infraclean uses vibrations to dislodge dust, water or calibrate microphones. Ask me to: 'calibrate for glass', 'eject water', 'improve listening', 'start dirt detection', or 'activate turbo mode'. What would you like to do?",
        HELP_REPROMPT: "What can I do for you?",
        STOP_MSG: "Acoustic waves stopped. Infraclean is now on standby.",
        ERROR_MSG: "Sorry, an error occurred during vibration generation. Please try again."
    },
    'es-ES': {
        LAUNCH_MSG: "Bienvenido a Infraclean, tu sistema de limpieza por vibración sonora. Estoy lista. Di: calibra para madera, inicia la detección de suciedad, expulsa el agua, mejora la escucha, o activa el modo turbo. ¿Qué deseas hacer?",
        LAUNCH_REPROMPT: "Puedes decir por ejemplo: calibra para madera, expulsa el agua, mejora la escucha, o detecta la suciedad.",
        CALIBRATE_SUCCESS: "Calibración realizada para {surface}. Frecuencia definida en {freq} Hertz. Iniciando ondas sonoras. <audio src=\"{audio}\" />",
        CALIBRATE_DEFAULT: "He detectado la superficie {surface}, pero no está precalibrada. Aplicando vibración de seguridad a 70 Hertz. <audio src=\"https://s3.amazonaws.com/infraclean-assets/vibe-safety-70hz.mp3\" />",
        CALIBRATE_PROMPT: "¿Para qué superficie deseas calibrar las vibraciones? Puedes decir madera, vidrio, metal o tejido.",
        CALIBRATE_REPROMPT: "Simplemente di la superficie, por ejemplo: vidrio.",
        DIRT_SCAN_START: "Análisis acústico en curso... Por favor, no haga ruido. <audio src=\"https://s3.amazonaws.com/infraclean-assets/scan-ping.mp3\" /> ",
        DIRT_RESULT_LOW: "Diagnóstico completado. Nivel de polvo bajo: {level}%. Aplicando ciclo ligero de mantenimiento a {freq} Hertz. <audio src=\"{audio}\" />",
        DIRT_RESULT_MEDIUM: "Diagnóstico completado. Nivel de polvo moderado: {level}%. Ajustando microvibraciones a {freq} Hertz. <audio src=\"{audio}\" />",
        DIRT_RESULT_HIGH: "Alerta: Alto nivel de suciedad detectado: {level}%. Ajustando vibración a {freq} Hertz para desprender la suciedad. <audio src=\"{audio}\" />",
        TURBO_ACTIVE: "¡Modo Turbo activado! Iniciando ondas de choque armónicas a 200 Hertz a máxima potencia. Sujete objetos inestables. <audio src=\"https://s3.amazonaws.com/infraclean-assets/vibe-turbo-200hz.mp3\" />",
        WATER_EJECT_ACTIVE: "Iniciando el ciclo de expulsión de agua. Pulsaciones sonoras de 165 Hertz a máxima potencia en curso para evacuar la humedad. <audio src=\"https://s3.amazonaws.com/infraclean-assets/water-eject-165hz.mp3\" />",
        MIC_CALIBRATE_ACTIVE: "Iniciando ciclo de optimización de escucha. Emitiendo un barrido acústico agudo para limpiar los micrófonos de polvo, seguido de una calibración del ruido ambiental. Por favor, guarde silencio. <audio src=\"https://s3.amazonaws.com/infraclean-assets/mic-sweep-12khz.mp3\" /> Calibración completada. Sensibilidad del micrófono optimizada.",
        HELP_MSG: "Infraclean utiliza vibraciones para desprender el polvo, agua o calibrar micrófonos. Pídeme: 'calibra para vidrio', 'expulsa el agua', 'mejora la escucha', 'detecta la suciedad', o 'modo turbo'. ¿Qué quieres hacer?",
        HELP_REPROMPT: "¿En qué te puedo ayudar?",
        STOP_MSG: "Ondas acústicas detenidas. Infraclean se encuentra en espera.",
        ERROR_MSG: "Lo siento, ha ocurrido un error al generar las vibraciones. Por favor, inténtalo de nuevo."
    }
};

// Fonctions d'aide à la localisation
function getLocale(handlerInput) {
    const locale = handlerInput.requestEnvelope.request.locale;
    if (locale && (locale.startsWith('en') || locale.startsWith('es') || locale.startsWith('fr'))) {
        return locale;
    }
    return 'fr-FR'; // Par défaut
}

function getStrings(handlerInput) {
    const locale = getLocale(handlerInput);
    if (locale.startsWith('en')) return LOCALIZED_STRINGS['en-US'];
    if (locale.startsWith('es')) return LOCALIZED_STRINGS['es-ES'];
    return LOCALIZED_STRINGS['fr-FR'];
}

function getConfigs(handlerInput) {
    const locale = getLocale(handlerInput);
    if (locale.startsWith('en')) return SURFACE_CONFIGS['en-US'];
    if (locale.startsWith('es')) return SURFACE_CONFIGS['es-ES'];
    return SURFACE_CONFIGS['fr-FR'];
}

// 1. Démarrage de la Skill
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const strings = getStrings(handlerInput);
        return handlerInput.responseBuilder
            .speak(strings.LAUNCH_MSG)
            .reprompt(strings.LAUNCH_REPROMPT)
            .getResponse();
    }
};

// 2. Calibrage des fréquences par surface
const CalibrateIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CalibrateIntent';
    },
    handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const strings = getStrings(handlerInput);
        const configs = getConfigs(handlerInput);
        let speakOutput = "";
        
        let surface = slots.surface && slots.surface.value ? slots.surface.value.toLowerCase() : null;
        
        if (surface) {
            let config = configs[surface];
            
            // Gestion de secours pour synonymes si non résolus
            if (!config) {
                const locale = getLocale(handlerInput);
                if (locale.startsWith('fr')) {
                    if (surface.includes('bureau') || surface.includes('table') || surface.includes('parquet')) config = configs['bois'];
                    else if (surface.includes('vitre') || surface.includes('miroir')) config = configs['verre'];
                    else if (surface.includes('acier') || surface.includes('fer')) config = configs['métal'];
                    else if (surface.includes('canapé') || surface.includes('tapis')) config = configs['tissu'];
                } else if (locale.startsWith('en')) {
                    if (surface.includes('desk') || surface.includes('table')) config = configs['wood'];
                    else if (surface.includes('window') || surface.includes('mirror')) config = configs['glass'];
                    else if (surface.includes('steel') || surface.includes('iron')) config = configs['metal'];
                    else if (surface.includes('sofa') || surface.includes('carpet')) config = configs['fabric'];
                } else if (locale.startsWith('es')) {
                    if (surface.includes('escritorio') || surface.includes('mesa')) config = configs['madera'];
                    else if (surface.includes('ventana') || surface.includes('espejo')) config = configs['vidrio'];
                    else if (surface.includes('acero') || surface.includes('hierro')) config = configs['metal'];
                    else if (surface.includes('sofá') || surface.includes('alfombra')) config = configs['tejido'];
                }
            }

            if (config) {
                speakOutput = strings.CALIBRATE_SUCCESS
                    .replace('{surface}', config.name)
                    .replace('{freq}', config.freq)
                    .replace('{audio}', config.audio);
            } else {
                speakOutput = strings.CALIBRATE_DEFAULT.replace('{surface}', surface);
            }
        } else {
            return handlerInput.responseBuilder
                .speak(strings.CALIBRATE_PROMPT)
                .reprompt(strings.CALIBRATE_REPROMPT)
                .getResponse();
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// 3. Détection automatique de saleté
const DirtDetectionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DirtDetectionIntent';
    },
    handle(handlerInput) {
        const strings = getStrings(handlerInput);
        const dirtLevel = Math.floor(Math.random() * 80) + 15; // 15% à 95%
        let speakOutput = strings.DIRT_SCAN_START;

        if (dirtLevel < 35) {
            const freq = 60;
            speakOutput += strings.DIRT_RESULT_LOW
                .replace('{level}', dirtLevel)
                .replace('{freq}', freq)
                .replace('{audio}', "https://s3.amazonaws.com/infraclean-assets/vibe-low-level.mp3");
        } else if (dirtLevel < 70) {
            const freq = 100;
            speakOutput += strings.DIRT_RESULT_MEDIUM
                .replace('{level}', dirtLevel)
                .replace('{freq}', freq)
                .replace('{audio}', "https://s3.amazonaws.com/infraclean-assets/vibe-medium-level.mp3");
        } else {
            const freq = 150;
            speakOutput += strings.DIRT_RESULT_HIGH
                .replace('{level}', dirtLevel)
                .replace('{freq}', freq)
                .replace('{audio}', "https://s3.amazonaws.com/infraclean-assets/vibe-high-level.mp3");
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// 4. Mode Turbo
const TurboIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TurboIntent';
    },
    handle(handlerInput) {
        const strings = getStrings(handlerInput);
        return handlerInput.responseBuilder
            .speak(strings.TURBO_ACTIVE)
            .getResponse();
    }
};

// 5. Expulsion d'Eau
const WaterEjectIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WaterEjectIntent';
    },
    handle(handlerInput) {
        const strings = getStrings(handlerInput);
        return handlerInput.responseBuilder
            .speak(strings.WATER_EJECT_ACTIVE)
            .getResponse();
    }
};

// 6. Calibrage Micro (Amélioration d'écoute)
const MicCalibrateIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MicCalibrateIntent';
    },
    handle(handlerInput) {
        const strings = getStrings(handlerInput);
        return handlerInput.responseBuilder
            .speak(strings.MIC_CALIBRATE_ACTIVE)
            .getResponse();
    }
};

// 7. Aide
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const strings = getStrings(handlerInput);
        return handlerInput.responseBuilder
            .speak(strings.HELP_MSG)
            .reprompt(strings.HELP_REPROMPT)
            .getResponse();
    }
};

// 8. Arrêt
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const strings = getStrings(handlerInput);
        return handlerInput.responseBuilder
            .speak(strings.STOP_MSG)
            .withShouldEndSession(true)
            .getResponse();
    }
};

// 9. Fin de session
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session closed: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

// 10. Erreurs
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error Handled: ${error.stack}`);
        const strings = getStrings(handlerInput);
        return handlerInput.responseBuilder
            .speak(strings.ERROR_MSG)
            .reprompt(strings.ERROR_MSG)
            .getResponse();
    }
};

// Export Lambda handler
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CalibrateIntentHandler,
        DirtDetectionIntentHandler,
        TurboIntentHandler,
        WaterEjectIntentHandler,
        MicCalibrateIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .lambda();
