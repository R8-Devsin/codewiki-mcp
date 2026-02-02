/**
 * CodeWiki API Client
 * Interfaces with Google's CodeWiki service to get repository information
 */

const CODEWIKI_BASE_URL = "https://codewiki.google/_/BoqAngularSdlcAgentsUi/data/batchexecute";

interface CodeWikiResponse {
  success: boolean;
  response?: string;
  error?: string;
}

/**
 * Generate a random session ID for the API
 */
function generateSessionId(): string {
  return Math.floor(Math.random() * 9000000000000000000 + 1000000000000000000).toString();
}

/**
 * Generate a random request ID
 */
function generateRequestId(): number {
  return Math.floor(Math.random() * 900000 + 100000);
}

/**
 * Extract repository path from various URL formats
 */
export function extractRepoPath(input: string): string {
  // Handle full GitHub URLs
  const githubMatch = input.match(/github\.com\/([^\/]+\/[^\/]+)/);
  if (githubMatch) {
    return `github.com/${githubMatch[1]}`;
  }
  
  // Handle gitlab URLs
  const gitlabMatch = input.match(/gitlab\.com\/([^\/]+\/[^\/]+)/);
  if (gitlabMatch) {
    return `gitlab.com/${gitlabMatch[1]}`;
  }
  
  // If it looks like owner/repo format, assume GitHub
  if (input.match(/^[^\/]+\/[^\/]+$/)) {
    return `github.com/${input}`;
  }
  
  // Return as-is if already in correct format
  return input;
}

/**
 * Build the request payload for CodeWiki API
 */
function buildRequestPayload(query: string, repoUrl: string): string {
  const innerData = JSON.stringify([
    [[query, "user"]],
    [null, repoUrl]
  ]);
  
  const outerData = [
    [
      ["EgIxfe", innerData, null, "generic"]
    ]
  ];
  
  return `f.req=${encodeURIComponent(JSON.stringify(outerData))}&`;
}

/**
 * Parse the CodeWiki API response
 * The response format is complex with multiple nested arrays and line-based chunks
 */
function parseResponse(responseText: string): string {
  try {
    // The response contains multiple line-based chunks
    // Each chunk starts with a number (byte length) followed by the actual JSON data
    const lines = responseText.split('\n');
    let allContent: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and byte count lines (just numbers)
      if (!line || /^\d+$/.test(line)) {
        continue;
      }
      
      // Try to parse JSON arrays
      if (line.startsWith('[')) {
        try {
          const parsed = JSON.parse(line);
          const extracted = extractTextFromResponse(parsed);
          if (extracted) {
            allContent.push(extracted);
          }
        } catch {
          // Not valid JSON, skip
        }
      }
    }
    
    if (allContent.length > 0) {
      return allContent.join('\n\n');
    }
    
    return "Unable to parse response";
  } catch (error) {
    return `Error parsing response: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Recursively extract text content from the nested response structure
 */
function extractTextFromResponse(data: unknown): string | null {
  if (!data) return null;
  
  // If it's a string that looks like actual content (not JSON metadata)
  if (typeof data === 'string') {
    // Skip metadata strings
    if (data === 'wrb.fr' || data === 'EgIxfe' || data === 'generic' || 
        data === 'di' || data === 'af.httprm' || data === 'e' ||
        data.startsWith('boq_') || /^-?\d+$/.test(data)) {
      return null;
    }
    
    // This looks like actual content - check if it's a JSON string that needs parsing
    if (data.startsWith('[') || data.startsWith('{')) {
      try {
        const innerParsed = JSON.parse(data);
        return extractTextFromResponse(innerParsed);
      } catch {
        // Not JSON, return as-is if it looks like real content
        if (data.length > 20 && !data.includes('null,null')) {
          return data;
        }
      }
    }
    
    // Return meaningful strings (actual response text)
    if (data.length > 50 && /[a-zA-Z]{3,}/.test(data)) {
      return data;
    }
    
    return null;
  }
  
  // If it's an array, look for the content
  if (Array.isArray(data)) {
    // Check for the specific pattern where first element is the response text
    // Pattern: ["response text", ...metadata...]
    if (data.length > 0 && typeof data[0] === 'string' && data[0].length > 50) {
      // Check if this looks like actual content (has words, not just metadata)
      const firstStr = data[0];
      if (/[a-zA-Z]{4,}\s+[a-zA-Z]{3,}/.test(firstStr) && 
          !firstStr.startsWith('wrb.fr') && 
          !firstStr.startsWith('af.')) {
        return firstStr;
      }
    }
    
    // Otherwise recurse through array elements
    for (const item of data) {
      const result = extractTextFromResponse(item);
      if (result && result.length > 50) {
        return result;
      }
    }
  }
  
  return null;
}

/**
 * Query CodeWiki about a repository
 */
export async function queryCodeWiki(
  query: string,
  repoUrl: string
): Promise<CodeWikiResponse> {
  const sessionId = generateSessionId();
  const requestId = generateRequestId();
  const repoPath = extractRepoPath(repoUrl);
  const fullRepoUrl = `https://${repoPath}`;
  
  const url = new URL(CODEWIKI_BASE_URL);
  url.searchParams.set('rpcids', 'EgIxfe');
  url.searchParams.set('source-path', `/${repoPath}`);
  url.searchParams.set('bl', 'boq_sdlc-agents-ui_20260128.05_p0');
  url.searchParams.set('f.sid', sessionId);
  url.searchParams.set('hl', 'en-US');
  url.searchParams.set('_reqid', requestId.toString());
  url.searchParams.set('rt', 'c');
  
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'Referer': 'https://codewiki.google/',
    'X-Same-Domain': '1',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  };
  
  const body = buildRequestPayload(query, fullRepoUrl);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body,
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
      };
    }
    
    const responseText = await response.text();
    const parsedResponse = parseResponse(responseText);
    
    return {
      success: true,
      response: parsedResponse,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Common queries for quick access
 */
export const CommonQueries = {
  OVERVIEW: "Tell me about this repository.",
  STRUCTURE: "What is the project structure and architecture?",
  GETTING_STARTED: "How do I get started with this project?",
  MAIN_FEATURES: "What are the main features of this project?",
  DEPENDENCIES: "What are the main dependencies and technologies used?",
  CONTRIBUTING: "How can I contribute to this project?",
  API: "What APIs does this project expose?",
  TESTING: "How do I run tests for this project?",
  DEPLOYMENT: "How do I deploy this project?",
} as const;
