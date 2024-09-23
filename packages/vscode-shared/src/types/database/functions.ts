
import { Column, Entity, PrimaryColumn } from "typeorm"
import { IEntity } from "./IEntity"

@Entity({ name: 'functionmetadata' })
export class FunctionMetadata implements IEntity {
    @PrimaryColumn()
    id: string

    @Column()
    name: string

    // uri of the function, patterns:
    //  aif://function/local/{functions_path}/{functions_name}
    //  aif://function/azure-functions/{app_name}/{functions_name}
    @Column()
    uri: string

    // AifFunctionType.LOCAL. local path of the function
    @Column()
    functions_path: string

    // AifFunctionType.LOCAL. name of the function
    @Column()
    functions_name: string
}
