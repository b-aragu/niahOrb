export default class LLMCommunication {
  constructor() {
    this.apiUrl = "http://localhost:3000/send_to_groq";
  }

  async sendToGroq(speech) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ speech: speech }), // Send speech data to backend
      });

      const data = await response.json();
      const aiResponse = data.ai_response || "No response from Groq";
      console.log("Groq Response:", aiResponse);

      // Return the AI response
      return aiResponse;
    } catch (error) {
      console.error("Error sending to Groq:", error);
      throw error; // Throw error so it can be handled by caller
    }
  }
}
