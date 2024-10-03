## Doc:
https://medium.com/@surajshende247/beginner-guide-to-setting-up-typescript-node-express-project-7ba0689ea94e

## Setup
* Install ts-node: `npm install -g ts-node`

### Known issues
* Ollama browser package didn't work with type script, for the following error, go to the folder and add `// @ts-ignore` before this line `import { Ollama as OllamaClient } from "ollama/browser";` -- this step needs to be repeated after each installation 
    `../../node_modules/@langchain/ollama/dist/llms.d.ts(6,40): error TS2307: Cannot find module 'ollama/browser' or its corresponding type declarations.`
 