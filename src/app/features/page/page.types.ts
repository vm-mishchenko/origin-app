import {IWallDefinition} from 'ngx-wall';

export interface IIdentityPage {
    id: string;
    title: string;
}

export interface IBodyPage {
    id: string;
    body: IWallDefinition;
}
