import {Injectable} from '@angular/core';

export interface IPageSearchItem {
    pageTitle: string;
    pageId: string;
}

@Injectable()
export class PageSearchService {
    constructor() {
    }

    search(query: string): Promise<IPageSearchItem[]> {
        return Promise.resolve([]);
    }
}
