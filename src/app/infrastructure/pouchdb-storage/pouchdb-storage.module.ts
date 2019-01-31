import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PouchdbStorageFactory} from './pouchdb-storage-factory.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [PouchdbStorageFactory]
})
export class PouchdbStorageModule { }
