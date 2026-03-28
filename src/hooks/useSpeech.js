import { useState, useEffect, useCallback } from 'react';

export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        // Initialize Web Speech API for Recognition (STT)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onstart = () => setIsListening(true);
            recognitionInstance.onend = () => setIsListening(false);

            recognitionInstance.onresult = (event) => {
                const current = event.resultIndex;
                const currentTranscript = event.results[current][0].transcript;
                setTranscript(currentTranscript);
            };

            setRecognition(recognitionInstance);
        } else {
            console.warn("Speech Recognition API is not supported in this browser.");
        }
    }, []);

    const listen = () => {
        if (recognition) {
            setTranscript(''); // Clear previous
            try {
                recognition.start();
            } catch (err) {
                console.error("Microphone is already listening.", err);
            }
        }
    };

    const speak = useCallback((text) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Attempt to find a robust British Male voice
            const voices = window.speechSynthesis.getVoices();

            // Prioritize masculine British voices first
            let jarvisVoice = voices.find(v =>
                (v.name.includes('Google UK English Male')) ||
                (v.name.includes('Daniel') && v.lang.includes('en-GB')) ||
                (v.name.includes('Arthur') && v.lang.includes('en-GB')) ||
                (v.name.includes('UK') && v.name.includes('Male'))
            );

            // Fallback to any British voice if a specific male one isn't found
            if (!jarvisVoice) {
                jarvisVoice = voices.find(v => v.lang === 'en-GB' || v.lang === 'en-UK');
            }

            // Final fallback to just any decent English voice
            if (!jarvisVoice) {
                jarvisVoice = voices.find(v => v.lang.startsWith('en-'));
            }

            if (jarvisVoice) {
                utterance.voice = jarvisVoice;
            }

            // Deepen the pitch slightly to sound more robotic/masculine
            utterance.pitch = 0.8;
            utterance.rate = 1.0;

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Text-to-Speech is not supported in this browser.");
        }
    }, []);

    // Trick to load voices properly in Chrome
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            }
        }
    }, []);

    return { listen, isListening, transcript, speak };
};
