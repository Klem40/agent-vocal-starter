const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

async function transcribeAudioFromUrl(audioUrl, apiKey) {
  const filePath = "/tmp/audio.wav";

  // Télécharger le fichier audio depuis Twilio avec authentification
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    method: "get",
    url: `${audioUrl}.wav`,
    responseType: "stream",
    auth: {
      username: ACCOUNT_SID,
      password: AUTH_TOKEN,
    },
  });

  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  // Préparer l'envoi à Whisper
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("model", "whisper-1");
  form.append("language", "fr");
  form.append("resp
