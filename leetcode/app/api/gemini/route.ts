import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // 🔴 CHANGE: accept ExcludeProblems
    const { SolvedProblems, ExcludeProblems = [] } = await req.json();

    const prompt = `
You are a LeetCode mentor.

The user has already solved these problems:
${SolvedProblems.join(", ")}

The user has ALSO already seen or completed these suggested problems:
${ExcludeProblems.length > 0 ? ExcludeProblems.join(", ") : "None"}

TASK:
- Analyze the user's concept gaps
- Recommend EXACTLY 5 NEW LeetCode problems
- Do NOT repeat any problems from either list
- Problems should be similar in concepts and difficulty progression

STRICT RULES:
- Do NOT repeat solved or excluded problems
- Suggestions must be different from each other
- Return ONLY valid JSON
- Do NOT include markdown, explanation, or text outside JSON

FORMAT:
{
  "suggestions": [
    {
      "title": "Problem name",
      "difficulty": "Easy | Medium | Hard",
      "concept": "Main concept tested"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "";

    // 🔴 SAFER JSON EXTRACTION
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid JSON from Gemini");
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Gemini API Error:", err);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
