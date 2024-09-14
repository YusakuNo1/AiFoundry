from fastapi import FastAPI
from llm.llm_manager import LlmManager
from controllers import agents, embeddings, chat, languagemodels, functions, system


def setup_controllers(app: FastAPI, llm_manager: LlmManager, debug: bool, authoring: bool):
	app.include_router(chat.create_routers(llm_manager))
	app.include_router(system.create_routers(llm_manager))

	if authoring:
		app.include_router(embeddings.create_admin_routers(llm_manager))
		app.include_router(languagemodels.create_admin_routers(llm_manager))
		app.include_router(agents.create_admin_routers(llm_manager))
		app.include_router(functions.create_admin_routers(llm_manager))

	if debug:
		app.include_router(embeddings.create_debug_routers(llm_manager))
