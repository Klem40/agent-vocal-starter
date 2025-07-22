const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const textToSpeech = require("@google-cloud/text-to-speech");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new textToSpeech.TextToSpeechClient();

app.post("/voice", async (req, res) => {
  console.log("📞 Appel reçu");
  const twiml = `
    <Response>
      <Say voice="alice" language="fr-FR">Merci. Je traite votre demande.</Say>
      <Pause length="2" />
      <Hangup/>
    </Response>
  `;
  res.type("text/xml").send(twiml);
});

app.listen(port, () => {
  console.log(`🚀 Serveur en écoute sur le port ${port}`);
});
