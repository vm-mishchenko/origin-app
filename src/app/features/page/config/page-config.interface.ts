export interface IPageConfigItem {
    type: string;

    value(): any;

    update(change: IPageConfigItemChange): Promise<any>;
}

/**
 * Represents changes related to some config item.
 * Used by the client which want to initiate property change.
 */
export interface IPageConfigItemChange {
    type: string;
}
