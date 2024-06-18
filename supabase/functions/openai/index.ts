import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts';


const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

Deno.serve(async (req) => {
  const {title: query} = await req.json();

  const chatCompletion = await openai.chat.completions.create({
    messages: [
    {role: "system", content: "You are an expense categorizer. Your possible options are shopping, home, concert, restaurant, electronics, coffee, car, hobby, travel or other. Reply with one word"},
    {role: "user", content: `${query}`}
    ],
    model: 'gpt-3.5-turbo',
    stream: false,
  });

  console.log('chatCompletion is ', chatCompletion);
  const reply = chatCompletion.choices[0].message.content;

  return new Response(reply, {
    headers: {'Content-Type': 'text/plain'},
  });
});
