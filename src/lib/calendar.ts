import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

export interface CalendarEvent {
    id: string;
    date: string;
    event: string;
    importance: 'High' | 'Medium' | 'Low';
    country: string;
}

let cachedEvents: CalendarEvent[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in ms

export async function getAIParsedCalendar(): Promise<CalendarEvent[]> {
    if (!genAI) return [];

    const now = Date.now();
    if (cachedEvents && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedEvents;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Return a JSON array of the 8 most important UPCOMING US economic events starting from ${new Date().toLocaleDateString()}.
      Format: [{"id": "string", "date": "ISO8601", "event": "string", "importance": "High"|"Medium"|"Low", "country": "US"}]
      Only return the JSON. No preamble.
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonStr = text.replace(/```json|```/g, '').trim();

        try {
            const parsed = JSON.parse(jsonStr);
            if (!Array.isArray(parsed)) {
                throw new Error("Parsed content is not an array");
            }

            // Update cache
            cachedEvents = parsed;
            lastFetchTime = now;
            return parsed;
        } catch (parseError) {
            console.error("Failed to parse AI calendar JSON:", jsonStr);
            return cachedEvents || [];
        }
    } catch (error) {
        console.error("Failed to generate AI calendar content:", error);
        return cachedEvents || [];
    }
}
