import {IWallDefinition2} from 'ngx-wall';

export interface IPageIdentity {
  title: string;
}

export interface IPageBody {
  body: IWallDefinition2;
}

export interface IPageRelation {
  parentPageId: string;
  childrenPageId: string[];
}
