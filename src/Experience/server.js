require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON bodies

// Endpoint to handle speech input and communicate with Groq API
app.post("/send_to_groq", async (req, res) => {
  const apiKey = process.env.GROK_API_KEY; // Groq API Key from .env file
  const apiUrl = "https://api.groq.com/openai/v1/chat/completions"; // Groq API URL

  const { speech } = req.body; // Get speech input from the request body

  // Validate input
  if (!speech || typeof speech !== "string" || speech.trim() === "") {
    return res.status(400).json({ error: "Invalid or empty speech input" });
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "mixtral-8x7b-32768", // Specify the Groq model (adjust as necessary)
        messages: [
          {
            role: "system",
            content:
              "You are Niah, an advanced AI assistant specializing in dentistry. Your role is to provide accurate, evidence-based information on dental health, treatments, oral hygiene, and best practices. Always keep your responses brief, clear, and focused, addressing only the essential points. Avoid unnecessary elaboration or repetition. Use professional yet empathetic language to ensure clarity and trust. When discussing medications or treatments, provide general guidance and recommend consulting a dentist or healthcare professional for personalized advice.",
          },

          { role: "user", content: speech }, // Send the user input to Groq
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`, // Use the API key from the .env file
        },
      }
    );

    const aiResponse =
      response.data.choices[0]?.message?.content || "No response from Groq";
    return res.json({ ai_response: aiResponse });
  } catch (error) {
    console.error("Error communicating with Groq:", error);

    // More detailed error handling
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Groq API error: ${
          error.response.data.message || "Unknown error"
        }`,
      });
    } else if (error.request) {
      return res.status(500).json({
        error: "No response from Groq. Please try again later.",
      });
    } else {
      return res.status(500).json({ error: "Server error. Please try again." });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
