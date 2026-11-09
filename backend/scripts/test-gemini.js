import 'dotenv/config';

const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
if (!process.env.GEMINI_API_KEY) {
  console.log('GEMINI_API_KEY is missing in backend/.env');
  process.exit(1);
}

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
  body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with one short sentence: hello from Gemini.' }] }] }),
});
console.log('Model:', model, '| HTTP status:', res.status);
console.log((await res.text()).slice(0, 400));
