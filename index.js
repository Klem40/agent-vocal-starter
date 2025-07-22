const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { exec } = require("child_process");
const { OpenAI } = require("openai");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/voice", async (req, res) => {
  const recordingUrl = req.body.RecordingUrl;

  // 🧠 Répondre immédiatement à Twilio pour éviter que ça raccroche
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say({ voice: "Polly.Celine", language: "fr-FR" }, "Merci, je traite votre demande.");
  res.type("text/xml").send(twiml.toString());

  // 🔁 Continue en asynchrone
  if (!recordingUrl) return;

  console.log("📞 URL de l'enregistrement :", recordingUrl);
  const audioUrl = `${recordingUrl}.wav`;

  console.log("⏳ Attente de 3 secondes avant téléchargement de l’audio...");
  await new Promise((r) => setTimeout(r, 3000));

  const audioPath = "/tmp/audio.wav";
  const writer = fs.createWriteStream(audioPath);

  const response = await axios.get(audioUrl, { responseType: "stream" });
  response.data.pipe(writer);

  await new Promise((resolve) => writer.on("finish", resolve));
  console.log("✅ Audio téléchargé, envoi à Whisper...");

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    language: "fr"
  });

  const prompt = `Tu es un assistant vocal de réservation de restaurant. L'utilisateur dit : "${transcription.text}". Réponds très brièvement, très naturellement, en tutoyant, et évite les questions inutiles.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });

  const gptResponse = completion.choices[0].message.content.trim();
  console.log("📝 Transcription :", transcription.text);
  console.log("🤖 Réponse GPT :", gptResponse);
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`🚀 Serveur en écoute sur le port ${port}`);
});
