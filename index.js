const express = require("express");
const bodyParser = require("body-parser");
const transcribeAudioFromUrl = require("./transcription");
const generateResponse = require("./generate-response");

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/voice", async (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  console.log("📞 URL de l'enregistrement :", recordingUrl);

  if (!recordingUrl) {
    return res.status(400).send("Aucune URL d'enregistrement fournie.");
  }

  try {
    console.log("⏳ Attente de 3 secondes avant téléchargement de l’audio...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("📥 Téléchargement de :", `${recordingUrl}.wav`);
    const transcript = await transcribeAudioFromUrl(recordingUrl, process.env.OPENAI_API_KEY);

    console.log("✅ Audio téléchargé, envoi à Whisper...");
    console.log("📝 Transcription reçue.");
    console.log("Transcription Whisper :", transcript);

    const responseText = await generateResponse(transcript);
    console.log("🤖 Réponse générée :", responseText);

    res.set("Content-Type", "text/xml");
    res.send(`
      <Response>
        <Say language="fr-FR" voice="alice">${responseText}</Say>
      </Response>
    `);
  } catch (error) {
    console.error("❌ Erreur dans la transcription ou la génération :", error);
    res.status(500).send("Erreur du serveur.");
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur en écoute sur le port ${port}`);
});
