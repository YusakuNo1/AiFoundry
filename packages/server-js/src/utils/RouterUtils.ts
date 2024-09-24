import * as bodyParser from "body-parser";
import * as multer from "multer";

namespace RouterUtils {
    const jsonParser = bodyParser.json()
    const upload = multer();

    export const middlewares = {
        jsonParser,
        uploadFiles: upload.array('files'),
    }
}

export default RouterUtils;
