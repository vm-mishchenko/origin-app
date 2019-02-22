export interface IPersistentStorageOptions {
    pouchDbSavingDebounceTime: number;
}

export interface IPersistedStorageFactoryOptions {
    pouchDbSavingDebounceTime: number;
}

export interface IPersistedStorageCreateOptions {
    name: string;
    pouchDbSavingDebounceTime?: number;
}

export interface IPersistedStorageEntity extends Object {
    id: string;
}
