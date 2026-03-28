import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Performs a free, headless web search by scraping DuckDuckGo Lite.
 * We use an open CORS proxy (allOrigins) because browsers block direct scraping.
 */
export const performWebSearch = async (query) => {
    try {
        console.log("Jarvis is searching the web for:", query);

        // DuckDuckGo Lite URL via our local Vite proxy to avoid CORS
        const proxyUrl = `/search-proxy/lite/?q=${encodeURIComponent(query)}`;

        const response = await axios.get(proxyUrl);
        const html = response.data;

        // Load the raw HTML into Cheerio to parse it
        const $ = cheerio.load(html);

        let results = [];

        // DuckDuckGo Lite formats search results in table rows. 
        // We need the link (.result-snippet a) and the snippet text (.result-snippet)
        $('tr').each((i, element) => {
            const snippet = $(element).find('.result-snippet').text().trim();
            const link = $(element).find('.result-snippet').closest('td').find('.result-url').attr('href') || $(element).find('a').attr('href');

            // Only grab rows that actually contain text, up to 3 results
            if (snippet && results.length < 3) {
                results.push(`${snippet} (Link: ${link || "Unknown"})`);
            }
        });

        // If DuckDuckGo failed to parse, fallback to Wikipedia for facts
        if (results.length === 0) {
            return await fallbackWikipediaSearch(query);
        }

        return results.join("\n\n");

    } catch (error) {
        console.error("Web Search Failed:", error);
        return "Search failed or no data available right now.";
    }
};

/**
 * Fallback to Wikipedia API if DuckDuckGo structure changes or fails.
 */
const fallbackWikipediaSearch = async (query) => {
    try {
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
        const res = await axios.get(wikiUrl);
        const searchResults = res.data.query.search;

        if (searchResults && searchResults.length > 0) {
            // Strip HTML tags from the Wikipedia snippet
            return searchResults[0].snippet.replace(/(<([^>]+)>)/gi, "");
        }
        return "I could not find any live data on that subject.";
    } catch (e) {
        return "I could not connect to the live network database.";
    }
}
