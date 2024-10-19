
import { BaseEntity } from "./BaseEntity"

export class FunctionMetadata extends BaseEntity {
    public static readonly ENTITY_NAME = "FunctionMetadata";

    public get version(): number { return 1 };

    constructor(
        public id: string,
        public name: string,
        public uri: string,             // uri of the function, patterns:
                                        //  aif://function/local/{functions_path}/{functions_name}
                                        //  aif://function/azure-functions/{app_name}/{functions_name}
        public functions_path: string,  // AifFunctionType.LOCAL. local path of the function
        public functions_name: string,  // AifFunctionType.LOCAL. name of the function
    ) {
        super(id);
    }
}
