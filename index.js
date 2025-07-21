const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');

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

app.post('/process-recording', (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  console.log("URL de l'enregistrement :", recordingUrl);
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({ language: 'fr-FR' }, "Merci, je traite votre demande.");
  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
