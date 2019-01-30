export class PageStoreSyncStrategy {
    constructor(private persistentDb: any,
                private memoryDb: any) {
    }

    create(entity): Promise<any> {
        return this.persistentDb.put(entity).then(() => this.load(entity.id));
    }

    load(id: string): Promise<any> {
        return this.persistentDb.get(id).then((entity) => {
            this.memoryDb.upsert(id, {
                id: entity.id,
                title: entity.title
            });
        }, () => {
            // do nothing
        });
    }
}
