const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateResponse(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Tu es un assistant de réservation de restaurant. Réponds de manière concise et polie."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

module.exports = generateResponse;
