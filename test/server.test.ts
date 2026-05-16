import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { toHiragana, toKatakana, toRomaji } from '../src/server.js';

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
