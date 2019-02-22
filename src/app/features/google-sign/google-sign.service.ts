import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase';
import {User} from 'firebase';
import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {GapiService} from '../../infrastructure/gapi';

@Injectable()
export class GoogleSignService {
    user: User;
    user$: Observable<User | null>;
    private isGapiInitialize = false;

    constructor(private gapiService: GapiService,
                private firebaseAuth: AngularFireAuth) {
        this.user$ = this.firebaseAuth.user.pipe(shareReplay());

        this.user$.subscribe((user) => {
            this.user = user;
        });
    }

    signIn(): Promise<any> {
        console.log(`sign in`);

        return this.initGapiClient().then(() => {
            return gapi.auth2.getAuthInstance().isSignedIn.get() ?
                Promise.resolve() :
                this.signInUser();
        });
    }

    signOut(): Promise<any> {
        return this.initGapiClient().then(() => {
            return gapi.auth2.getAuthInstance().isSignedIn.get() ?
                this.signOutUser() :
                Promise.resolve();
        });
    }

    isSignInFirebase(): boolean {
        return Boolean(this.user);
    }

    // expects that Gapi library was already initialized
    isSignInGapiSync(): boolean {
        return gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    isSignInGapi(): Promise<boolean> {
        return this.initGapiClient().then(() => gapi.auth2.getAuthInstance().isSignedIn.get());
    }

    // todo: maybe move to separate service to not expose that method publicly
    initGapiClient(): Promise<any> {
        if (this.isGapiInitialize) {
            return Promise.resolve();
        }

        return this.gapiService.loadGapi()
            .then(() => this.gapiService.loadLibraries('client:auth2'))
            .then(() => {
                return this.gapiService.initGapi({
                    apiKey: environment.google.apiKey,
                    clientId: environment.google.clientId,
                    discoveryDocs: [],
                    scope: 'profile'
                }).then(() => {
                    this.isGapiInitialize = true;
                });
            });
    }

    private signInUser(): Promise<any> {
        const authInstance = gapi.auth2.getAuthInstance();

        return authInstance.signIn().then((user) => {
            const googleIdToken = user.getAuthResponse().id_token;
            const googleAuthProvider = firebase.auth.GoogleAuthProvider
                .credential(googleIdToken);

            return this.firebaseAuth.auth
                .signInAndRetrieveDataWithCredential(googleAuthProvider).then(() => {
                });
        });
    }

    private signOutUser(): Promise<any> {
        return Promise.all([
            this.firebaseAuth.auth.signOut(),
            gapi.auth2.getAuthInstance().signOut()
        ]);
    }
}
