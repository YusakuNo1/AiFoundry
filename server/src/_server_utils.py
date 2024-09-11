from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError, ValidationException
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.responses import PlainTextResponse

def setup_error_handlers(app: FastAPI, debug: bool = False):
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request, exc):
        if debug:
            print(f"StarletteHTTPException error: {exc}")
        return PlainTextResponse(str(exc.detail), status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_request_exception_handler(request, exc):
        if debug:
            print(f"RequestValidationError error: {exc}")
        return PlainTextResponse(str(exc), status_code=400)

    @app.exception_handler(ValidationException)
    async def validation_exception_handler(request, exc):
        if debug:
            print(f"ValidationException error: {exc}")
        return PlainTextResponse(str(exc), status_code=400)
