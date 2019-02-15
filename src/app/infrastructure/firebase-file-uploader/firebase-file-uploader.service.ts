import {Injectable} from '@angular/core';

/*
* Receive url, save - save it
* No logic around unsuccessful operations
* */
@Injectable()
export class FirebaseFileUploaderService {
    constructor() {
    }

    upload(): Promise<any> {
        return Promise.resolve();
    }
}
