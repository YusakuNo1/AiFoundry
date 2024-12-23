# Releases
## Version 0.4.0
Javascript server with parity feature, except for function calling

## Version 0.2.0
Support image to text
![Image to text](media/intro_image_to_text.gif)

## Version 0.1.0
Initial release:
1. Support 7 LLM providers
2. RAG/embedding
3. Function calling


# Install

Setup video:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/J0kkLQt_ZIU/0.jpg)](https://www.youtube.com/watch?v=J0kkLQt_ZIU)

## Install AI Foundry VS Code extension
* Download [VS Code](https://code.visualstudio.com/download) and install
* Download AI Foundry VS Code extension [version 0.4.0](https://drive.google.com/file/d/1GRvuOVqKXkFOATh2s_3Pv5DblVkLvaWK/view?usp=drive_link)
* Launch VS Code and choose `Extensions` from the activity bar (on the left by default)
* Click the 3 dots at top right
* Click `Install from VSIX` from the menu and choose the VS Code extension file (*.vsix)

## Setup language model providers
Choose at least one of the following language model providers: 
* **Ollama**: Download Ollama https://ollama.com/download, install and run `ollama serve` from Terminal
* **OpenAI**: [setup link](https://platform.openai.com/api-keys)
* **Azure OpenAI**: [setup link](https://learn.microsoft.com/en-us/azure/api-management/api-management-authenticate-authorize-azure-openai)
* **Google Gemini**: [setup link](https://ai.google.dev/)
* **AWS Bedrock**: Register AWS account and setup AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (you may need AWS_SESSION_TOKEN depends on the configurations) with `aws configure` ([link](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html)) and then [request the model access](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html).

# User manual
Intro video:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/o6hagtI56-A/0.jpg)](https://www.youtube.com/watch?v=o6hagtI56-A)

## Basic LLM chat with Ollama
* Move mouse to "AIF Agents", click the three dots on the right
* Choose "Create" and input a name for your agent
* Choose "ollama://mistral" as base model
* Click "OK" for the next step
* Choose the new created agent and then click "Playground"
* Type your questions and then wait for the LLM responses
* Go back to the agent menu, click the edit button (the pen icon on the right), you can add the system prompt for LLM.
## Document search (RAG/Embedding)
* Move mouse to "AIF Embeddings", click the three dots on the right
* Choose "Create" and input a name for your documents
* Choose "ollama://mxbai-embed-large" as embedding model
* Choose one or more documents for searching, currently, AI Foundry only supports TXT files. You can add restaurant menu, resume or any documents you want to search for.
* Create an "agent" with the steps in section "Basic LLM chat with Ollama", but choose your documents name from the list
* In "Playground", ask questions about your documents, LLM can give you the answers. For example, if you uploads hotel check-in, check-out rules and then ask LLM "I would like to check in at Sept 11 and then stay for 2 nights, what date and what time should I check out?", LLM should be able to tell you the date and time based on the hotel rules from the document.

# Engine Developer Instructions
Download source code: https://github.com/YusakuNo1/AiFoundry

## Base concepts
### AI Foundry URI
AI Foundry uses URI as resource identifier as well as keys for map. A typical AI Foundry URI is: `[provider]://[category]/[path1]/[path2]/[path3]?[param1=value1]&[param2=value2]`, a concrete example is `aif://agents/[agent-id]`, `azureopenai://models/gpt-4o-mini?version=2024-07-01-preview`

## Compile
### Setup (only the first time)
* In folder of AiFoundry, run `npm i`
### Start source code change monitoring
* Start 3 different terminals to monitor code changes
  * In folder of AiFoundry, run `cd packages\vscode-shared && npm run watch` and keep this Terminal openned
  * In folder of AiFoundry, run `cd packages\vscode-ui && npm run watch` and keep this Terminal openned
  * In folder of AiFoundry, run `cd packages\server-js && npm run watch` and keep this Terminal openned
* Start VS Code extension debug mode
  * Launch a VS Code instance
  * Choose `Run and Debug` from the activity bar
  * Select configuration `Launch AI Foundry`

## How to debug
* For AI Foundry VS Code extension debugging, it's Node.js code, use the VS Code instance
* For AI Foundry VS Code extension webview, debug from new VS Code instance, by launching `Inspect` with menu `Help -> Toggle Developer Tools` -- it's the same inspect like Chromium/Chrome/Edge, because VS Code is an Electron app.

## Release
### VS Code extension
* Download vsce from this special branch: https://github.com/YusakuNo1/vscode-vsce/tree/main.aifoundry
* In vscode-vsce run command: `npm i && npm run compile`
* Update `packages/vscode/build.sh` with the path for `vscode-vsce`, e.g. if `vscode-vsce` is in `/Users/david/vscode-vsce`, set `VSCE_HOME=/Users/david/vscode-vsce`
 
