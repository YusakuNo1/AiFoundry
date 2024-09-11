import os
from typing import Annotated
from fastapi import APIRouter
from fastapi import FastAPI, File, UploadFile

import consts

def do_upload_file(file: UploadFile):
    contents = file.read()
    # print(f"file content: {contents}")
    print(type(contents))
    database_folder = f"{os.environ['CODE_HOME']}/{consts.DATABASE_FOLDER}"
    # create folder if not exists
    os.makedirs(database_folder, exist_ok=True)
    # write file to a folder which is from environment variable CODE_HOME and "/myfolder"
    with open(f"{database_folder}/{file.filename}", "wb") as f:
        f.write(contents)
    return {"file_size": len(contents)}