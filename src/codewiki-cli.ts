#!/usr/bin/env node

import { queryCodeWiki } from "./codewiki-client.js";
import { argv, exit } from "node:process";

type CliArgs = {
  repo?: string;
  query?: string;
  help?: boolean;
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--help" || value === "-h") {
      args.help = true;
      continue;
    }

    if (value === "--repo" || value === "-r") {
      args.repo = argv[index + 1];
      index += 1;
      continue;
    }

    if (value === "--query" || value === "-q") {
      args.query = argv[index + 1];
      index += 1;
      continue;
    }
  }

  return args;
}

function printUsage(): void {
  console.log([
    "Usage:",
    "  npm run codewiki:query -- --repo <owner/repo-or-url> --query \"<question>\"",
    "",
    "Example:",
    "  npm run codewiki:query -- --repo https://github.com/ajanraj/OpenChat --query \"What stack does this app use?\"",
  ].join("\n"));
}

async function main(): Promise<void> {
  const args = parseArgs(argv.slice(2));
  const repo = args.repo;
  const query = args.query;

  if (args.help || !repo || !query) {
    printUsage();
    exit(args.help ? 0 : 1);
  }

  const result = await queryCodeWiki(query, repo);

  if (!result.success) {
    console.error(result.error ?? "Unknown CodeWiki error");
    exit(1);
  }

  console.log(result.response ?? "No response received");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  exit(1);
});