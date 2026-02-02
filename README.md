# CodeWiki MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

An MCP (Model Context Protocol) server that provides tools to query Google's CodeWiki service for repository information, code explanations, and project details. Works with Claude Desktop, Cursor, and any MCP-compatible client.

## Features

- **Query any repository**: Ask natural language questions about any GitHub/GitLab repository
- **Get repository overviews**: Quick summaries of what a project does
- **Understand project structure**: Architecture and code organization explanations
- **Get started guides**: Installation and setup instructions
- **Dependency information**: Technologies and libraries used
- **API documentation**: Understand exposed APIs
- **Code component explanations**: Deep dives into specific files, functions, or features
- **Repository comparisons**: Compare two repositories

## Installation

```bash
cd codewiki-mcp
npm install
npm run build
```

## Usage

### With Claude Desktop

Add this to your Claude Desktop config file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "codewiki": {
      "command": "node",
      "args": ["D:\\Projects\\vibe-ai\\codewiki-mcp\\dist\\index.js"]
    }
  }
}
```

### With Cursor

Add this to your Cursor MCP settings (`.cursor/mcp.json` in your project or global settings):

```json
{
  "mcpServers": {
    "codewiki": {
      "command": "node",
      "args": ["D:\\Projects\\vibe-ai\\codewiki-mcp\\dist\\index.js"]
    }
  }
}
```

### With other MCP clients

Run the server via stdio:

```bash
node dist/index.js
```

## Available Tools

### `query_repository`
Ask any question about a repository.

**Parameters:**
- `repository` (required): Repository URL or path (e.g., `https://github.com/owner/repo`, `github.com/owner/repo`, or `owner/repo`)
- `query` (required): Your question about the repository

**Example:**
```
repository: "facebook/react"
query: "How does the virtual DOM diffing algorithm work?"
```

### `get_repository_overview`
Get a comprehensive overview of a repository.

**Parameters:**
- `repository` (required): Repository URL or path

### `get_project_structure`
Get the project structure and architecture explanation.

**Parameters:**
- `repository` (required): Repository URL or path

### `get_getting_started`
Get instructions on how to get started with a project.

**Parameters:**
- `repository` (required): Repository URL or path

### `get_dependencies`
Get information about dependencies and technologies used.

**Parameters:**
- `repository` (required): Repository URL or path

### `get_api_info`
Get information about APIs exposed by a repository.

**Parameters:**
- `repository` (required): Repository URL or path

### `explain_code_component`
Get a detailed explanation of a specific component.

**Parameters:**
- `repository` (required): Repository URL or path
- `component` (required): The component to explain (e.g., `AuthService`, `src/utils/helpers.ts`)

### `compare_repositories`
Compare two repositories.

**Parameters:**
- `repository1` (required): First repository URL or path
- `repository2` (required): Second repository URL or path
- `aspect` (optional): What aspect to compare (e.g., `architecture`, `performance`)

## Example Queries

```
# Get overview of a popular project
Tool: get_repository_overview
repository: "vercel/next.js"

# Ask specific questions
Tool: query_repository
repository: "prisma/prisma"
query: "How does Prisma handle database migrations?"

# Understand a component
Tool: explain_code_component
repository: "tailwindlabs/tailwindcss"
component: "the JIT compiler"

# Compare frameworks
Tool: compare_repositories
repository1: "facebook/react"
repository2: "vuejs/vue"
aspect: "state management"
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## How it Works

This MCP server interfaces with Google's CodeWiki service, which uses AI to analyze and understand public code repositories. It sends your questions to CodeWiki and returns the responses in a format that can be used by any MCP-compatible client.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google CodeWiki](https://codewiki.google/) for the underlying API
- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP specification
