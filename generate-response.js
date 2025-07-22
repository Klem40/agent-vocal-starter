const OpenAI = require("openai");
const openai = new OpenAI();

async function generateResponse(transcript) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Tu es un assistant vocal de réservation très rapide, poli, qui parle en une seule phrase courte.",
      },
      {
        role: "user",
        content: transcript,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 50,
  });

  return completion.choices[0].message.content;
}

module.exports = generateResponse;
