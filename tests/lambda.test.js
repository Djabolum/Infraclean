/**
 * Jest Unit Tests for Infraclean Alexa Skill Lambda Backend
 * Tech Stack: Jest, ASK SDK
 */

const { handler } = require('../lambda/index.js');

// Helper to construct a mock Alexa Request Envelope
function createRequestEnvelope(requestType, intentName = null, slots = {}, locale = 'fr-FR') {
    const envelope = {
        version: '1.0',
        session: {
            new: true,
            sessionId: 'amzn1.echo-api.session.123456789012',
            application: {
                applicationId: 'amzn1.echo-api.application.123'
            },
            user: {
                userId: 'amzn1.ask.account.123'
            }
        },
        context: {
            System: {
                application: {
                    applicationId: 'amzn1.echo-api.application.123'
                },
                user: {
                    userId: 'amzn1.ask.account.123'
                },
                device: {
                    supportedInterfaces: {}
                },
                apiEndpoint: 'https://api.amazonalexa.com',
                apiAccessToken: 'mock-token'
            }
        },
        request: {
            type: requestType,
            requestId: 'amzn1.echo-api.request.123',
            timestamp: new Date().toISOString(),
            locale: locale
        }
    };

    if (requestType === 'IntentRequest' && intentName) {
        envelope.request.intent = {
            name: intentName,
            confirmationStatus: 'NONE',
            slots: {}
        };
        for (const [key, value] of Object.entries(slots)) {
            envelope.request.intent.slots[key] = {
                name: key,
                value: value,
                confirmationStatus: 'NONE'
            };
        }
    }

    return envelope;
}

// Promise wrapper to call the Lambda handler
function runAlexaSkill(requestEnvelope) {
    return new Promise((resolve, reject) => {
        handler(requestEnvelope, {}, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

describe('Infraclean Alexa Skill Lambda Unit Tests', () => {

    test('1. LaunchRequest - French Locale', async () => {
        const req = createRequestEnvelope('LaunchRequest', null, {}, 'fr-FR');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Bienvenue dans Infraclean");
        expect(res.response.shouldEndSession).toBe(false); // Expect prompt for next action
    });

    test('2. LaunchRequest - English Locale', async () => {
        const req = createRequestEnvelope('LaunchRequest', null, {}, 'en-US');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Welcome to Infraclean");
        expect(res.response.shouldEndSession).toBe(false);
    });

    test('3. LaunchRequest - Spanish Locale', async () => {
        const req = createRequestEnvelope('LaunchRequest', null, {}, 'es-ES');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Bienvenido a Infraclean");
        expect(res.response.shouldEndSession).toBe(false);
    });

    test('4. CalibrateIntent - Wood Surface (French)', async () => {
        const req = createRequestEnvelope('IntentRequest', 'CalibrateIntent', { surface: 'bois' }, 'fr-FR');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Calibrage effectué pour le bois");
        expect(res.response.outputSpeech.ssml).toContain("80 Hertz");
    });

    test('5. CalibrateIntent - Unknown Surface (French fallback)', async () => {
        const req = createRequestEnvelope('IntentRequest', 'CalibrateIntent', { surface: 'plastique' }, 'fr-FR');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("vibration de sécurité à 70 Hertz");
    });

    test('6. DirtDetectionIntent - French scan response', async () => {
        const req = createRequestEnvelope('IntentRequest', 'DirtDetectionIntent', {}, 'fr-FR');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Analyse acoustique en cours");
        expect(res.response.outputSpeech.ssml).toContain("poussière");
    });

    test('7. TurboIntent - French active response', async () => {
        const req = createRequestEnvelope('IntentRequest', 'TurboIntent', {}, 'fr-FR');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Mode Turbo engagé");
    });

    test('8. WaterEjectIntent - French active response', async () => {
        const req = createRequestEnvelope('IntentRequest', 'WaterEjectIntent', {}, 'fr-FR');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Lancement du cycle d'expulsion d'eau");
    });

    test('9. MicCalibrateIntent - French listening improvement response', async () => {
        const req = createRequestEnvelope('IntentRequest', 'MicCalibrateIntent', {}, 'fr-FR');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Lancement du cycle d'optimisation d'écoute");
        expect(res.response.outputSpeech.ssml).toContain("Seuil de capture micro optimisé");
    });

    test('10. AMAZON.StopIntent - standby response', async () => {
        const req = createRequestEnvelope('IntentRequest', 'AMAZON.StopIntent', {}, 'fr-FR');
        const res = await runAlexaSkill(req);
        
        expect(res.response).toBeDefined();
        expect(res.response.outputSpeech.ssml).toContain("Arrêt immédiat des ondes acoustiques");
        expect(res.response.shouldEndSession).toBe(true); // Should close skill on Stop
    });
});
