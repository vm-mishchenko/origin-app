import {Injectable} from '@angular/core';
import {PageRepositoryService} from '../repository';

export interface IPageSearchItem {
    pageTitle: string;
    pageId: string;
}

@Injectable()
export class PageSearchService {
    constructor(private pageRepositoryService: PageRepositoryService) {
    }

    search(query: string): Promise<IPageSearchItem[]> {
        return this.pageRepositoryService.getAllIdentityPage().then((pageIdentities) => {
            return pageIdentities
                .filter((pageIdentity) => {
                    return pageIdentity.title.toLocaleLowerCase().includes(query.toLocaleLowerCase());
                })
                .map((pageIdentity) => {
                    return {
                        pageId: pageIdentity.id,
                        pageTitle: pageIdentity.title
                    };
                });
        });
    }
}
