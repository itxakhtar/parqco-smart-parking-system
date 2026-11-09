import 'dotenv/config';

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.log('GEMINI_API_KEY is missing in backend/.env');
  process.exit(1);
}

const models = (process.argv[2] || 'gemini-3.8-flash,gemini-3.6-flash,gemini-3.7-flash').split(',');
const levels = ['minimal', 'low', null]; // null = no thinking setting (the model default)

async function run(model, level) {
  const generationConfig = { maxOutputTokens: 300 };
  if (level) generationConfig.thinkingConfig = { thinkingLevel: level };

  const started = Date.now();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'In two short sentences, explain how booking a parking slot works.' }] }],
      generationConfig,
    }),
  });
  await res.text();
  return { status: res.status, ms: Date.now() - started };
}

for (const model of models) {
  for (const level of levels) {
    const { status, ms } = await run(model, level);
    console.log(`${model.padEnd(22)} thinking=${String(level).padEnd(8)} HTTP ${status}  ${ms} ms`);
  }
}