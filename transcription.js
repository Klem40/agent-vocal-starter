const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function transcribeAudioFromUrl(audioUrl, openaiApiKey) {
  const filePath = "/tmp/audio.wav";

  // Télécharger le fichier audio depuis Twilio (sans ajouter .wav)
  const response = await axios({
    method: "get",
    url: audioUrl,
    responseType: "stream",
    auth: {
      username: process.env.TWILIO_ACCOUNT_SID,
      password: process.env.TWILIO_AUTH_TOKEN
    }
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  // Préparer la requête pour Whisper
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("model", "whisper-1");
  form.append("language", "fr");
  form.append("response_format", "text");

  const transcription = await axios.post("https://api.openai.com/v1/audio/transcriptions", form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${openaiApiKey}`
    }
  });

  return transcription.data;
}

module.exports = transcribeAudioFromUrl;
