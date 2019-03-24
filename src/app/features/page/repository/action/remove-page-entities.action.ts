import {PersistentStorage} from '../../../../infrastructure/persistent-storage';
import {IBodyPage, IIdentityPage, IRelationPage} from '../page.types';

export class RemovePageEntitiesAction {
    constructor(
        private pageId: string,
        private pageIdentityStorage: PersistentStorage<IIdentityPage>,
        private pageBodyStorage: PersistentStorage<IBodyPage>,
        private pageRelationStorage: PersistentStorage<IRelationPage>,
    ) {
    }

    execute(): Promise<any> {
        return Promise.all([
            this.pageIdentityStorage.remove(this.pageId),
            this.pageBodyStorage.remove(this.pageId),
            this.pageRelationStorage.remove(this.pageId),
        ]);
    }
}
