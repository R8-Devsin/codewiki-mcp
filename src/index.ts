#!/usr/bin/env node

/**
 * CodeWiki MCP Server
 * 
 * An MCP server that provides tools to query Google's CodeWiki service
 * for repository information, code explanations, and project details.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { queryCodeWiki, extractRepoPath, CommonQueries } from "./codewiki-client.js";

// Define available tools
const tools: Tool[] = [
  {
    name: "query_repository",
    description: "Ask any question about a GitHub/GitLab repository using CodeWiki. Get information about code structure, features, how things work, etc.",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Repository URL or path (e.g., 'https://github.com/owner/repo', 'github.com/owner/repo', or 'owner/repo')",
        },
        query: {
          type: "string",
          description: "Your question about the repository (e.g., 'How does the authentication work?', 'What is the project structure?')",
        },
      },
      required: ["repository", "query"],
    },
  },
  {
    name: "get_repository_overview",
    description: "Get a comprehensive overview of a repository including its purpose, main features, and technologies used.",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Repository URL or path (e.g., 'https://github.com/owner/repo', 'github.com/owner/repo', or 'owner/repo')",
        },
      },
      required: ["repository"],
    },
  },
  {
    name: "get_project_structure",
    description: "Get the project structure and architecture explanation of a repository.",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Repository URL or path (e.g., 'https://github.com/owner/repo', 'github.com/owner/repo', or 'owner/repo')",
        },
      },
      required: ["repository"],
    },
  },
  {
    name: "get_getting_started",
    description: "Get instructions on how to get started with a repository - setup, installation, and first steps.",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Repository URL or path (e.g., 'https://github.com/owner/repo', 'github.com/owner/repo', or 'owner/repo')",
        },
      },
      required: ["repository"],
    },
  },
  {
    name: "get_dependencies",
    description: "Get information about the dependencies and technologies used in a repository.",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Repository URL or path (e.g., 'https://github.com/owner/repo', 'github.com/owner/repo', or 'owner/repo')",
        },
      },
      required: ["repository"],
    },
  },
  {
    name: "get_api_info",
    description: "Get information about the APIs exposed by a repository.",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Repository URL or path (e.g., 'https://github.com/owner/repo', 'github.com/owner/repo', or 'owner/repo')",
        },
      },
      required: ["repository"],
    },
  },
  {
    name: "explain_code_component",
    description: "Ask CodeWiki to explain a specific component, file, function, or feature in a repository.",
    inputSchema: {
      type: "object",
      properties: {
        repository: {
          type: "string",
          description: "Repository URL or path (e.g., 'https://github.com/owner/repo', 'github.com/owner/repo', or 'owner/repo')",
        },
        component: {
          type: "string",
          description: "The component, file, function, or feature to explain (e.g., 'AuthService', 'src/utils/helpers.ts', 'the caching mechanism')",
        },
      },
      required: ["repository", "component"],
    },
  },
  {
    name: "compare_repositories",
    description: "Get a comparison or understand how two repositories differ or relate to each other.",
    inputSchema: {
      type: "object",
      properties: {
        repository1: {
          type: "string",
          description: "First repository URL or path",
        },
        repository2: {
          type: "string",
          description: "Second repository URL or path",
        },
        aspect: {
          type: "string",
          description: "What aspect to compare (optional, e.g., 'architecture', 'performance', 'features')",
        },
      },
      required: ["repository1", "repository2"],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: "codewiki-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "query_repository": {
        const { repository, query } = args as { repository: string; query: string };
        const result = await queryCodeWiki(query, repository);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: result.response || "No response received",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error querying repository: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "get_repository_overview": {
        const { repository } = args as { repository: string };
        const result = await queryCodeWiki(CommonQueries.OVERVIEW, repository);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: result.response || "No response received",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error getting repository overview: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "get_project_structure": {
        const { repository } = args as { repository: string };
        const result = await queryCodeWiki(CommonQueries.STRUCTURE, repository);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: result.response || "No response received",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error getting project structure: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "get_getting_started": {
        const { repository } = args as { repository: string };
        const result = await queryCodeWiki(CommonQueries.GETTING_STARTED, repository);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: result.response || "No response received",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error getting started guide: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "get_dependencies": {
        const { repository } = args as { repository: string };
        const result = await queryCodeWiki(CommonQueries.DEPENDENCIES, repository);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: result.response || "No response received",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error getting dependencies info: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "get_api_info": {
        const { repository } = args as { repository: string };
        const result = await queryCodeWiki(CommonQueries.API, repository);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: result.response || "No response received",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error getting API info: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "explain_code_component": {
        const { repository, component } = args as { repository: string; component: string };
        const query = `Explain the ${component} in detail. How does it work? What is its purpose?`;
        const result = await queryCodeWiki(query, repository);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: result.response || "No response received",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error explaining component: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      case "compare_repositories": {
        const { repository1, repository2, aspect } = args as { 
          repository1: string; 
          repository2: string; 
          aspect?: string 
        };
        
        const repo1Path = extractRepoPath(repository1);
        const repo2Path = extractRepoPath(repository2);
        
        const aspectText = aspect ? ` focusing on ${aspect}` : "";
        const query = `Compare this repository with https://${repo2Path}${aspectText}. What are the similarities and differences?`;
        
        const result = await queryCodeWiki(query, repository1);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: result.response || "No response received",
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error comparing repositories: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CodeWiki MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
