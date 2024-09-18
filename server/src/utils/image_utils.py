import base64
from io import BytesIO

def convert_to_base64(pil_image, format):
    buffered = BytesIO()
    pil_image.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str
