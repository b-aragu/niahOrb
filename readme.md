# Niah Orb

**Niah Orb** is an advanced AI assistant specializing in dentistry, designed to provide accurate, concise information on dental health, treatments, oral hygiene, and best practices. Whether you’re a dental professional or a patient, Niah Orb is here to assist with clear, focused explanations and treatment guidance.

## Features

- **AI-driven Responses:** Get quick, evidence-based information on dental topics.
- **Clear & Concise:** Niah Orb ensures that responses are brief and focused while remaining informative.
- **Empathetic Interaction:** Niah Orb communicates with a professional yet empathetic tone.
- **Medications & Treatments:** General insights with recommendations to consult a healthcare professional for personalized advice.

## Installation

### Prerequisites

- **Node.js** (v14 or later)
- **npm** (Node Package Manager)
- **Grok API Key** (you must have a valid Grok API key)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/niah-orb.git
   cd niah-orb
   ```

2. Install dependencies:

```bash

npm install
```

3. Create a .env file in the root directory and add your Grok API key:

```bash
GROK_API_KEY=your_grok_api_key_here
```

4. Backend Setup:
   To handle the API requests, you need to run the backend server. This server provides the `/send_to_grok` endpoint that the frontend will use to send information to the **Grok API** for processing.

5. Start the backend server:

```bash
node src/Experience/server.js
```

This will start the backend server and provide the /send_to_grok API endpoint at http://localhost:3000/send_to_grok.

6. Frontend Setup:
   The frontend will send captured speech data to the backend API, process it through the Grok API, and provide spoken responses back to the user.

Start the frontend development server:

```
bash
npm run dev
```

The frontend will be available at http://localhost:8080.

### API Communication Flow

1. The frontend captures the user's speech.
2. The captured speech is sent via a POST request to the backend at the `/send_to_grok` endpoint.
3. The backend sends the speech data to the Grok API for processing.
4. The Grok API processes the input and sends a response back.
5. The frontend receives the response and uses speech synthesis to talk back to the user.

### Credits

**Niah Orb** is inspired by **Organic Sphere** by [Bruno Simon](https://bruno-simon.com). The source code for the original project can be found on [GitHub](https://github.com/brunosimon/organic-sphere).

### License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) - see the LICENSE file for details.
