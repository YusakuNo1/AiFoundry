from typing import List
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate,
    AIMessagePromptTemplate,
)
from langchain_core.messages import HumanMessage
from langchain_core.vectorstores import VectorStoreRetriever
from database.database_manager import DatabaseManager
from aif_types.chat import ChatRole, TextFormatPrompts
from aif_types.common import RequestFileInfo


def get_prompt_template(
    database_manager: DatabaseManager,
    ragRetrieverList: List[VectorStoreRetriever],
    system_prompt_str: str | None,
    aif_session_id: str | None,
    outputFormat: str,
    input: str | List[str],
    requestFileInfoList: List[RequestFileInfo] | None = None,
):
    system_prompt_template = system_prompt_str if system_prompt_str else ""
    if len(system_prompt_template) > 0 and TextFormatPrompts[outputFormat]:
        system_prompt_template += "\n"
        system_prompt_template += TextFormatPrompts[outputFormat]

    input_variables = []
    for index, retriever in enumerate(ragRetrieverList):
        context_id = f"context-{index}"
        if len(system_prompt_template) > 0:
            system_prompt_template += "\n"
        system_prompt_template += "Context: {" + context_id + "}"
        input_variables.append(context_id)

    system_prompt = SystemMessagePromptTemplate(
        prompt=PromptTemplate(input_variables=input_variables, template=system_prompt_template)
    )
    messages = [system_prompt] if len(system_prompt_template) > 0 else []

    if aif_session_id:
        history_messages = database_manager.get_chat_history_messages(aif_session_id)
        if history_messages is not None:
            for message in history_messages:
                if message.role == ChatRole.USER.name:
                    messages.append(HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template=message.content)))
                else:
                    messages.append(AIMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template=message.content)))

    messages.append(HumanMessage(content=_createInputMessage(
        input=input,
        requestFileInfoList=requestFileInfoList,
    )))

    final_prompt_template = ChatPromptTemplate(
        input_variables=input_variables, messages=messages
    )

    return final_prompt_template


def _createInputMessage(
    input: str | List[str],
    requestFileInfoList: List[RequestFileInfo] | None = None,
):
    content_parts = []

    for requestFileInfo in requestFileInfoList:
        file_part = {
            "type": "image_url",
            "image_url": {
                "url": f"data:{requestFileInfo.mine_type};base64,{requestFileInfo.file_buffer}",
                "detail": "high",
            },
        }
        content_parts.append(file_part)

    text_part = { "type": "text", "text": input }
    content_parts.append(text_part)

    return content_parts
