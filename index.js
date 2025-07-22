const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const https = require("https");
const path = require("path");
const twilio = require("twilio");
const transcribeAudio = require("./transcription");
const generateResponse = require("./generate-response");

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Téléchargement de l'audio Twilio
async function downloadAudio(url) {
  console.log("⏳ Attente de 3 secondes avant téléchargement de l’audio...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const filePath = path.join(__dirname, "recording.wav");

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(`${url}.wav`, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log("📥 Audio téléchargé, envoi à Whisper...");
        resolve(filePath);
      });
    }).on("error", (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Route initiale de réponse à l'appel
app.post("/voice", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    {
      voice: "Polly.Celine-Neural",
      language: "fr-FR",
    },
    "Bonjour, vous pouvez parler après le bip. Nous allons vous répondre."
  );
  twiml.record({
    timeout: 3,
    transcribe: false,
    maxLength: 15,
    action: "/recording",
    method: "POST",
  });
  res.type("text/xml");
  res.send(twiml.toString());
});

// Route de traitement après l'enregistrement
app.post("/recording", async (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  console.log("📞 URL de l'enregistrement :", recordingUrl);

  if (!recordingUrl) return res.send("Missing recording URL");

  const audioPath = await downloadAudio(recordingUrl);
  const transcript = await transcribeAudio(audioPath);
  console.log("📝 Transcription :", transcript);

  const responseText = await generateResponse(transcript);
  console.log("🤖 Réponse GPT :", responseText);

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    {
      voice: "Polly.Celine-Neural",
      language: "fr-FR",
    },
    responseText
  );
  twiml.redirect("/voice");

  res.type("text/xml");
  res.send(twiml.toString());
});

// Lancer le serveur
app.listen(port, () => {
  console.log("🚀 Serveur en écoute sur le port", port);
});
