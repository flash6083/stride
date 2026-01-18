export async function POST(req: Request) {
    try {

        const { exerciseName } = await req.json();

        if (!exerciseName) {
            return new Response(
                JSON.stringify({ message: "Exercise name is required" }),
                { status: 400 }
            );
        }

        // 🔑 Dynamic import (Metro will NOT bundle this)
        const { GoogleGenAI } = await import("@google/genai");

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!,
        });

        const prompt = `
You are an expert AI fitness coach with deep knowledge of biomechanics,
injury prevention, and beginner coaching psychology.

Your task is to generate personalized coaching guidance for the exercise below.

Exercise Name: ${exerciseName}

GOALS:
- This must NOT sound like a generic textbook explanation.
- It should feel like a real coach analyzing how a beginner would perform this exercise.
- Explain the WHY behind each instruction.
- Anticipate common beginner mistakes and correct them proactively.
- Add intelligent cues that show awareness of human movement patterns.
- The response should clearly demonstrate that AI reasoning was used.

ASSUME:
- The user is a beginner or early-intermediate trainee.
- The user may have limited mobility, weak stabilizer muscles, or poor mind–muscle connection.
- Safety and long-term progress matter more than lifting heavy.

FORMAT STRICTLY IN MARKDOWN:

## What This Exercise Actually Trains
Briefly explain the primary and secondary muscles AND why this exercise matters.

## Equipment & Setup
Mention required equipment and explain setup with reasoning (not just steps).

## Step-by-Step Execution (With Coaching Cues)
Explain how to perform the movement.
For each major step, include:
- what to do
- why it matters biomechanically
- one internal coaching cue (what to “feel”)

## Common Mistakes Beginners Make (And How to Fix Them)
List realistic mistakes and corrective advice.

## Smart Variations (Based on Ability)
Suggest:
- one easier regression
- one progression
Explain when each should be used.

## Safety & Recovery Notes
Mention joints at risk, breathing, and recovery guidance.

TONE:
- Clear, confident, supportive
- Sounds like a premium AI coach
- Concise but insightful (no fluff)

Do NOT mention that you are an AI or language model.
Do NOT include emojis.
Do NOT include disclaimers.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        return new Response(
            JSON.stringify({ message: response.text }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Gemini error:", error);
        return new Response(
            JSON.stringify({ message: "Failed to generate AI guidance" }),
            { status: 500 }
        );
    }
}
