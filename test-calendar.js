require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Return a JSON array of the 8 most important UPCOMING US economic events starting from ${new Date().toLocaleDateString()}.
      Format: [{"id": "string", "date": "ISO8601", "event": "string", "importance": "High"|"Medium"|"Low", "country": "US"}]
      Only return the JSON. No preamble.
    `;
    try {
        const result = await model.generateContent(prompt);
        console.log(result.response.text());
    } catch (e) {
        console.error(e);
    }
}
test();
