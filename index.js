app.post("/process-recording", async (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  console.log("URL de l'enregistrement :", recordingUrl);

  try {
    console.log("⏳ Attente de 3 secondes avant téléchargement de l’audio...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("📥 Téléchargement de :", `${recordingUrl}.wav`);
    const transcript = await transcribeAudioFromUrl(recordingUrl, process.env.OPENAI_API_KEY);

    console.log("📝 Transcription :", transcript);
    const responseText = await generateResponse(transcript);
    console.log("🤖 Réponse GPT :", responseText);

    // Réponse vocale directe
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "fr-FR", voice: "alice" }, responseText);
    res.set("Content-Type", "text/xml");
    res.send(twiml.toString());

  } catch (err) {
    console.error("❌ Erreur :", err.message);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "fr-FR", voice: "alice" }, "Désolé, une erreur est survenue lors du traitement de votre demande.");
    res.set("Content-Type", "text/xml");
    res.send(twiml.toString());
  }
});
