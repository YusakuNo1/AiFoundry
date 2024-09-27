export abstract class BaseEntity {
    public static readonly ENTITY_NAME: string = "BaseEntity";

    public entityName: string;

    constructor(public id: string) {
        this.entityName = (this.constructor as any).ENTITY_NAME;
    }
    
    abstract get version(): number;
}
