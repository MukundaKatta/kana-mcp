import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { callTool, toHiragana, toKatakana, toRomaji } from '../src/server.js';

test('romaji to hiragana', () => {
  // wanakana transliterates phonetically: "wa" → わ. (The greeting
  // こんにちは is spelled with the topic particle は by convention, but
  // mechanical romaji-to-kana gives わ.)
  assert.equal(toHiragana('konnichiwa'), 'こんにちわ');
});

test('romaji to katakana', () => {
  // Uppercase romaji is converted to katakana in wanakana's default rules.
  assert.equal(toKatakana('toukyou'), 'トウキョウ');
});

test('hiragana to romaji', () => {
  assert.equal(toRomaji('こんにちは'), 'konnichiha');
});

test('katakana to romaji', () => {
  assert.equal(toRomaji('トウキョウ'), 'toukyou');
});

test('round trip romaji → hiragana → romaji', () => {
  const orig = 'arigatou';
  const back = toRomaji(toHiragana(orig));
  assert.equal(back, 'arigatou');
});

test('mixed input passes through non-Japanese characters', () => {
  const out = toHiragana('hello sekai');
  assert.match(out, /せかい/);
});

test('callTool dispatches to_hiragana', () => {
  const res = callTool('to_hiragana', { text: 'konnichiwa' });
  assert.equal(res.isError, undefined);
  assert.equal(res.content[0].text, 'こんにちわ');
});

test('callTool dispatches to_katakana and to_romaji', () => {
  assert.equal(callTool('to_katakana', { text: 'toukyou' }).content[0].text, 'トウキョウ');
  assert.equal(callTool('to_romaji', { text: 'こんにちは' }).content[0].text, 'konnichiha');
});

test('callTool rejects unknown tool', () => {
  const res = callTool('to_klingon', { text: 'x' });
  assert.equal(res.isError, true);
  assert.match(res.content[0].text, /unknown tool/);
});

test('callTool rejects missing text argument', () => {
  const res = callTool('to_hiragana', {});
  assert.equal(res.isError, true);
  assert.match(res.content[0].text, /missing or invalid 'text'/);
});

test('callTool rejects non-string text argument', () => {
  // Previously this would throw "input is not iterable" inside wanakana;
  // now it is caught early with a clear validation message.
  const res = callTool('to_hiragana', { text: 123 });
  assert.equal(res.isError, true);
  assert.match(res.content[0].text, /expected a string/);
});

test('callTool rejects missing arguments object', () => {
  const res = callTool('to_romaji', undefined);
  assert.equal(res.isError, true);
  assert.match(res.content[0].text, /missing or invalid 'text'/);
});
