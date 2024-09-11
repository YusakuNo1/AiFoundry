# Install

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
