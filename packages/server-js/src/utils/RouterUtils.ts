import * as bodyParser from "body-parser";
import * as multer from "multer";
import { types } from "aifoundry-vscode-shared";

namespace RouterUtils {
    const jsonParser = bodyParser.json()
    const upload = multer();

    export const middlewares = {
        jsonParser,
        uploadFiles: upload.array('files'),
        formWithFiles: upload.array('files'),
    }

    export const fileConvertMiddleware = (acceptedTypes: types.AcceptedFileInfoType[]) => (req, res, next) => {
        const files = req.files
            .map((file: any) => {
                const ext = file.originalname.split('.').pop();
                for (const type of acceptedTypes) {
                    if (types.AcceptedFileInfo[type].extensions.includes(ext)) {
                        const dataUrlInfo: types.DataUrlInfo = types.AcceptedFileInfo[type].convert(ext, file.buffer);
                        return {
                            type: type as types.AcceptedFileInfoType,
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
