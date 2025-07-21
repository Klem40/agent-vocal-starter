const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function transcribeAudioFromUrl(audioUrl, openaiApiKey) {
  const filePath = path.join("/tmp", "audio.wav");

  console.log("⏳ Attente de 3 secondes avant téléchargement de l’audio...");
  await wait(3000); // ⚠️ twilio met parfois du temps à rendre dispo le fichier

  try {
    console.log("📥 Téléchargement de :", audioUrl + ".wav");

    const response = await axios({
      method: "get",
      url: `${audioUrl}.wav`,
      responseType: "stream",
      auth: {
        username: TWILIO_ACCOUNT_SID,
        password: TWILIO_AUTH_TOKEN,
      },
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("✅ Audio téléchargé, envoi à Whisper...");

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("model", "whisper-1");
    form.append("language", "fr");
    form.append("response_format", "text");

    const transcript = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    console.log("📝 Transcription reçue.");
    return transcript.data;

  } catch (err) {
    console.error("❌ Erreur dans la transcription :", err.message);
    throw err;
  }
}

module.exports = transcribeAudioFromUrl;
