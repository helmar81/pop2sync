import { GoogleGenAI, Type } from "@google/genai";
import { PopulationFact, CountryData, CityData, QuizQuestion } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchPopulationInsight = async (): Promise<PopulationFact> => {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("API Key configuration error");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Tell me one fascinating, short, statistical fact about the current world population growth or demographics. Keep it under 20 words.",
    });

    const text = response.text || "Population is growing rapidly.";
    
    return {
      fact: text.trim(),
      source: "Gemini AI Analysis"
    };
  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return {
      fact: "The world population grows by approximately 83 million people per year.",
      source: "Offline Fallback"
    };
  }
};

export const fetchCountryStats = async (): Promise<CountryData[]> => {
  const ai = getAiClient();
  if (!ai) {
    return getFallbackCountryData();
  }

  try {
    // Explicitly asking for top 20
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "List the top 20 most populous countries with their current estimated population and annual growth rate.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rank: { type: Type.NUMBER },
              country: { type: Type.STRING },
              population: { type: Type.STRING, description: "e.g. 1.45 Billion" },
              growthRate: { type: Type.STRING, description: "e.g. +0.5%" }
            },
            required: ["rank", "country", "population", "growthRate"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    return JSON.parse(jsonText) as CountryData[];
  } catch (error) {
    console.error("Error fetching country stats:", error);
    return getFallbackCountryData();
  }
};

export const fetchCityStats = async (): Promise<CityData[]> => {
  const ai = getAiClient();
  if (!ai) {
    return getFallbackCityData();
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "List the top 20 largest cities in the world by population (metro area). Include rank, city name, country, estimated population, and a very short 10-word interesting description for each.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rank: { type: Type.NUMBER },
              city: { type: Type.STRING },
              country: { type: Type.STRING },
              population: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["rank", "city", "country", "population", "description"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    return JSON.parse(jsonText) as CityData[];
  } catch (error) {
    console.error("Error fetching city stats:", error);
    return getFallbackCityData();
  }
};

export const fetchQuizQuestions = async (): Promise<QuizQuestion[]> => {
  const ai = getAiClient();
  if (!ai) {
    return getFallbackQuizData();
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 5 multiple-choice questions about world geography, population demographics, and megacities. Make them interesting but not impossible. Include the question, 4 options, the correct answer, and a short explanation.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return getFallbackQuizData();
  }
};

const getFallbackCountryData = (): CountryData[] => [
  { rank: 1, country: "India", population: "1.45 Billion", growthRate: "+0.9%" },
  { rank: 2, country: "China", population: "1.41 Billion", growthRate: "-0.1%" },
  { rank: 3, country: "United States", population: "345 Million", growthRate: "+0.5%" },
  { rank: 4, country: "Indonesia", population: "283 Million", growthRate: "+0.7%" },
  { rank: 5, country: "Pakistan", population: "251 Million", growthRate: "+1.9%" },
  { rank: 6, country: "Nigeria", population: "232 Million", growthRate: "+2.4%" },
  { rank: 7, country: "Brazil", population: "217 Million", growthRate: "+0.5%" },
  { rank: 8, country: "Bangladesh", population: "174 Million", growthRate: "+1.0%" },
  { rank: 9, country: "Russia", population: "144 Million", growthRate: "-0.2%" },
  { rank: 10, country: "Ethiopia", population: "132 Million", growthRate: "+2.5%" },
  { rank: 11, country: "Mexico", population: "130 Million", growthRate: "+0.7%" },
  { rank: 12, country: "Japan", population: "123 Million", growthRate: "-0.5%" },
  { rank: 13, country: "Philippines", population: "119 Million", growthRate: "+1.5%" },
  { rank: 14, country: "Egypt", population: "116 Million", growthRate: "+1.6%" },
  { rank: 15, country: "DR Congo", population: "109 Million", growthRate: "+3.2%" },
  { rank: 16, country: "Vietnam", population: "100 Million", growthRate: "+0.7%" },
  { rank: 17, country: "Iran", population: "91 Million", growthRate: "+0.7%" },
  { rank: 18, country: "Turkey", population: "87 Million", growthRate: "+0.6%" },
  { rank: 19, country: "Germany", population: "84 Million", growthRate: "+0.0%" },
  { rank: 20, country: "Thailand", population: "71 Million", growthRate: "+0.1%" }
];

const getFallbackCityData = (): CityData[] => [
  { rank: 1, city: "Tokyo", country: "Japan", population: "37.1 Million", description: "Largest metro area in the world." },
  { rank: 2, city: "Delhi", country: "India", population: "33.8 Million", description: "Rapidly growing capital city." },
  { rank: 3, city: "Shanghai", country: "China", population: "29.9 Million", description: "Global financial hub." },
  { rank: 4, city: "Dhaka", country: "Bangladesh", population: "23.9 Million", description: "Cultural and economic center." },
  { rank: 5, city: "Sao Paulo", country: "Brazil", population: "22.8 Million", description: "Largest city in the Americas." },
  { rank: 6, city: "Mexico City", country: "Mexico", population: "22.5 Million", description: "Historic high-altitude capital." },
  { rank: 7, city: "Cairo", country: "Egypt", population: "22.6 Million", description: "City of a thousand minarets." },
  { rank: 8, city: "Beijing", country: "China", population: "22.2 Million", description: "Political and cultural heart of China." },
  { rank: 9, city: "Mumbai", country: "India", population: "21.6 Million", description: "Home of Bollywood." },
  { rank: 10, city: "Osaka", country: "Japan", population: "19.0 Million", description: "Known for modern architecture and food." },
  { rank: 11, city: "Chongqing", country: "China", population: "17.8 Million", description: "Sprawling mountain city." },
  { rank: 12, city: "Karachi", country: "Pakistan", population: "17.6 Million", description: "Main seaport and financial center." },
  { rank: 13, city: "Kinshasa", country: "DR Congo", population: "17.0 Million", description: "Largest Francophone city in the world." },
  { rank: 14, city: "Lagos", country: "Nigeria", population: "16.5 Million", description: "Major African tech hub." },
  { rank: 15, city: "Istanbul", country: "Turkey", population: "16.0 Million", description: "Straddles Europe and Asia." },
  { rank: 16, city: "Buenos Aires", country: "Argentina", population: "15.6 Million", description: "Known for tango and architecture." },
  { rank: 17, city: "Kolkata", country: "India", population: "15.6 Million", description: "Cultural capital of India." },
  { rank: 18, city: "Manila", country: "Philippines", population: "14.9 Million", description: "Historic walled city core." },
  { rank: 19, city: "Guangzhou", country: "China", population: "14.5 Million", description: "Major port on Pearl River." },
  { rank: 20, city: "Tianjin", country: "China", population: "14.2 Million", description: "Key northern port city." }
];

const getFallbackQuizData = (): QuizQuestion[] => [
  {
    id: 1,
    question: "Which country is home to the world's most populous city (metro area)?",
    options: ["China", "India", "Japan", "USA"],
    correctAnswer: "Japan",
    explanation: "Tokyo, Japan, is the world's most populous metropolitan area with over 37 million people."
  },
  {
    id: 2,
    question: "What is the approximate current world population?",
    options: ["6 Billion", "7 Billion", "8 Billion", "9 Billion"],
    correctAnswer: "8 Billion",
    explanation: "The world population crossed the 8 billion mark in late 2022."
  },
  {
    id: 3,
    question: "Which continent has the fastest-growing population?",
    options: ["Asia", "Africa", "South America", "Europe"],
    correctAnswer: "Africa",
    explanation: "Africa has the highest population growth rate due to high fertility rates and a young median age."
  },
  {
    id: 4,
    question: "Which country has the most official languages?",
    options: ["India", "South Africa", "Zimbabwe", "Papua New Guinea"],
    correctAnswer: "Zimbabwe",
    explanation: "Zimbabwe holds the Guinness World Record for the most official languages at a national level, with 16."
  },
  {
    id: 5,
    question: "Which is the smallest country in the world by population?",
    options: ["Monaco", "Nauru", "Tuvalu", "Vatican City"],
    correctAnswer: "Vatican City",
    explanation: "Vatican City is the smallest country both by area and population (around 800 people)."
  }
];