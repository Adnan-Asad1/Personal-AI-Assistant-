import React, { useState, useEffect } from 'react';
import { useSpeech } from './hooks/useSpeech';
import { generateJarvisResponse } from './services/llmService';
import './index.css';

function App() {
  const { isListening, transcript, listen, speak } = useSpeech();
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'listening', 'processing', 'speaking'

  // When listening stops, process the transcript if it exists
  useEffect(() => {
    if (!isListening && transcript) {
      handleQuery(transcript);
    } else if (isListening) {
      setStatus('listening');
    } else if (status === 'listening' && !transcript) {
      setStatus('idle');
    }
  }, [isListening, transcript]);

  const handleQuery = async (query) => {
    setStatus('processing');
    setResponse(''); // Clear previous response

    // Send the voice transcript to our Groq/Llama3 function, passing a callback
    // so Jarvis can tell the UI when he is searching the web!
    const aiResponse = await generateJarvisResponse(query, (newStatus) => {
      setStatus(newStatus);
    });

    setResponse(aiResponse);
    setStatus('speaking');

    // Call our speech synthesis
    speak(aiResponse);

    // Naive way to return to idle after a few seconds of speaking
    setTimeout(() => setStatus('idle'), aiResponse.length * 70);
  };

  const getOrbStyle = () => {
    switch (status) {
      case 'listening': return 'orb-listening bg-orange-500/80';
      case 'searching': return 'orb-speaking bg-purple-500/80 shadow-[0_0_50px_rgba(150,0,255,0.4)]'; // Purple when searching!
      case 'processing': return 'orb-speaking bg-green-400/80';
      case 'speaking': return 'orb-speaking bg-cyan-400/80';
      default: return 'orb-idle bg-cyan-500/40';
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-start py-12 bg-[#050510] font-sans selection:bg-cyan-500/30">

      {/* Background ambient gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[150px]"></div>
      </div>

      <div className="z-10 flex flex-col items-center max-w-2xl w-full px-6 text-center space-y-12">

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            J.A.R.V.I.S.
          </h1>
          <p className="text-cyan-200/50 text-sm tracking-widest uppercase font-mono">
            Voice-Activated AI Assistant
          </p>
        </div>

        {/* The Orb */}
        <div className="relative flex justify-center items-center w-64 h-64 mt-8 mb-4">
          <div
            onClick={() => {
              if (status === 'idle') listen();
              else window.speechSynthesis.cancel(); // Stop talking if clicked while speaking
            }}
            className={`w-48 h-48 rounded-full cursor-pointer transition-all duration-500 ${getOrbStyle()} shadow-[0_0_50px_rgba(0,255,255,0.2)] border border-cyan-500/30 backdrop-blur-md flex items-center justify-center`}
          >
            {/* Inner Core */}
            <div className="w-32 h-32 rounded-full bg-[#0a0f1d] shadow-inner flex items-center justify-center border border-white/5 relative overflow-hidden">
              {status === 'speaking' && (
                <div className="flex items-end justify-center space-x-1 h-16 opacity-70">
                  <div className="w-1.5 bg-cyan-400 rounded-full voice-bar"></div>
                  <div className="w-1.5 bg-cyan-400 rounded-full voice-bar"></div>
                  <div className="w-1.5 bg-cyan-400 rounded-full voice-bar"></div>
                  <div className="w-1.5 bg-cyan-400 rounded-full voice-bar"></div>
                  <div className="w-1.5 bg-cyan-400 rounded-full voice-bar"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Text & Controls */}
        <div className="w-full flex flex-col items-center">

          <button
            onClick={listen}
            disabled={status !== 'idle'}
            className="px-8 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all uppercase tracking-widest text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {status === 'idle' ? 'Initialize Voice Override' : status.toUpperCase() + '...'}
          </button>

          {/* Transcript (User Input) */}
          <div className="text-white/60 text-lg font-light italic min-h-[32px] transition-opacity">
            {transcript ? `"${transcript}"` : ''}
          </div>

          {/* AI Response Text */}
          <div className="text-cyan-100 text-xl font-medium tracking-wide leading-relaxed mt-4 drop-shadow-md pb-12 w-full max-w-3xl">
            {response}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
