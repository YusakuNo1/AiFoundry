import json
import inspect
from typing import Any, Callable, List
from docstring_parser import parse
from fastapi import HTTPException

"""
Sample response:
    {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, " "e.g. San Francisco, CA",
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                },
            },
            "required": ["location"],
        },
    }
"""
def create_tool(func, overrideParameters: str = None):
    paramKey = overrideParameters if overrideParameters else "parameters"

    def map_type(param_type: str) -> str:
        if param_type == "str":
            return "string"
        elif param_type == "int":
            return "integer"
        elif param_type == "bool":
            return "boolean"
        else:
            return param_type

    docstring = parse(func.__doc__)
    tool = {
        "name": func.__name__,
        "description": docstring.short_description,
        paramKey: {
            "type": "object",
            "properties": {},
            "required": []
        }
    }

    for param in docstring.params:
        tool[paramKey]["properties"][param.arg_name] = {
            "type": map_type(param.type_name),
            "description": param.description,
        }

    sig = inspect.signature(func)
    param_dict = dict(sig.parameters)
    required_params = [k for k, v in param_dict.items() if v.default is inspect.Parameter.empty]
    tool[paramKey]["required"] = required_params
    return tool


def processToolsResponse(invoke_result: Any, functions: List[Callable]):
    if invoke_result.tool_calls: # Ollama, Claude
        # TODO: only call the first function from tool_calls
        tool_call = invoke_result.tool_calls[0]
        func_name = tool_call["name"]
        arg_dict = tool_call["args"]

        func_callable = None
        for callable in functions:
            if callable.__name__ == func_name:
                func_callable = callable
                break

        if not func_callable:
            raise HTTPException(status_code=404, detail="Function not found")
        
        response = func_callable(**arg_dict)
        return response

    elif invoke_result.additional_kwargs and ('function_call' in invoke_result.additional_kwargs): # OpenAI / AzureOpenAI
        func_name = invoke_result.additional_kwargs['function_call']['name']
        arg_str = invoke_result.additional_kwargs['function_call']['arguments']
        arg_dict = json.loads(arg_str)

        func_callable = None
        for callable in functions:
            if callable.__name__ == func_name:
                func_callable = callable
                break

        if not func_callable:
            raise HTTPException(status_code=404, detail="Function not found")
        
        response = func_callable(**arg_dict)
        return response

    else:   
        return ""

