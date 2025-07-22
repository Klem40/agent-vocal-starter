const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const transcribeAudioFromUrl = require('./transcription');
const generateResponse = require('./generate-response');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const VOICE_MESSAGE = "Bonjour, bienvenue chez Skeall. Que puis-je faire pour vous aujourd’hui ?";

app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say({ language: 'fr-FR', voice: 'alice' }, VOICE_MESSAGE);
  twiml.record({
    maxLength: 15,
    action: '/process-recording',
    method: 'POST',
    transcribe: false
  });

  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/process-recording', async (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  console.log("URL de l'enregistrement :", recordingUrl);

  // Réponse rapide à Twilio
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({ language: 'fr-FR' }, "Merci, je traite votre demande.");
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());

  // Traitement asynchrone
  try {
    if (!recordingUrl) {
      console.error("RecordingUrl manquant");
      return;
    }

    const transcription = await transcribeAudioFromUrl(recordingUrl, OPENAI_API_KEY);
    console.log("📝 Transcription :", transcription);

    const response = await generateResponse(transcription);
    console.log("🤖 Réponse GPT :", response);

  } catch (err) {
    console.error("Erreur GPT ou transcription :", err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
