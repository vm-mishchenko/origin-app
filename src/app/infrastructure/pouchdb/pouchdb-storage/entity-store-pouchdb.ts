import {
    IEntityStorePouchDb,
    IPouchDb,
    IPouchdbRawExistingStorageEntity,
    IPouchdbRawNewStorageEntity,
    IPouchdbStorageEntity
} from './pouchdb-storage.types';

export class EntityStorePouchDb<M extends IPouchdbStorageEntity> implements IEntityStorePouchDb<M> {
    constructor(private pouchDb: IPouchDb, private entityName: string) {
    }

    get(id: string): Promise<M> {
        return this.getRawEntity(id).then((rawEntity) => this.extractEntity(rawEntity));
    }

    find(options: any): Promise<M[]> {
        return this.pouchDb.find({
            ...options,
            type: this.entityName
        }).then((result) => result.docs.map((rawEntity) => this.extractEntity(rawEntity)));
    }

    add(entity: M): Promise<any> {
        return this.pouchDb.put(this.createNewRawEntity(entity));
    }

    update(entity: Partial<M>): Promise<any> {
        return this.getRawEntity(entity.id).then((rawEntity) => {
            return this.pouchDb.put({
                ...rawEntity,
                ...(entity as object)
            });
        });
    }

    remove(id: string): Promise<any> {
        return this.getRawEntity(id).then((rawEntity) => this.pouchDb.remove(rawEntity));
    }

    reInitializeDatabase(newDatabase: IPouchDb) {
        this.pouchDb = newDatabase;
    }

    private getRawEntity(id: string): Promise<IPouchdbRawExistingStorageEntity> {
        return this.pouchDb.get(this.getRawPouchDbId(id));
    }

    private getRawPouchDbId(id: string): string {
        return `${this.entityName}:${id}`;
    }

    private extractEntity(rawEntity: IPouchdbRawExistingStorageEntity): M {
        const {_id, _rev, type, ...entity} = rawEntity;

        return entity as M;
    }

    private createNewRawEntity(entity: M): IPouchdbRawNewStorageEntity {
        const newEntity = {
            _id: this.getRawPouchDbId(entity.id),
            type: this.entityName,
            ...(entity as object)
        };

        return newEntity as IPouchdbRawNewStorageEntity;
    }
}
