const express = require("express");
const twilio = require("twilio");
const bodyParser = require("body-parser");
const transcribeAudioFromUrl = require("./transcription");
const generateResponse = require("./generate-response");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();

// IMPORTANT : extended:true pour bien parser le form Twilio
app.use(bodyParser.urlencoded({ extended: true }));

const VOICE_MESSAGE = "Bonjour, bienvenue chez Skeall. Que puis-je faire pour vous aujourd’hui ?";

// === Reçoit l'appel entrant ===
app.post("/voice", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say({ language: "fr-FR", voice: "alice" }, VOICE_MESSAGE);
  twiml.record({
    maxLength: 15,
    action: "/process-recording",
    method: "POST",
    transcribe: false
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// === Reçoit l'enregistrement après que l'appelant ait parlé ===
app.post("/process-recording", async (req, res) => {
  console.log("📦 Reçu body :", req.body);

  const recordingUrl = req.body.RecordingUrl;
  console.log("📞 URL de l'enregistrement :", recordingUrl);

  if (!recordingUrl) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "fr-FR", voice: "alice" }, "Erreur, aucun enregistrement reçu.");
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  try {
    // Laisser Twilio finaliser le fichier
    await new Promise(r => setTimeout(r, 3000));

    // Transcrire
    const transcript = await transcribeAudioFromUrl(recordingUrl, OPENAI_API_KEY);
    console.log("📝 Transcription :", transcript);

    // Générer réponse
    const responseText = await generateResponse(transcript);
    console.log("🤖 Réponse GPT :", responseText);

    // Lire la réponse
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "fr-FR", voice: "alice" }, responseText);
    res.type("text/xml");
    res.send(twiml.toString());

  } catch (err) {
    console.error("❌ Erreur :", err);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "fr-FR", voice: "alice" }, "Désolé, une erreur est survenue.");
    res.type("text/xml");
    res.send(twiml.toString());
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur le port ${PORT}`);
});
