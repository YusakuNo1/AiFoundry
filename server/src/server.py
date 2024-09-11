#!/usr/bin/env python
import argparse
from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.staticfiles import StaticFiles
from controllers.setup_controllers import setup_controllers
from llm.llm_manager import LlmManager
from _server_utils import setup_error_handlers
from database.database_manager import DatabaseManager
from metadata.server_metadata import server_metadata_tags
from server_config import serverConfig


parser = argparse.ArgumentParser()
parser.add_argument('--debug', help='Debug mode', default=False, type=bool, required=False)
parser.add_argument('--authoring', help='Enable authoring APIs', default=False, type=bool, required=False)
parser.add_argument('--hotreload', help='Auto reload for debugging', default=False, type=bool, required=False)
parser.add_argument('--localserver', help='Run server without docker', default=False, type=bool, required=False)
args = parser.parse_args()

app = FastAPI(
    title="AiFoundry Server",
    version="1.0",
    description="A simple api server for LLMs",
    openapi_tags=server_metadata_tags,
)

# if args.debug:
#     app.mount("/static", StaticFiles(directory="static"), name="static")

serverConfig.setup(args)

database_manager = DatabaseManager()
llm_manager = LlmManager(database_manager)

setup_controllers(app, llm_manager, args.debug, args.authoring)
setup_error_handlers(app, args.debug)

if __name__ == "__main__":
    import uvicorn

    host = "0.0.0.0" # if you want to run on localhost, change this to "localhost", but Docker will fail

    if args.hotreload:
        # Debug only: set reload=Treu and "server:app" for hot reload, "server" is the file name for "app"
        uvicorn.run("server:app", host=host, port=8000, reload=True)
    else:
        uvicorn.run(app, host=host, port=8000)
