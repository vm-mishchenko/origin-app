import {IWallDefinition2} from 'ngx-wall';

export interface IIdentityPage {
    id: string;
    title: string;
}

export interface IBodyPage {
    id: string;
    body: IWallDefinition2;
}

export interface IRelationPage {
    id: string;
    parentPageId: string;
    childrenPageId: string[];
}
