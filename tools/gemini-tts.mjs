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

export function buildDialogueRequest({ speakers, turns, model = 'gemini-3.8-flash-tts' }) {
  if (!Array.isArray(speakers) || speakers.length !== 2 || !Array.isArray(turns) || !turns.length) {
    throw new Error('Dialogue requires exactly two speakers and at least one turn.');
  }
  const names = new Set();
  const configured = speakers.map(item => {
    if (typeof item?.speaker !== 'string' || !item.speaker.trim() ||
        typeof item.voice !== 'string' || !item.voice.trim() || names.has(item.speaker)) {
      throw new Error('Each speaker requires a unique name and a voice.');
    }
    names.add(item.speaker);
    return { speaker: item.speaker, voice: item.voice };
  });
  const content = turns.map(turn => {
    if (!names.has(turn?.speaker)) throw new Error('Dialogue turn refers to an unknown speaker.');
    const part = buildRequest({ text: turn.text, style: turn.style ?? '', model }).input[0].content[0];
    part.annotations[0].speaker = turn.speaker;
    return part;
  });
  if (new Set(turns.map(turn => turn.speaker)).size !== 2) {
    throw new Error('Include at least one turn for each configured speaker.');
  }
  const request = buildRequest({ text: turns[0].text, model });
  request.input[0].content = content;
  request.generation_config.speech_config = { speakers: configured };
  return request;
}

export function preflight(request) {
  const parts = request.input[0].content;
  const text = parts.map(part => part.text.replace(/<[^>]*>/g, '')).join(' ');
  const words = text.trim().split(/\s+/u).filter(Boolean).length;
  return {
    speakers: Array.isArray(request.generation_config.speech_config) ? 1 : 2,
    turns: parts.length,
    words,
    estimatedSeconds: { min: Math.ceil(words / 160 * 60), max: Math.ceil(words / 130 * 60) },
    notes: [
      'Timing is an estimate; measure the generated WAV and review it by listening.',
      ...(request.model.endsWith('lite-tts') ? ['Flash-Lite does not list Swedish support; use Flash TTS for Swedish place names.'] : []),
    ],
  };
}

export function inspectWav(wav) {
  const invalid = () => { throw new Error('Expected a complete WAV file. Raw PCM or malformed audio was not saved.'); };
  if (!Buffer.isBuffer(wav) || wav.length < 44 || wav.toString('ascii', 0, 4) !== 'RIFF' ||
      wav.toString('ascii', 8, 12) !== 'WAVE' || wav.readUInt32LE(4) + 8 !== wav.length) invalid();
  let offset = 12;
  let format;
  let dataBytes = 0;
  while (offset < wav.length) {
    if (offset + 8 > wav.length) invalid();
    const id = wav.toString('ascii', offset, offset + 4);
    const size = wav.readUInt32LE(offset + 4);
    const start = offset + 8;
    const next = start + size + size % 2;
    if (next > wav.length) invalid();
    if (id === 'fmt ') {
      if (format || size < 16) invalid();
      format = {
        encoding: wav.readUInt16LE(start), channels: wav.readUInt16LE(start + 2),
        sampleRate: wav.readUInt32LE(start + 4), byteRate: wav.readUInt32LE(start + 8),
        blockAlign: wav.readUInt16LE(start + 12), bitsPerSample: wav.readUInt16LE(start + 14),
      };
    }
    if (id === 'data') dataBytes += size;
    offset = next;
  }
  if (!format || format.encoding !== 1 || format.channels !== 1 || format.bitsPerSample !== 16 ||
      format.sampleRate !== 24000 || format.blockAlign !== 2 || format.byteRate !== 48000 ||
      !dataBytes || dataBytes % format.blockAlign) invalid();
  return { sampleRate: format.sampleRate, channels: format.channels, bitsPerSample: format.bitsPerSample,
    durationSeconds: dataBytes / format.byteRate, needsListeningReview: true };
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
  inspectWav(wav);
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
  const allowed = new Set(['--text', '--dialogue', '--style', '--voice', '--model', '--out']);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--generate') continue;
    if (!allowed.has(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) {
      throw new Error('Usage: node tools/gemini-tts.mjs (--text transcript.txt | --dialogue dialogue.json) [--style style.txt] [--voice Charon] [--model gemini-3.8-flash-tts] [--out voice.wav] [--generate]');
    }
    values[args[i].slice(2)] = args[++i];
  }
  if (Boolean(values.text) === Boolean(values.dialogue)) throw new Error('Choose exactly one of --text or --dialogue.');
  if (values.dialogue && (values.style || values.voice)) throw new Error('Configure dialogue styles and voices in the JSON file.');
  const request = values.dialogue ? buildDialogueRequest({
    ...JSON.parse(await readFile(values.dialogue, 'utf8')),
    ...(values.model ? { model: values.model } : {}),
  }) : buildRequest({
    text: await readFile(values.text, 'utf8'),
    style: values.style ? await readFile(values.style, 'utf8') : '',
    voice: values.voice, model: values.model,
  });
  if (!generate) {
    console.log(JSON.stringify({ mode: 'dry-run', networkRequests: 0, preflight: preflight(request), request }, null, 2));
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
    console.log(JSON.stringify({ file: values.out, ...inspectWav(wav) }, null, 2));
  } finally {
    await handle.close();
    if (!complete) await unlink(values.out);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
