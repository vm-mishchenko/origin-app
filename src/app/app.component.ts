import {Component, NgZone} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireDatabase} from '@angular/fire/database';
import * as firebase from 'firebase';
import {environment, googleSeed} from '../environments/environment';

declare var gapi;

// to be able sign out from app
// auth from gapi to firebase
// check that security rule has right id in firebase
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
}
