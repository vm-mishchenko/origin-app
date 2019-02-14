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
    title = 'origin-app';

    initialized = false;

    constructor(private firebaseAuth: AngularFireAuth,
                private db: AngularFireDatabase,
                private zone: NgZone) {
        /*this.firebaseAuth.user.subscribe((user) => {
            const itemRef = this.db.object(`pages/${user.uid}/foo`);

            return itemRef.set('test');
        });*/
    }

    auth() {
        this.initGapi().then(() => {
            const GoogleAuth = gapi.auth2.getAuthInstance();

            if (!GoogleAuth.isSignedIn.get()) {
                GoogleAuth.signIn().then((user) => {
                    console.log(user);

                    const googleIdToken = user.getAuthResponse().id_token;

                    const googleAuthProvider = firebase.auth.GoogleAuthProvider.credential(googleIdToken);

                    this.firebaseAuth.auth.signInAndRetrieveDataWithCredential(googleAuthProvider).then((firebaseUser) => {
                        console.log(`sign in in Firebase`, firebaseUser);
                        // firebaseUser.user.uid
                    });
                });
                // user.getId()
                // user.getAuthResponse().id_token

                /*const options = new gapi.auth2.SigninOptionsBuilder(
                    {'scope': 'email https://www.googleapis.com/auth/drive'});

                // grant additional scope
                user.grant(options).then(
                    function (success) {
                        console.log(JSON.stringify({message: 'success', value: success}));
                    },
                    function (fail) {
                        alert(JSON.stringify({message: 'fail', value: fail}));
                    });*/
            } else {
                console.log(`user is already logged in`);
                console.log(GoogleAuth.currentUser.get());
            }
        });
    }

    signOut() {
        this.initGapi().then(() => {
            this.firebaseAuth.auth.signOut().then(() => {
                console.log(`firebase sign out completed`);

                this.initGapi().then(() => {
                    const authInstance = gapi.auth2.getAuthInstance();

                    if (authInstance.isSignedIn.get()) {
                        authInstance.signOut().then(() => {
                            console.log(`google sign out completed`);
                        });
                    } else {
                        console.log(`google user already sign out`);
                    }
                });
            });
        });
    }

    initGapi(): Promise<any> {
        if (this.initialized) {
            return Promise.resolve();
        } else {
            return this.loadGapi().then(() => this.loadGapiLibs('client:auth2')).then(() => {
                const config = {
                    apiKey: googleSeed.apiKey,
                    // test project
                    clientId: googleSeed.clientId,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    scope: 'https://www.googleapis.com/auth/calendar.readonly'
                };

                return gapi.client.init(config).then(() => {
                    console.log(`gapi is initialized`);
                    this.initialized = true;
                });
            });
        }
    }

    loadGapi(): Promise<any> {
        return new Promise((resolve, reject) => {
            const node: HTMLScriptElement = document.createElement('script');
            node.src = 'https://apis.google.com/js/api.js';
            node.type = 'text/javascript';
            document.getElementsByTagName('head')[0].appendChild(node);

            node.onload = () => {
                resolve();
            };

            node.onerror = () => {
                reject();
            };
        });
    }

    // libraries - "client:auth2"
    loadGapiLibs(libraries: string): Promise<any> {
        return new Promise((resolve, reject) => {
            gapi.load(libraries, {
                callback: resolve,
                onerror: reject
            });
        });
    }

    loadCalendarEvents() {
        gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        }).then(function (response) {
            console.log(response.result.items);
        }).catch((e) => {
            console.log(e);
        });
    }

    firebaseAsync() {
        this.zone.run(() => {
            this.firebaseAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
                .then((response) => {
                    console.log(response);
                })
                .catch((e) => {
                    console.log(e);
                });
        });
    }
}
