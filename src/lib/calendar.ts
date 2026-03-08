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

export async function getAIParsedCalendar(): Promise<CalendarEvent[]> {
    if (!genAI) return [];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // We provide a prompt that asks for the next week's major US economic events.
        // Since Gemini has internal knowledge of schedules (or we can pass search results),
        // we can use it to generate a fresh JSON feed.

        const prompt = `
      Return a JSON array of the 8 most important UPCOMING US economic events for the week starting March 9, 2026.
      Current date is March 8, 2026.
      Format: [{"id": "string", "date": "ISO8601", "event": "string", "importance": "High"|"Medium"|"Low", "country": "US"}]
      Only return the JSON. No preamble.
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        // Basic cleanup of markdown blocks if any
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Failed to generate AI calendar:", error);
        return [];
    }
}
