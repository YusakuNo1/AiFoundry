from enum import Enum

class LlmProvider(Enum):
	OPENAI = "openai"
	AZUREOPENAI = "azureopenai"
	OLLAMA = "ollama"
	GOOGLEGEMINI = "googlegemini"
	ANTHROPIC = "anthropic"
	HUGGINGFACE = "huggingface"
	AWS_BEDROCK = "aws-bedrock"


class LlmFeature(Enum):
	ALL = "all"
	CONVERSATIONAL = "conversational"
	VISION = "vision"
	EMBEDDING = "embedding"
	TOOLS = "tools"
