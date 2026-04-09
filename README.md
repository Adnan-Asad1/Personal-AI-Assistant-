# 🤖 Nexus - Voice-Activated AI Assistant

> *"Just A Rather Very Intelligent System"*

A highly advanced, voice-activated AI assistant built with **React**, designed to mimic the iconic J.A.R.V.I.S from the Iron Man universe. It combines real-time speech recognition, live web scraping for up-to-date facts, and ultra-fast LLM inference using Groq, wrapped in a beautiful, cinematic neon UI

## ✨ Features

- **🎙️ Voice Recognition (STT):** Listens to your commands using native browser Speech Recognition.
- **🧠 Advanced Intelligence:** Powered by **Meta's Llama 3.1** via the blazing-fast **Groq API**.
- **🌐 Live Web Search:** Automatically searches the internet (via DuckDuckGo Lite & Wikipedia) to fetch real-time facts before answering. No outdated knowledge!
- **🗣️ British AI Voice (TTS):** Uses native Speech Synthesis engineered to prioritize a robotic but charming British male accent.
- **✨ Cinematic Orb UI:** A gorgeous, interactive React UI built with **Tailwind CSS**. The orb changes states (Idle, Listening, Searching, Speaking) with dynamic glowing animations and responsive voice bars.
- **🎭 Character Prompting:** Programmed to refer to you as "Sir" or "Madam", maintaining a formal, precise, and subtly sarcastic personality.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite
- **Styling:** Tailwind CSS (v4)
- **AI/LLM Engine:** Groq API (`llama-3.1-8b-instant`)
- **Web Scraping:** Axios & Cheerio
- **Browser APIs:** `SpeechRecognition` & `speechSynthesis`

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your machine.
- A free API key from [Groq](https://console.groq.com/).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Adnan-Asad1/Personal-AI-Assistant-.git
   cd Personal-AI-Assistant-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`. Click the central orb to initialize the voice override and start talking to J.A.R.V.I.S!

## 🔮 How It Works Under The Hood

1. **Listen:** The `useSpeech` hook captures your voice and transcribes it into text.
2. **Search:** The LLM reformulates your query. J.A.R.V.I.S searches the web (DuckDuckGo/Wikipedia) for live context.
3. **Think:** The live data is fed back into Llama 3.1 alongside your original prompt.
4. **Speak:** Nexus generates a concise, character-accurate response and speaks it aloud while the UI orb visualizes the audio.

---
*Created by [Adnan Asad](https://github.com/Adnan-Asad1)*
