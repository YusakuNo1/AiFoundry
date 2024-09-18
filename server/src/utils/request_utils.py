import io
from fastapi import UploadFile
from PIL import Image
from aif_types.common import RequestFileInfo
from consts import IMAGE_EXTENSION_INFO
from utils.image_utils import convert_to_base64


async def createRequestFileInfo(file: UploadFile) -> RequestFileInfo | None:
    fileExt = file.filename.split(".")[-1]
    if fileExt not in IMAGE_EXTENSION_INFO:
        return None

    # Read image data from the file object
    image_data = await file.read()

    # Create a PIL Image object from the binary data
    image = Image.open(io.BytesIO(image_data))
    image = image.convert("RGB")
    mime_type = IMAGE_EXTENSION_INFO[fileExt]["mime_type"]
    content = convert_to_base64(image, IMAGE_EXTENSION_INFO[fileExt]["format"])
    return RequestFileInfo(file_name=file.filename, mine_type=mime_type, file_buffer=content)
