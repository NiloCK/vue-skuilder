const { readdir, readFile, writeFile } = require('fs/promises');
const { join } = require('path');
// const { fetch } = require('node-fetch');

const conversionPrompt: string = `
System context:
Here is the base class that many components inherit from:

\`\`\`ts
// SkldrVue.ts
import Vue from 'vue';
import { Store } from 'vuex';
import { AppState } from './store';
import { User } from './db/userDB';

export default class SkldrVue extends Vue {
  public declare $store: Store<AppState>;

  /**
    * Print a message to the console. Prefixes the message with the component
    * name.
    */
  protected log(message?: any, ...optionalParams: any[]): void {
    console.log(\`[SK.\${this.$options.name}]: \`, message, ...optionalParams);
  }

  /**
    * Print an error message to the console. Prefixes the message with the
    * component name.
    *
    * @param message
    */
  protected error(message?: any, ...optionalParams: any[]): void {
    console.error(\`[SK.\${this.$options.name}]: \`, message, ...optionalParams);
  }

  /**
    * Print a warning message to the console. Prefixes the message with the
    * component name.
    * @param message
    */
  protected warn(message?: any, ...optionalParams: any[]): void {
    console.warn(\`[SK.\${this.$options.name}]: \`, message, ...optionalParams);
  }

  /**
    * Get the current user from the Vuex store. Throws an error if the user is
    * not logged in
    */
  protected user(): User {
    if (!this.$store.state._user) {
      throw new Error('User not logged in');
    } else {
      return this.$store.state._user;
    }
  }
}
\`\`\`


Task:
Please convert the following Vue 2 class-based component to Options API format.

Context:
Part of a migration effort toward Vue 3 and Vuetify 3.

Requirements:
- Only modify the <script> section
- Keep TypeScript support using Vue.extend()
- Preserve all existing functionality including base class features
- Keep the same external component API (props, events, refs)
- Leave <template> and <style> sections unchanged
- Flag any potential mixin merge conflicts or concerns

Please provide:
1. The new <script> section, properly typed for TypeScript
2. Any warnings about potential issues with base class functionality, in a <warnings> section
3. A simple message


Here's the component to convert:

`;

const EXCLUDE_DIRS = ['node_modules', 'dist', 'tests'];
const SPECIFIC_PATH = ''; // optional: set to process specific subdirectory

async function* findVueFiles(dir: string): AsyncGenerator<string> {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const path = join(dir, file.name);
    if (file.isDirectory() && !EXCLUDE_DIRS.includes(file.name)) {
      if (!SPECIFIC_PATH || path.includes(SPECIFIC_PATH)) {
        yield* findVueFiles(path);
      }
    } else if (file.name.endsWith('.vue')) {
      yield path;
    }
  }
}

async function convertFile(filepath: string) {
  try {
    // Read and parse the Vue file
    const content = await readFile(filepath, 'utf-8');

    // Make API call with your prompt
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: conversionPrompt + filepath + '\n\n```' + content + '```',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    const aiResponse = result.content[0].text;

    // Validate response
    const scriptMatch = aiResponse.match(/<script.*?>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      // throw new Error('No script section found in AI response');
      console.error(`No script section found in AI response for ${filepath}`);
      console.log(`Response: ${aiResponse}`);
      return;
    }

    const newScript = scriptMatch[1];

    console.log('\tResponse for', filepath, ':\n', aiResponse);
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const proceed = await new Promise((resolve) => {
      readline.question('\nProceed with conversion? (y/n): ', (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });

    // Write back to file
    if (!proceed) {
      console.log('Skipping conversion');
      return;
    } else {
      await replaceScriptSection(filepath, newScript);
      console.log(`Converted ${filepath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filepath}:`, error);
  }
}

async function replaceScriptSection(filepath: string, newScript: string) {
  const content = await readFile(filepath, 'utf-8');
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/;
  const newContent = content.replace(scriptRegex, `<script lang="ts">${newScript}</script>`);
  await writeFile(filepath, newContent, 'utf-8');
}

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error('Please provide an API key as an argument');
    process.exit(1);
  }
  process.env.ANTHROPIC_API_KEY = args[0];

  // Process all Vue files
  for await (const file of findVueFiles('./src')) {
    await convertFile(file);
  }
}

main().catch(console.error);
