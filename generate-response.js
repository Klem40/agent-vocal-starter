const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function generateResponse(transcript) {
  const systemPrompt = `Tu es un assistant vocal pour un restaurant français. Réponds poliment, de façon naturelle et concise. Donne une réponse claire à la demande du client.`;

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript },
    ],
  });

  return completion.data.choices[0].message.content.trim();
}

module.exports = generateResponse;
