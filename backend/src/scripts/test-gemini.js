import 'dotenv/config';

const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.log('GEMINI_API_KEY is missing in backend/.env');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const payload = {
  contents: [
    {
      role: 'user',
      parts: [{ text: 'Reply with one short sentence: hello from Gemini.' }],
    },
  ],
};

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-goog-api-key': key,
  },
  body: JSON.stringify(payload),
});

console.log('Model:', model, '| HTTP status:', res.status);
console.log((await res.text()).slice(0, 500));