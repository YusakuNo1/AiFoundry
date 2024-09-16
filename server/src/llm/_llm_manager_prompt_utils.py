from typing import List
import base64
from io import BytesIO
from PIL import Image
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
from aif_types.chat import ChatRole, ChatRequestFile, TextFormatPrompts


def get_prompt_template(
    database_manager: DatabaseManager,
    ragRetrieverList: List[VectorStoreRetriever],
    system_prompt_str: str | None,
    aif_session_id: str | None,
    outputFormat: str,
    input: str | List[str],
    files: List[ChatRequestFile] | None = None,
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
        files=files,
    )))

    final_prompt_template = ChatPromptTemplate(
        input_variables=input_variables, messages=messages
    )

    return final_prompt_template


imageExtensions = {
    "jpeg": {
        "format": "jpeg",
        "mime_type": "image/jpeg",
    },
    "jpg": {
        "format": "jpeg",
        "mime_type": "image/jpeg",
    },
    "png": {
        "format": "png",
        "mime_type": "image/png",
    },
    "gif": {
        "format": "gif",
        "mime_type": "image/gif",
    },
}
def _createInputMessage(
    input: str | List[str],
    files: List[ChatRequestFile] | None = None,
):
    content_parts = []

    if files is not None:
        for file in files:
            fileExt = file.file_name.split(".")[-1]
            if fileExt not in imageExtensions:
                continue

            image = Image.open(file.file_buffer)
            image = image.convert("RGB")
            mime_type = imageExtensions[fileExt]["mime_type"]
            content = convert_to_base64(image, imageExtensions[fileExt]["format"])

            file_part = {
                "type": "image_url",
                "image_url": {
                    "url": f"data:{mime_type};base64,{content}",
                    "detail": "high",
                },
            }
            content_parts.append(file_part)

    text_part = { "type": "text", "text": input }
    content_parts.append(text_part)

    return content_parts


def convert_to_base64(pil_image, format):
    buffered = BytesIO()
    pil_image.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str