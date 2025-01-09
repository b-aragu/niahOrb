import Experience from "./Experience.js";
import LLMCommunication from "./LLMCommunication.js";

export default class Microphone {
  constructor() {
    this.llmCommunication = new LLMCommunication();
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.ready = false;
    this.volume = 0;
    this.levels = [];
    this.isSpeaking = false;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((_stream) => {
        this.stream = _stream;

        this.init();

        if (this.debug) {
          this.setSpectrum();
        }
      });
  }

  init() {
    this.audioContext = new AudioContext();

    this.mediaStreamSourceNode = this.audioContext.createMediaStreamSource(
      this.stream
    );

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;

    this.mediaStreamSourceNode.connect(this.analyserNode);

    this.floatTimeDomainData = new Float32Array(this.analyserNode.fftSize);
    this.byteFrequencyData = new Uint8Array(this.analyserNode.fftSize);

    this.ready = true;
    this.initSpeechRecognition();
  }
  initSpeechRecognition() {
    console.log("Initializing speech recognition...");
    this.recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    this.recognition.lang = "en-US";
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("You said:", transcript);
      this.handleTranscript(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed" || event.error === "network") {
        console.warn("Critical error detected, stopping recognition.");
        this.stopListening();
      } else {
        console.warn("Non-critical error, restarting recognition.");
        if (this.recognition && this.recognition.running) {
          console.log("Speech recognition is already running.");
        } else {
          // Start recognition only if it's not already running
          this.recognition.start();
        }
      }
    };

    this.recognition.onend = () => {
      this.recognition.start(); // Restart recognition after it ends
    };

    this.recognition.start();
    console.log("Speech recognition started...");
  }
  handleTranscript(transcript) {
    // Log the transcript received
    console.log("Transcript received:", transcript);

    // Send the transcript to Groq via LLMCommunication
    this.llmCommunication
      .sendToGroq(transcript)
      .then((aiResponse) => {
        // AI response from the backend
        console.log("AI Response:", aiResponse);

        // Now, talk back the AI's response
        this.talkBack(aiResponse);
      })
      .catch((error) => {
        console.error("Error during communication:", error);
        this.talkBack("Sorry, there was an error processing your request.");
      });
  }

  talkBack(text) {
    const utterance = new SpeechSynthesisUtterance(text); // Create a new speech utterance
    utterance.lang = "en-US"; // Set the language for the speech (optional)

    // Pause speech recognition while AI is talking
    if (this.recognition && this.recognition.running) {
      console.log("Pausing speech recognition...");
      this.recognition.stop();
    }

    // Set the flag to indicate the AI is speaking
    this.isSpeaking = true;

    // Restart recognition after speech synthesis ends
    utterance.onend = () => {
      console.log("Talk back finished. Restarting speech recognition...");
      this.isSpeaking = false; // Reset the flag
      setTimeout(() => {
        if (this.recognition && !this.recognition.running) {
          this.recognition.start();
        }
      }, 500); // 500ms delay

      if (this.recognition && !this.recognition.running) {
        this.recognition.start();
      }
    };

    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error);
      this.isSpeaking = false; // Reset the flag on error

      // Ensure recognition restarts even on error
      if (this.recognition && !this.recognition.running) {
        this.recognition.start();
      }
    };

    window.speechSynthesis.speak(utterance); // Speak the text aloud
    console.log("Talk back: ", text);
  }

  // Example function for recognition (optional)
  onRecognitionResult(event) {
    if (this.isSpeaking) {
      console.log("Speech recognition ignored while speaking.");
      return; // Ignore results during speech synthesis
    }
    console.log("Speech recognition result:", event.results[0][0].transcript);
  }
  setSpectrum() {
    this.spectrum = {};

    this.spectrum.width = this.analyserNode.fftSize;
    this.spectrum.height = 128;
    this.spectrum.halfHeight = Math.round(this.spectrum.height * 0.5);

    this.spectrum.canvas = document.createElement("canvas");
    this.spectrum.canvas.width = this.spectrum.width;
    this.spectrum.canvas.height = this.spectrum.height;
    this.spectrum.canvas.style.position = "fixed";
    this.spectrum.canvas.style.left = 0;
    this.spectrum.canvas.style.bottom = 0;
    document.body.append(this.spectrum.canvas);

    this.spectrum.context = this.spectrum.canvas.getContext("2d");
    this.spectrum.context.fillStyle = "#ffffff";

    this.spectrum.update = () => {
      this.spectrum.context.clearRect(
        0,
        0,
        this.spectrum.width,
        this.spectrum.height
      );

      for (let i = 0; i < this.analyserNode.fftSize; i++) {
        const floatTimeDomainValue = this.floatTimeDomainData[i];
        const byteFrequencyValue = this.byteFrequencyData[i];
        const normalizeByteFrequencyValue = byteFrequencyValue / 255;

        const x = i;
        const y =
          this.spectrum.height -
          normalizeByteFrequencyValue * this.spectrum.height;
        const width = 1;
        // const height = floatTimeDomainValue * this.spectrum.height
        const height = normalizeByteFrequencyValue * this.spectrum.height;

        this.spectrum.context.fillRect(x, y, width, height);
      }
    };
  }

  getLevels() {
    const bufferLength = this.analyserNode.fftSize;
    const levelCount = 8;
    const levelBins = Math.floor(bufferLength / levelCount);

    const levels = [];
    let max = 0;

    for (let i = 0; i < levelCount; i++) {
      let sum = 0;

      for (let j = 0; j < levelBins; j++) {
        sum += this.byteFrequencyData[i * levelBins + j];
      }

      const value = sum / levelBins / 256;
      levels[i] = value;

      if (value > max) max = value;
    }

    return levels;
  }

  getVolume() {
    let sumSquares = 0.0;
    for (const amplitude of this.floatTimeDomainData) {
      sumSquares += amplitude * amplitude;
    }

    return Math.sqrt(sumSquares / this.floatTimeDomainData.length);
  }

  update() {
    if (!this.ready) return;

    // Retrieve audio data
    this.analyserNode.getByteFrequencyData(this.byteFrequencyData);
    this.analyserNode.getFloatTimeDomainData(this.floatTimeDomainData);

    this.volume = this.getVolume();
    this.levels = this.getLevels();

    // Spectrum
    if (this.spectrum) this.spectrum.update();
  }
}
