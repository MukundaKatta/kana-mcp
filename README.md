# kana-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/kana-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/kana-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: convert Japanese text between romaji, hiragana, and katakana.
Backed by `wanakana`.

## Tools

- `to_hiragana` — `"konnichiwa"` → `"こんにちは"`
- `to_katakana` — `"toukyou"` → `"トウキョウ"`
- `to_romaji` — `"こんにちは"` → `"konnichiha"`

## Configure

```json
{ "mcpServers": { "kana": { "command": "npx", "args": ["-y", "@mukundakatta/kana-mcp"] } } }
```

## License

MIT.
