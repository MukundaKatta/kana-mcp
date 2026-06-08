#!/usr/bin/env node
/**
 * kana MCP server. Three tools: `to_hiragana`, `to_katakana`, `to_romaji`.
 *
 * Backed by `wanakana` — converts between Japanese romaji and the two kana
 * syllabaries. Useful for transliterating user input and normalizing
 * Japanese text in indexes.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as wanakana from 'wanakana';

const VERSION = '0.1.0';

export function toHiragana(text: string): string {
  return wanakana.toHiragana(text);
}

export function toKatakana(text: string): string {
  return wanakana.toKatakana(text);
}

export function toRomaji(text: string): string {
  return wanakana.toRomaji(text);
}

const server = new Server({ name: 'kana', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'to_hiragana',
    description: 'Convert romaji (or katakana) to hiragana.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
  {
    name: 'to_katakana',
    description: 'Convert romaji (or hiragana) to katakana.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
  {
    name: 'to_romaji',
    description: 'Convert hiragana or katakana to Hepburn romaji.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
] as const;

type ToolResult = {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
};

/**
 * Dispatch a tool call by name with the given arguments. Validates that
 * `text` is a string and converts any thrown error into an error result so
 * the server never crashes on malformed input.
 */
export function callTool(name: string, args: unknown): ToolResult {
  try {
    const text = (args as Record<string, unknown> | undefined)?.text;
    if (typeof text !== 'string') {
      return errorResult("missing or invalid 'text' argument: expected a string");
    }
    if (name === 'to_hiragana') return textResult(toHiragana(text));
    if (name === 'to_katakana') return textResult(toKatakana(text));
    if (name === 'to_romaji') return textResult(toRomaji(text));
    return errorResult('unknown tool: ' + name);
  } catch (err) {
    return errorResult('kana failed: ' + (err as Error).message);
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) =>
  callTool(req.params.name, req.params.arguments),
);

function textResult(text: string): ToolResult {
  return { content: [{ type: 'text', text }] };
}
function errorResult(message: string): ToolResult {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`kana MCP server v${VERSION} ready on stdio\n`);
}
