# Start
* Option 1: `python src/server.py`
* Option 2: `python src/server.py --debug True --hotreload True --authoring True`


# API Header
* `aif-agent-uri`. URI for the mode which includes provider (`openai`, `azureopenai`, or `ollama` for local run), model name etc. Examples `openai://[model-name]?api-version=[api-version]`, `azureopenai://[base-uri]/[azure-deployment]?api-version=[api-version]`, `ollama://phi3:latest`
