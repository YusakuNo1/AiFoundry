import os
import json
import uuid
from typing import List
from fastapi import HTTPException
from sqlmodel import SQLModel, create_engine
from sqlalchemy.engine.base import Engine
from sqlalchemy.orm import Session

from utils.assets_utils import get_assets_path
from aif_types.embeddings import EmbeddingMetadata, CreateEmbeddingsRequest, CreateOrUpdateEmbeddingsResponse, ListEmbeddingsResponse, UpdateEmbeddingMetadataRequest
from aif_types.agents import AgentMetadata, CreateAgentRequest, UpdateAgentRequest, CreateOrUpdateAgentResponse, ListAgentsResponse
from aif_types.functions import FunctionMetadata, UpdateFunctionRequest, CreateOrUpdateFunctionResponse, DeleteFunctionResponse
from aif_types.chat import ChatHistory, ChatHistoryMessage, ChatRole


class DatabaseManager:
    _engine: Engine | None = None

    def __init__(self) -> None:
        file_name = os.environ.get("SQLITE_FILE_NAME")
        assets_path = get_assets_path()
        database_uri = f"sqlite:///{assets_path}/{file_name}"
        self._engine = create_engine(database_uri)
        SQLModel.metadata.create_all(self._engine)

    def save_db_model(self, db_model: SQLModel):
        with Session(self._engine) as session:
            session.add(db_model)
            session.commit()

    def load_embeddings_metadata(self, asset_id: str) -> EmbeddingMetadata | None:
        with Session(self._engine) as session:
            return session.get(EmbeddingMetadata, asset_id)

    def list_embeddings_metadata(self) -> List[EmbeddingMetadata]:
        with Session(self._engine) as session:
            return session.query(EmbeddingMetadata).all()

    def delete_embeddings_metadata(self, asset_id: str):
        with Session(self._engine) as session:
            embedding_metadata = session.get(EmbeddingMetadata, asset_id)
            session.delete(embedding_metadata)
            session.commit()

    def list_agents(self) -> List[AgentMetadata]:
        with Session(self._engine) as session:
            return session.query(AgentMetadata).all()

    def load_model(self, id: str) -> AgentMetadata | None:
        with Session(self._engine) as session:
            return session.get(AgentMetadata, id)
        
    def update_agent(self, id: str, request: UpdateAgentRequest) -> CreateOrUpdateAgentResponse:
        with Session(self._engine) as session:
            agent = session.get(AgentMetadata, id)
            if agent is None:
                raise Exception(f"Agent with id {id} not found")

            agent.base_model_uri = request.base_model_uri if request.base_model_uri else agent.base_model_uri
            agent.name = request.name if request.name else agent.name
            # System prompt can be None
            agent.system_prompt = request.system_prompt if request.system_prompt is not None else agent.system_prompt
            agent.rag_asset_ids = request.rag_asset_ids if request.rag_asset_ids else agent.rag_asset_ids
            agent.function_asset_ids = request.function_asset_ids if request.function_asset_ids else agent.function_asset_ids

            session.commit()
            return CreateOrUpdateAgentResponse(agent_uri=agent.agent_uri)

    def delete_agent(self, id: str):
        with Session(self._engine) as session:
            agent_metadata = session.get(AgentMetadata, id)
            if agent_metadata is None:
                raise Exception(f"Agent with id {id} not found")
            session.delete(agent_metadata)
            session.commit()


    def add_chat_message(self, aif_agent_uri: str, id: str, role: ChatRole, content: str):
        with Session(self._engine) as session:
            chat_history = session.get(ChatHistory, id)
            if chat_history is None:
                chat_history = ChatHistory(id=id, aif_agent_uri=aif_agent_uri, messages="[]")
                session.add(chat_history)

            messages_json = json.loads(chat_history.messages) if chat_history.messages else []
            messages_json.append({
                "role": role.name,
                "content": content,
            })

            chat_history.messages = json.dumps(messages_json)
            session.commit()


    def get_chat_history(self, id: str) -> List[ChatHistoryMessage] | None:
        with Session(self._engine) as session:
            return session.get(ChatHistory, id)


    def get_chat_history_messages(self, id: str) -> List[ChatHistoryMessage] | None:
        with Session(self._engine) as session:
            chat_history = session.get(ChatHistory, id)
            if chat_history is None:
                return None

            messages_json = json.loads(chat_history.messages) if chat_history.messages else []
            messages = []
            for message in messages_json:
                messages.append(ChatHistoryMessage(**message))
            return messages


    def delete_chat_history(self, id: str):
        with Session(self._engine) as session:
            chat_history = session.get(ChatHistory, id)
            if chat_history is not None:
                session.delete(chat_history)
                session.commit()


    def list_functions(self) -> List[FunctionMetadata]:
        with Session(self._engine) as session:
            return session.query(FunctionMetadata).all()


    def get_function(self, id: str) -> FunctionMetadata | None:
        with Session(self._engine) as session:
            return session.get(FunctionMetadata, id)


    def update_function(self, request: UpdateFunctionRequest) -> CreateOrUpdateFunctionResponse:
        with Session(self._engine) as session:
            function = session.get(FunctionMetadata, request.id)
            if function is None:
                raise HTTPException(status_code=404, detail=f"Function with id {request.id} not found")

            function.name = request.name if request.name else function.name
            session.commit()
            return CreateOrUpdateFunctionResponse(
                id=function.id,
                uri=function.uri,
                name=function.name,
                functions_path=function.functions_path,
                functions_name=function.functions_name,
            )


    def delete_function(self, id: str):
        with Session(self._engine) as session:
            function = session.get(FunctionMetadata, id)
            if function is None:
                raise HTTPException(status_code=404, detail=f"Function with id {id} not found")

            session.delete(function)
            session.commit()
            return DeleteFunctionResponse(id=id)
