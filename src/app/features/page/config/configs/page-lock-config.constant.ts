import {IPageConfigItem, IPageConfigItemChange} from '../page-config.interface';

export const PAGE_LOCK_CONFIG_ITEM_TYPE = 'isLocked';

export class PageLockConfigChange implements IPageConfigItemChange {
    type = PAGE_LOCK_CONFIG_ITEM_TYPE;

    constructor(public pageId: string, public isLocked: boolean) {
    }
}

export class PageLockConfigItem implements IPageConfigItem {
    type = PAGE_LOCK_CONFIG_ITEM_TYPE;

    constructor(private isLocked: boolean = false) {
    }

    update(change: PageLockConfigChange): Promise<any> {
        this.isLocked = change.isLocked;
        return Promise.resolve();
    }

    value(): any {
        return this.isLocked;
    }
}
