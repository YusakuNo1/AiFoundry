# Install

Setup video:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/J0kkLQt_ZIU/0.jpg)](https://www.youtube.com/watch?v=J0kkLQt_ZIU)

## Install AI Foundry VS Code extension
* Download [VS Code](https://code.visualstudio.com/download) and install
* Download AI Foundry VS Code extension [version 0.1.0](https://drive.google.com/file/d/1s-7jCrmDTwXigOZPuooSUP7JfkkezLiM/view?usp=sharing)
* Launch VS Code and choose `Extensions` from the activity bar (on the left by default)
* Click the 3 dots at top right
* Click `Install from VSIX` from the menu and choose the VS Code extension file (*.vsix)

## Setup environment
* Download [Docker Desktop](https://www.docker.com/products/docker-desktop/), install and then launch
* (Special Step) As the setup step is not finished in AI Foundry, please run Docker step manually: `docker pull davidwuno1/aifoundry` from Terminal.
* Choose AI Foundry icon from side bar, if you have many icons on the right, it may hide within the three dots
* Click "Docker Server", from the tab, choose "Start Server"

## Setup language model providers
Choose at least one of the following language model providers: 
* **Ollama**: Download Ollama https://ollama.com/download, install and run `ollama serve` from Terminal
* **Azure OpenAI**: [setup link](https://learn.microsoft.com/en-us/azure/api-management/api-management-authenticate-authorize-azure-openai)
* **OpenAI**: [setup link](https://platform.openai.com/api-keys)
* **Google Gemini**: [setup link](https://ai.google.dev/)
* **Anthropic Claude**: [setup link](https://console.anthropic.com/settings/keys)
* **HuggingFace**: [setup link](https://huggingface.co/docs/hub/security-tokens)
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
## Compile frontend
### Setup (only the first time)
* In folder of AiFoundry, run `yarn`
### Start source code change monitoring
* Start 3 different terminals to monitor code changes
  * In folder of AiFoundry, run `cd packages\vscode-shared && yarn watch` and keep this Terminal openned
  * In folder of AiFoundry, run `cd packages\vscode-ui && yarn watch` and keep this Terminal openned
  * In folder of AiFoundry, run `cd packages\vscode && yarn watch` and keep this Terminal openned
* Start VS Code extension debug mode
  * Launch a VS Code instance (let's call it `VS Code Instance 1`)
  * Choose `Run and Debug` from the activity bar
  * Select configuration `Launch VSCode Ext AI Foundry`
  * Click `Start Debugging` or press `F5`, a new VS Code window will be launched. Let's call it `VS Code Instance 2`

## Start backend server
* In folder of AiFoundry, build the debug docker image: `docker compose build`
* Replace the folder of [aifoundry-src] and run command (and keep this Terminal openned): `docker run -it -p 8000:8000 --name aifoundry-server-dev -v /Users/weiwu/.aifoundry/assets:/home/vscode/assets -v [aifoundry-src]:/home/vscode/aifoundry --add-host=host.docker.internal:host-gateway davidwuno1/aifoundry-dev /bin/bash`
* Open new VS Code instance from the Docker container `aifoundry-server-dev`
  * In VS Code, choose `Remote Explorer` from the activity bar
  * For the frist time of using remote explorer:
    * Choose `aifoundry` from the containers and choose `Attach in New Window` button on the right (the button was hidden until mouse over), a new VS Code instance will be launched, let's call it `VS Code Instance 3`
    * Choose `File -> Open Folder`, insert path `/home/vscode/aifoundry/server/` and then click `OK`
    * Copy file `.env_example` to `.env` from the folder: `cp .env_example .env`
  * For the 2nd or later time of using remote explorer:
    * Choose the folder `server` under container `aifounry`, a new VS Code instance will be launched, let's call it `VS Code Instance 3`
  * Start backend server from debugger:
    * In VS Code, choose `Run and Debug` from the activity bar
    * Select configuration `Start Server`
    * Click `Start Debugging` or press `F5`

## How to debug
* For VS Code extension debugging, it's Node.js code, use `VS Code Instance 1`
* For anything from VS Code extension "webview", which is the tab in file editor within VS Code window. Debug the code from `VS Code Instance 2` by launching `Inspect` with menu `Help -> Toggle Developer Tools` -- it's the same inspect like Chromium/Chrome/Edge, because VS Code is an Electron app.
* For backend debugging, use `VS Code Instance 3`
