import {Injectable} from '@angular/core';
import {PageRepositoryService2} from '../repository/page-repository.service2';

export interface IPageSearchItem {
    pageTitle: string;
    pageId: string;
}

@Injectable()
export class PageSearchService {
    constructor(private pageRepositoryService2: PageRepositoryService2) {
    }

    search(query: string): Promise<IPageSearchItem[]> {
        return this.pageRepositoryService2.allPageIdentities().then((pageIdentitiesQuerySnapshot) => {
            return pageIdentitiesQuerySnapshot.data()
              .filter((pageIdentitySnapshot) => {
                  return pageIdentitySnapshot.data().title.toLocaleLowerCase().includes(query.toLocaleLowerCase());
                })
                .map((pageIdentity) => {
                    return {
                        pageId: pageIdentity.id,
                        pageTitle: pageIdentity.data().title
                    };
                });
        });
    }
}
