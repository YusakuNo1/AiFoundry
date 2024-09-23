
import { Column, Entity, PrimaryColumn } from "typeorm"
import { IEntity } from "./IEntity"

@Entity({ name: 'chathistory' })
export class ChatHistory implements IEntity {
    @PrimaryColumn()
    id: string

    @Column()
    aif_agent_uri: string

    // JSON string
    @Column()
    messages: string
}
