const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function transcribeAudioFromUrl(audioUrl, apiKey) {
  const filePath = "/tmp/audio.wav";

  // Télécharger le fichier audio depuis Twilio
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    method: "get",
    url: `${audioUrl}.wav`,
    responseType: "stream",
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
  form.append("response_format", "text");

  const transcript = await axios.post("https://api.openai.com/v1/audio/transcriptions", form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return transcript.data;
}

module.exports = transcribeAudioFromUrl;
