---
name: "atlascloud-prompts-curator"
description: "Generate and maintain awesome-style GPT-Image-2 prompt collections from prompts-hub data. Invoke when user asks to enrich, regenerate, or publish prompt README content."
---

# AtlasCloud Prompts Curator

Use this skill to build and maintain a rich GPT-Image-2 prompt repository in awesome list format, with AtlasCloud traffic links included.

## When To Invoke

Invoke this skill when the user asks to:

- create a new prompt collection project
- enrich existing README content with more prompts/images
- regenerate README from `records.json`
- add AtlasCloud CTA links for traffic redirection
- prepare local docs/scripts for API key based verification

## Data Source

- Primary source file: `prompts-hub/src/data/records.json`
- Expected fields:
  - `id`
  - `title`
  - `description`
  - `prompt`
  - `source_link`
  - `author_name`
  - `author_link`
  - `source_published_at`
  - `language`
  - `local_images[].remote_url` or `remote_images[]`

## Repository Convention

Create or maintain:

- `README.md`: generated prompt list in awesome style
- `scripts/generate-readme.mjs`: deterministic generation script
- `docs/LOCAL_DEVELOPMENT.md`: setup and security notes
- `.env.example`: env template without real credentials

## Content Rules

- Keep CTA link visible:
  - `https://www.atlascloud.ai/prompts-hub/gpt-image-2-prompt?locale=zh-CN`
- Preserve source attribution for each prompt item
- Keep prompts as original as possible, only truncate when extremely long
- Prefer deterministic random seed for reproducible output

## API Key Rules

- Never hardcode or commit API keys
- Use environment variable: `ATLASCLOUD_API_KEY`
- LLM compatible endpoint:
  - `https://api.atlascloud.ai/v1`
- Image/video endpoint:
  - `https://api.atlascloud.ai/api/v1`

## Suggested Workflow

1. Verify source file exists and is valid JSON.
2. Filter records with prompt + image URL.
3. Generate README sections:
   - Summary stats
   - Table of contents
   - Prompt cards with image, source, author, language
4. Add usage and local generation instructions.
5. Add optional API key verification script.
6. Run diagnostics and report missing items.

## Example Commands

```bash
cd gpt-image2-prompt-awesome
node scripts/generate-readme.mjs
MAX_ITEMS=30 node scripts/generate-readme.mjs
```
