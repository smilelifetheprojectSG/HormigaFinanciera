import { GoogleGenAI } from "@google/genai";
import { SavingEntry } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateSavingsTip = async (entries: SavingEntry[]): Promise<string> => {
  if (!API_KEY) {
    return "La funcionalidad de IA está deshabilitada. Por favor, configura tu API key.";
  }

  const model = 'gemini-2.5-flash';
  
  const recentSavings = entries
    .slice(0, 5)
    .map(e => `- ${e.description}: €${e.amount.toFixed(2)}`)
    .join('\n');

  const prompt = `
    Eres un asesor financiero experto y amigable. Un usuario está registrando sus ahorros diarios en Euros.
    Basado en sus ahorros más recientes, ofrécele un consejo de ahorro corto, práctico y motivador en español.
    El consejo debe ser de no más de dos frases. No seas genérico.
    
    Ahorros recientes del usuario:
    ${recentSavings || "El usuario aún no ha registrado ahorros."}

    Ejemplo de respuesta: "¡Excelente trabajo ahorrando en comida! Para potenciarlo, intenta planificar tus comidas para la semana. Puede reducir gastos inesperados."

    Ahora, genera un nuevo consejo para el usuario.
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating savings tip:", error);
    return "Hubo un problema al generar el consejo. Por favor, inténtalo de nuevo más tarde.";
  }
};
