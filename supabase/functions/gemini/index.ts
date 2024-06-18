import { serve } from "https://deno.land/std/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`;

async function generateContent(prompt: string) {
  const systemInstruction = "You are an expense categorizer. Your possible options are shopping, home, concert, restaurant, electronics, coffee, car, hobby, travel or other. Reply with one word.";

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-1.5-flash-latest",
      contents: [
        {
         parts: [
           {
             text: systemInstruction + prompt
           }
         ]
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API call failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

serve(async (req) => {
  try {
    const { title } = await req.json();
    const result = await generateContent(title);
    const ret = {
      name: result?.candidates[0]?.content?.parts[0]?.text?.trim()
    }
    console.log('ret is ', ret);
    return new Response(JSON.stringify(ret), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
