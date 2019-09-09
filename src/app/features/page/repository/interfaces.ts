import {IWallDefinition} from 'ngx-wall';

export interface IPageIdentity {
  title: string;
}

export interface IPageBody {
  body: IWallDefinition;
}

export interface IPageRelation {
  parentPageId: string;
  childrenPageId: string[];
}
