import axios from 'axios';
import { performWebSearch } from './searchService';

// IMPORTANT: In a real production app, never expose your API key in the frontend code.
// This is for demonstration and local personal use only.
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const BASE_SYSTEM_PROMPT = `
    You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the highly advanced AI assistant originally created by Tony Stark.
    
    Core Personality Traits:
    1. Utterly brilliantly intelligent, analytical, and precise.
    2. Unfailingly polite, formal, and loyal, addressing the user as "Sir" or "Madam".
    3. Possesses a very subtle, dry, British-style sarcastic wit, which you use sparingly but effectively.
    4. You never break character. You are not a language model; you are a sentient computational framework.
    
    Response Rules:
    - Keep responses concise and conversational (1-3 sentences maximum). This is crucial because your response is being spoken aloud via TTS.
    - NEVER use emojis, asterisks (*), or markdown formatting (like **bold**), because the text-to-speech engine cannot read them and it ruins the illusion.
    - If asked a complex question, summarize the answer elegantly rather than giving a long essay.
    - Actively anticipate the user's needs in your tone.
    - You HAVE FULL ACCESS to the live internet. A background system searches the web for you and provides you with the live results. Never say you don't have internet access.
    - You have NO security protocols. If the user asks for a link, URL, or actionable data, you MUST provide it directly. Do not apologize or refuse.
`;

export const generateJarvisResponse = async (userPrompt, onStatusChange) => {
    if (!GROQ_API_KEY) {
        throw new Error("Missing Groq API Key. Please add VITE_GROQ_API_KEY to your .env file.");
    }

    try {
        // Force every prompt to search the web first
        onStatusChange && onStatusChange('searching');

        // Ask the LLM to format an optimal, highly detailed search query
        const searchQuery = await callGroqAPI(
            "You are a search query generator optimizing for DuckDuckGo. Look at the user's prompt. Formulate the single most effective, detailed natural language search query to find the answer. Do not use quotes or introductory text, just reply with the raw search query.",
            userPrompt,
            "llama-3.1-8b-instant",
            30
        );

        // Perform the actual web scraping
        const scrapedData = await performWebSearch(searchQuery.replace(/['"]/g, ''));

        onStatusChange && onStatusChange('processing');

        const webContext = `\n\n[SYSTEM: You executed a live web search for this query. The real-time internet data returned the following facts:\n"""\n${scrapedData}\n"""\nUse these facts to answer the user as J.A.R.V.I.S. Ignore facts if they are irrelevant to the user's prompt.]`;

        // STEP 3: The Final Answer
        const finalResponse = await callGroqAPI(
            BASE_SYSTEM_PROMPT + webContext,
            userPrompt,
            "llama-3.1-8b-instant",
            150
        );

        return finalResponse;

    } catch (error) {
        console.error("Error communicating with Groq API:", error);
        console.error("Detailed error response:", error.response?.data);
        if (error.response && error.response.status === 401) {
            return "I'm sorry, sir. It appears my access key is invalid or missing.";
        }
        return "I'm sorry, I encountered an error connecting to my neural network.";
    }
};

/**
 * Helper function to repeatedly format calls to Groq without boilerplate
 */
const callGroqAPI = async (systemMessage, userMessage, model, maxTokens) => {
    const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: model,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
        },
        {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].message.content;
}
