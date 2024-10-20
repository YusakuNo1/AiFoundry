import * as bodyParser from "body-parser";
import * as multer from "multer";
import { misc } from "aifoundry-vscode-shared";

namespace RouterUtils {
    const jsonParser = bodyParser.json()
    const upload = multer();

    export const middlewares = {
        jsonParser,
        uploadFiles: upload.array('files'),
        formWithFiles: upload.array('files'),
    }

    export const fileConvertMiddleware = (acceptedTypes: misc.AcceptedFileInfoType[]) => (req, res, next) => {
        const files = req.files
            .map((file: any) => {
                const ext = file.originalname.split('.').pop();
                for (const type of acceptedTypes) {
                    if (misc.AcceptedFileInfo[type].extensions.includes(ext)) {
                        const dataUrlInfo: misc.DataUrlInfo = misc.AcceptedFileInfo[type].convert(ext, file.buffer);
                        return {
                            type: type as misc.AcceptedFileInfoType,
                            fileName: file.originalname,
                            data: dataUrlInfo.data,
                            dataUrlPrefix: dataUrlInfo.dataUrlPrefix,
                        };
                    }
                }
                return null;
            })
            .filter(file => file !== null);
        req.files = files;
        next();
    }
}

export default RouterUtils;
