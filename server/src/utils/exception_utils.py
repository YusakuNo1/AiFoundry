from typing import Callable
from pydantic import ValidationError
from fastapi import HTTPException


def extraValidationErrorMessage(e: ValidationError) -> str:
    if hasattr(e, "errors"):
        messages = []
        for error in e.errors():
            if "msg" in error:
                messages.append(error["msg"])
        return ", ".join(messages)
    else:
        return "Unknown error" # TODO: extract error message from e


def exceptionHandler(runFunc: Callable):
    try:
        return runFunc()
    except HTTPException as e:
        # Keep HTTPException as is
        raise e
    except Exception as e:
        # Convert the message from Exceptions with "args" attribute
        if hasattr(e, "args") and type(e.args) == list and len(e.args) > 0:
            raise HTTPException(status_code=500, detail=", ".join(e.args))
        else:
            raise HTTPException(status_code=500, detail="Unknown error")
