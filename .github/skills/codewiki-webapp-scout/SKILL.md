---
name: codewiki-webapp-scout
description: "Use when a user wants to build a new web app from an existing GitHub repository, compare it with another project, or add features like PostgreSQL after first analyzing the source repo with CodeWiki."
argument-hint: "<target repo or URL> <desired changes>"
---

# CodeWiki Webapp Scout

Use this skill when the user gives you a repository to learn from and a set of changes to build into a new app.

## What this skill does

1. Extract the source repository URL and the requested changes from the user prompt.
2. Turn that into a focused CodeWiki question.
3. Run the local CodeWiki query command before writing code.
4. Use the response to guide the implementation plan.

## How to use it

1. Identify the repository being referenced.
2. Identify the requested goal or delta, such as adding PostgreSQL, changing the UI, or porting the app.
3. Run:

   `npm run codewiki:query -- --repo <repo-url> --query "<focused question>"`

4. Read the response and extract the stack, architecture, dependencies, and any setup constraints.
5. Build the new app or changes in the workspace after the CodeWiki pass.

## Query pattern

Use a query that asks for the facts needed to start implementation.

Example:

User request: "I want to build a new webapp like https://github.com/ajanraj/OpenChat but want to add PostgreSQL db"

CodeWiki query:

`What stack does https://github.com/ajanraj/OpenChat use, how is it structured, and what would I need to change to build a similar app with PostgreSQL?`

## Notes

- The local command handles the CodeWiki request details for you, so the skill only needs one repository URL and one question.
- If the user does not provide a repository URL, ask a clarifying question before running the command.
- If the user provides multiple repositories, treat the primary source repo as the CodeWiki target and mention any comparison repo separately.