module.exports = async function generateResponse(transcript) {
  const lower = transcript.toLowerCase();

  if (lower.includes("réserver") || lower.includes("table")) {
    return "Très bien, pour combien de personnes souhaitez-vous réserver ?";
  }

  if (lower.includes("deux") || lower.includes("3") || lower.includes("quatre")) {
    return "Merci. À quel nom puis-je noter la réservation ?";
  }

  if (lower.includes("je m'appelle") || lower.includes("nom")) {
    return "Merci beaucoup, votre réservation est notée. À bientôt !";
  }

  return "Pouvez-vous reformuler s'il vous plaît ?";
};
