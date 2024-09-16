import os
from typing import Callable, List
from fastapi import HTTPException
from utils.aif_utils import is_aif_agent_uri
from database.database_manager import DatabaseManager
from pydantic import BaseModel
from llm.llm_function_utils import get_functions_asset_path


class ProcessAifAgentUriResponse(BaseModel):
    agent_uri: str
    aif_rag_asset_ids: List[str] | str | None
    functions: List[Callable]
    system_prompt: str | None


def process_aif_agent_uri(
    database_manager: DatabaseManager,
    aif_agent_uri: str,
) -> ProcessAifAgentUriResponse:
    if is_aif_agent_uri(aif_agent_uri):
        agents = database_manager.list_agents()
        agents = [x for x in agents if x.agent_uri == aif_agent_uri]
        if len(agents) == 0:
            raise HTTPException(status_code=404, detail="Agent not found")
        else:
            agent = agents[0]
            aif_agent_uri = agent.base_model_uri
            functions = [_load_local_functions(database_manager, function_asset_id) for function_asset_id in agent.function_asset_ids]
            return ProcessAifAgentUriResponse(
                agent_uri=aif_agent_uri,
                aif_rag_asset_ids=agent.rag_asset_ids,
                system_prompt=agent.system_prompt,
                functions=functions,
            )
    else:
        return ProcessAifAgentUriResponse(
            agent_uri=aif_agent_uri,
            aif_rag_asset_ids=[],
            system_prompt=None,
            functions=[],
        )


def _load_local_functions(database_manager: DatabaseManager, function_asset_id: str) -> Callable:
    import sys, importlib
    function_metadata = database_manager.get_function(function_asset_id)
    if function_metadata is None:
        raise HTTPException(status_code=404, detail="Function not found")

    if function_metadata.functions_path not in sys.path:
        sys.path.append(function_metadata.functions_path)

    function_folder = get_functions_asset_path()
    function_file_path = os.path.join(function_folder, function_metadata.functions_path, function_metadata.functions_name + ".py")

    module_spec = importlib.util.spec_from_file_location(function_metadata.functions_name, function_file_path)
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    # func_callable = getattr(module, "in_module1")
    # func_callable()



    # function_module = importlib.import_module(function_metadata.functions_name)
    func_callable = getattr(module, function_metadata.functions_name)
    return func_callable
