import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildRequest, buildDialogueRequest, preflight, inspectWav, extractWav, synthesize, ENDPOINT } from './gemini-tts.mjs';

function wavFixture() {
  const wav = Buffer.alloc(48);
  wav.write('RIFF'); wav.writeUInt32LE(40, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(24000, 24); wav.writeUInt32LE(48000, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(4, 40);
  return wav;
}
function responseFor(wav) {
  return { steps: [{ type: 'model_output', content: [{ type: 'audio', data: wav.toString('base64') }] }] };
}

test('keeps Arabic/Swedish transcript verbatim and puts direction in metadata', () => {
  const text = 'نَزُورُ Västerås، ثُمَّ Skövde.';
  const body = buildRequest({ text, style: 'Warm Arabic narration; pronounce Swedish names in Swedish.' });
  assert.equal(body.input[0].content[0].text, text);
  assert.match(body.input[0].content[0].annotations[0].style, /Swedish/);
  assert.equal(body.store, false);
  assert.equal(body.response_format.mime_type, 'audio/wav');
  assert.equal(body.model, 'gemini-3.8-flash-tts');
});

test('blocks preview models and empty scripts before any request', () => {
  for (const model of ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts', 'gemini-3.1-flash-tts-preview']) {
    assert.throws(() => buildRequest({ text: 'test', model }), /Unsupported/);
  }
  assert.throws(() => buildRequest({ text: '  ' }), /empty/);
});

test('preserves complete WAV bytes without double wrapping', () => {
  const wav = wavFixture();
  assert.deepEqual(extractWav(responseFor(wav)), wav);
});

test('rejects missing audio, raw PCM and truncated WAV', () => {
  assert.throws(() => extractWav({ steps: [] }), /No audio/);
  assert.throws(() => extractWav(responseFor(Buffer.alloc(48))), /WAV/);
  assert.throws(() => extractWav(responseFor(wavFixture().subarray(0, 46))), /WAV/);
});

test('uses documented REST envelope; key stays in headers, with exactly one request', async () => {
  const wav = wavFixture();
  const body = buildRequest({ text: 'نص تجريبي' });
  let calls = 0;
  const result = await synthesize(body, { apiKey: 'unit-test-placeholder', fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, ENDPOINT);
    assert.equal(options.headers['x-goog-api-key'], 'unit-test-placeholder');
    assert.deepEqual(JSON.parse(options.body), body);
    return { ok: true, json: async () => responseFor(wav) };
  } });
  assert.equal(calls, 1);
  assert.deepEqual(result, wav);
});

test('does not contact Google without a key and never retries failed requests', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return { ok: false, status: 429 }; };
  const body = buildRequest({ text: 'test' });
  await assert.rejects(synthesize(body, { fetchImpl }), /GEMINI_API_KEY/);
  assert.equal(calls, 0);
  await assert.rejects(synthesize(body, { apiKey: 'unit-test-placeholder', fetchImpl }), /429/);
  assert.equal(calls, 1);
});

test('CLI defaults to a local dry run without credentials or output files', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'raed7-tts-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const transcript = join(dir, 'transcript.txt');
  await writeFile(transcript, 'نَزُورُ Västerås.');
  const run = spawnSync(process.execPath, [fileURLToPath(new URL('./gemini-tts.mjs', import.meta.url)), '--text', transcript], {
    encoding: 'utf8', env: { ...process.env, GEMINI_API_KEY: '' },
  });
  assert.equal(run.status, 0, run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.networkRequests, 0);
  assert.equal(result.request.input[0].content[0].text, 'نَزُورُ Västerås.');
});

test('CLI protects existing output and removes reserved file when no key is available', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'raed7-tts-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const transcript = join(dir, 'transcript.txt');
  const output = join(dir, 'voice.wav');
  const cli = fileURLToPath(new URL('./gemini-tts.mjs', import.meta.url));
  await writeFile(transcript, 'test');
  await writeFile(output, 'keep-original');
  const run = () => spawnSync(process.execPath, [cli, '--text', transcript, '--out', output, '--generate'], {
    encoding: 'utf8', env: { ...process.env, GEMINI_API_KEY: '' },
  });
  assert.equal(run().status, 1);
  assert.equal(await readFile(output, 'utf8'), 'keep-original');
  await rm(output);
  assert.match(run().stderr, /GEMINI_API_KEY/);
  await assert.rejects(access(output), { code: 'ENOENT' });
});

const dialogue = () => ({
  speakers: [{ speaker: 'RAED', voice: 'Charon' }, { speaker: 'LAYAN', voice: 'Kore' }],
  turns: [
    { speaker: 'RAED', text: 'شو رأيك نِزور Västerås؟', style: 'Warm urban Jordanian Arabic.' },
    { speaker: 'LAYAN', text: 'أكيد، خلّينا نكتشف قصّتها.', style: 'Conversational urban Jordanian Arabic.' },
  ],
});

test('maps dialogue turns to distinct speaker metadata without adding spoken labels', () => {
  const source = dialogue();
  const request = buildDialogueRequest(source);
  assert.deepEqual(request.generation_config.speech_config, { speakers: source.speakers });
  assert.deepEqual(request.input[0].content.map(part => part.text), source.turns.map(turn => turn.text));
  assert.deepEqual(request.input[0].content.map(part => part.annotations[0].speaker), ['RAED', 'LAYAN']);
  assert.equal(preflight(request).speakers, 2);
  assert.equal(preflight(request).turns, 2);
});

test('blocks unknown speakers, duplicate names, empty turns and preview dialogue models', () => {
  for (const edit of [
    d => { d.speakers[1].speaker = 'RAED'; },
    d => { d.turns[1].speaker = 'OTHER'; },
    d => { d.turns[1].text = ''; },
    d => { d.turns = [d.turns[0]]; },
    d => { d.model = 'gemini-2.5-pro-preview-tts'; },
  ]) {
    const d = dialogue(); edit(d);
    assert.throws(() => buildDialogueRequest(d));
  }
});

test('preflight ignores vocal tags when estimating timing and flags Lite Swedish limitation', () => {
  const summary = preflight(buildRequest({ text: 'واحد <short pause> اثنان', model: 'gemini-3.8-flash-lite-tts' }));
  assert.equal(summary.words, 2);
  assert.ok(summary.notes.some(note => note.includes('Swedish')));
  assert.ok(summary.estimatedSeconds.max >= summary.estimatedSeconds.min);
});

test('validates WAV sample format, frame alignment, data presence and duration', () => {
  const wav = wavFixture();
  assert.equal(inspectWav(wav).durationSeconds, 4 / 48000);
  assert.equal(inspectWav(wav).needsListeningReview, true);
  for (const mutate of [
    b => b.writeUInt16LE(3, 20),
    b => b.writeUInt16LE(2, 22),
    b => b.writeUInt32LE(48000, 24),
    b => b.writeUInt32LE(7, 40),
    b => b.write('JUNK', 36),
  ]) {
    const bad = Buffer.from(wav); mutate(bad);
    assert.throws(() => inspectWav(bad), /WAV/);
  }
});

test('accepts padded metadata chunks without modifying the WAV', () => {
  const original = wavFixture();
  const metadata = Buffer.alloc(10);
  metadata.write('JUNK'); metadata.writeUInt32LE(1, 4); metadata[8] = 42;
  const wav = Buffer.concat([original.subarray(0, 36), metadata, original.subarray(36)]);
  wav.writeUInt32LE(wav.length - 8, 4);
  assert.deepEqual(extractWav(responseFor(wav)), wav);
});

test('CLI dialogue dry run succeeds and mixed single/dialogue options fail locally', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'raed7-dialogue-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const input = join(dir, 'dialogue.json');
  const cli = fileURLToPath(new URL('./gemini-tts.mjs', import.meta.url));
  await writeFile(input, JSON.stringify(dialogue()));
  const run = args => spawnSync(process.execPath, [cli, '--dialogue', input, ...args], {
    encoding: 'utf8', env: { ...process.env, GEMINI_API_KEY: '' },
  });
  const good = run([]);
  assert.equal(good.status, 0, good.stderr);
  assert.equal(JSON.parse(good.stdout).preflight.speakers, 2);
  assert.equal(run(['--voice', 'Charon']).status, 1);
  assert.equal(run(['--text', 'unused.txt']).status, 1);
});
