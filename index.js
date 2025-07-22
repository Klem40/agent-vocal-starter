app.post("/process-recording", async (req, res) => {
  console.log("📦 Reçu :", req.body);

  const recordingUrl = req.body.RecordingUrl;
  if (!recordingUrl) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "fr-FR", voice: "alice" }, "Erreur, aucun enregistrement reçu.");
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const transcript = await transcribeAudioFromUrl(`${recordingUrl}.wav`, process.env.OPENAI_API_KEY);
    console.log("📝 Transcription :", transcript);

    const responseText = await generateResponse(transcript);
    console.log("🤖 Réponse GPT :", responseText);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "fr-FR", voice: "alice" }, responseText);
    res.type("text/xml");
    res.send(twiml.toString());

  } catch (err) {
    console.error("❌ Erreur :", err.message);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ language: "fr-FR", voice: "alice" }, "Erreur lors du traitement.");
    res.type("text/xml");
    res.send(twiml.toString());
  }
});
