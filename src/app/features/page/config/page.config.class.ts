import {PAGE_LOCK_CONFIG_ITEM_TYPE, PageLockConfigItem} from './configs/page-lock-config.constant';
import {IPageConfigData} from './page-config-storage.service';
import {IPageConfigItem, IPageConfigItemChange} from './page-config.interface';

/**
 * All available page configs
 */
const PAGE_CONFIG_ITEM_TYPE_MAP = {
    [PAGE_LOCK_CONFIG_ITEM_TYPE]: PageLockConfigItem
};

/**
 * Stores all page configs.
 * Knows how to serialize/de-serialize whole page config
 * and delegate specific page config item change to specific implementation.
 */
export class PageConfig {
    private configs: Map<string, IPageConfigItem> = new Map();

    constructor(private config: IPageConfigData) {
        this.initializeConfigItems();
    }

    update(change: IPageConfigItemChange): Promise<any> {
        return this.configs.get(change.type).update(change);
    }

    asJSON() {
        return {
            id: this.config.id,
            configs: Array.from(this.configs).map(([key, pageConfigItem]) => pageConfigItem).reduce((result, pageConfigItem) => {
                result[pageConfigItem.type] = pageConfigItem.value();
                return result;
            }, {})
        };
    }

    private initializeConfigItems() {
        // initialize all registered page config
        // even if they are not presented in before saved config
        Object.keys(PAGE_CONFIG_ITEM_TYPE_MAP).forEach((pageConfigItemType) => {
            const pageConfigItemValue = this.config.configs[pageConfigItemType];
            const pageConfigItem = new PAGE_CONFIG_ITEM_TYPE_MAP[pageConfigItemType](pageConfigItemValue);

            this.configs.set(pageConfigItemType, pageConfigItem);
        });
    }
}
