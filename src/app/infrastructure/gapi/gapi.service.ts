import {Injectable} from '@angular/core';

declare var gapi;
const GAPI_URL = 'https://apis.google.com/js/api.js';

@Injectable()
export class GapiService {
    isGapiLoaded = false;

    constructor() {
    }

    initGapi(config): Promise<any> {
        return gapi.client.init(config);
    }

    loadGapi(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.isGapiLoaded) {
                resolve();
            } else {
                const node: HTMLScriptElement = document.createElement('script');
                node.src = GAPI_URL;
                node.type = 'text/javascript';
                document.getElementsByTagName('head')[0].appendChild(node);

                node.onload = () => {
                    this.isGapiLoaded = true;
                    resolve();
                };

                node.onerror = reject;
            }
        });
    }

    // libraries - "client:auth2"
    loadLibraries(libraries: string): Promise<any> {
        return new Promise((resolve, reject) => {
            gapi.load(libraries, {
                callback: resolve,
                onerror: reject
            });
        });
    }
}
