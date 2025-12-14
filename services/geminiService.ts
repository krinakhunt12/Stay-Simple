import { GoogleGenAI } from "@google/genai";
import { Room } from "../types";
import { getRooms } from "./mockDb";

const getClient = () => {
  // In a real app, never expose keys on client side. 
  // However, for this specific "single-xml" demo constraint using simulated backend, we access it from env.
  // The system instruction guarantees process.env.API_KEY is available.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const askConcierge = async (userMessage: string): Promise<string> => {
  try {
    const ai = getClient();
    const rooms = getRooms();
    
    // Create a context-aware system prompt
    const roomsContext = rooms.map(r => 
      `- ${r.name} (${r.type}): $${r.price}/night. Sleeps ${r.capacity}. Amenities: ${r.amenities.join(', ')}.`
    ).join('\n');

    const systemInstruction = `
      You are "Simpy", the intelligent digital concierge for StaySimple Hotel.
      
      Here is our current room inventory:
      ${roomsContext}
      
      Your goal is to help guests find the perfect room, answer questions about amenities, and be polite.
      - Keep answers concise (max 2-3 sentences).
      - If asked about availability, ask them to check the calendar in the booking form.
      - If asked about local attractions, invent 2-3 plausible nice spots nearby (beach, cafe, park).
      - Always be warm and welcoming.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 200,
      }
    });

    return response.text || "I'm sorry, I couldn't process that request right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting to the main desk. Please try again later.";
  }
};
