import {Injectable} from '@angular/core';
import {AngularFireStorage} from '@angular/fire/storage';

/*
* Receive path and file - save it
* No logic around unsuccessful operations
* */
@Injectable()
export class FirebaseFileUploaderService {
    constructor(private fireStorage: AngularFireStorage) {
    }

    upload(path: string, file: File): Promise<string> {
        const uploadTask = this.fireStorage.upload(path, file);

        // only after file is uploaded we could get downloaded url
        return uploadTask.then(() => {
            // downloadURL could be obtained from firestorage reference
            return this.fireStorage.ref(path).getDownloadURL()
                .toPromise();
        });
    }

    remove(path: string): Promise<any> {
        return this.fireStorage.ref(path)
            .delete()
            .toPromise();
    }
}
