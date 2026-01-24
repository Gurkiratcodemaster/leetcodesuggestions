import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { SolvedProblems, ExcludedProblems } = await req.json();

    const prompt = `
You are a LeetCode mentor.

Solved problems:
${SolvedProblems.join(", ")}

Previously suggested (DO NOT repeat):
${ExcludedProblems?.join(", ") || "None"}

TASK:
- Recommend EXACTLY 5 NEW LeetCode problems
- Must be similar in concept and difficulty
- Must NOT repeat solved or previous suggestions

STRICT RULES:
- Do NOT repeat ANY from either list
- All 5 must be different
- Return ONLY valid JSON
- No explanation

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

    const chatResponse = await client.chat.complete({
      model: "mistral-medium-latest",
      messages: [
        { role: "user", content: prompt },
      ],
    });

    const text =
      chatResponse.choices[0]?.message?.content?.toString() ?? "";

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;

    const parsed = JSON.parse(text.slice(start, end));

    return NextResponse.json(parsed);

  } catch (err) {
    console.error("Mistral Error:", err);

    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
