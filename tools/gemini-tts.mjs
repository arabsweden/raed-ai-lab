#!/usr/bin/env node
// Node.js 20+. No third-party dependencies. Dry run unless --generate is explicit.
import { readFile, open, unlink } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MODELS = new Set(['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts']);

export function buildRequest({ text, style = '', voice = 'Charon', model = 'gemini-3.8-flash-tts' }) {
  if (!MODELS.has(model)) throw new Error('Unsupported model: choose a supported Gemini 3.8 TTS model.');
  if (typeof text !== 'string' || !text.trim()) throw new Error('Transcript is empty.');
  if (typeof style !== 'string' || typeof voice !== 'string' || !voice.trim()) {
    throw new Error('Voice and style must be strings; voice must be nonempty.');
  }
  return {
    model,
    store: false,
    input: [{ type: 'user_input', content: [{
      type: 'text', text,
      annotations: [{ type: 'speech_metadata', style }],
    }] }],
    response_format: { type: 'audio', mime_type: 'audio/wav', sample_rate: 24000 },
    generation_config: { speech_config: [{ voice }] },
  };
}

export function extractWav(response) {
  // REST returns steps[].content[]; output_audio is an SDK convenience property.
  const blocks = (response?.steps ?? [])
    .filter(step => step.type === 'model_output')
    .flatMap(step => step.content ?? [])
    .filter(part => part.type === 'audio');
  const data = blocks.at(-1)?.data;
  if (typeof data !== 'string' || !data.length) throw new Error('No audio returned.');
  const wav = Buffer.from(data, 'base64');
  if (wav.length < 44 || wav.toString('ascii', 0, 4) !== 'RIFF' ||
      wav.toString('ascii', 8, 12) !== 'WAVE' || wav.readUInt32LE(4) + 8 !== wav.length) {
    throw new Error('Expected a complete WAV file. Raw PCM or malformed audio was not saved.');
  }
  // Return the original WAV bytes. Never add a second WAV header.
  return wav;
}

export async function synthesize(request, { apiKey, fetchImpl = fetch } = {}) {
  if (!MODELS.has(request?.model)) throw new Error('Unsupported TTS model.');
  if (!apiKey) throw new Error('Set GEMINI_API_KEY in the environment.');
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(120000),
  });
  // Do not echo server bodies, which may include private transcript information.
  if (!response.ok) throw new Error(`Gemini TTS failed: HTTP ${response.status}. No automatic retry.`);
  return extractWav(await response.json());
}

async function main(args) {
  const generate = args.includes('--generate');
  const values = {};
  const allowed = new Set(['--text', '--style', '--voice', '--model', '--out']);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--generate') continue;
    if (!allowed.has(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) {
      throw new Error('Usage: node tools/gemini-tts.mjs --text transcript.txt [--style style.txt] [--voice Charon] [--model gemini-3.8-flash-tts] [--out voice.wav] [--generate]');
    }
    values[args[i].slice(2)] = args[++i];
  }
  if (!values.text) throw new Error('--text transcript.txt is required.');
  const request = buildRequest({
    text: await readFile(values.text, 'utf8'),
    style: values.style ? await readFile(values.style, 'utf8') : '',
    voice: values.voice, model: values.model,
  });
  if (!generate) {
    console.log(JSON.stringify({ mode: 'dry-run', networkRequests: 0, request }, null, 2));
    return;
  }
  if (!values.out?.toLowerCase().endsWith('.wav')) throw new Error('--out must be a .wav path.');
  // Reserve output before sending a potentially billable request. Preserve existing files.
  const handle = await open(values.out, 'wx', 0o600);
  let complete = false;
  try {
    const wav = await synthesize(request, { apiKey: process.env.GEMINI_API_KEY });
    await handle.writeFile(wav);
    complete = true;
    console.log(`Saved WAV: ${values.out}`);
  } finally {
    await handle.close();
    if (!complete) await unlink(values.out);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
