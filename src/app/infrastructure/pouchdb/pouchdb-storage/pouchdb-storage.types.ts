export interface IPouchDbCreateOptions {
    name: string;
}

export interface IPouchdbStorageEntity {
    id: string;
}

export interface IPouchdbRawExistingStorageEntity {
    _id: string;
    _rev: string;
    id: string;
    type: string;
}

export interface IPouchdbRawNewStorageEntity {
    _id: string;
    id: string;
    type: string;
}

export interface IPouchDb {
    get(id: string): Promise<IPouchdbRawExistingStorageEntity>;

    put(entity: IPouchdbRawExistingStorageEntity | IPouchdbRawNewStorageEntity): Promise<any>;

    remove(entity: IPouchdbRawExistingStorageEntity): Promise<any>;

    find(options: any): Promise<{ docs: IPouchdbRawExistingStorageEntity[] }>;
}
