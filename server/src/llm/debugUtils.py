from typing import Any, Dict, List
from langchain_core.callbacks.base import BaseCallbackHandler


class DebugPromptHandler(BaseCallbackHandler):
    """
    A simple callback handler that prints the prompts to the console.
    """
    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> Any:
        formatted_prompts = "\n".join(prompts)
        print(f"* * * Prompt:\n{formatted_prompts}")
