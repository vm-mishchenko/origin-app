import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material';

/*
* Dont ask what the heck is that.
* 2 years are passed, situation is still there
* https://github.com/angular/angular/issues/14324
* Just use that dialog instead of default MatDialog.
* */
@Injectable()
export class DialogWrapperService extends MatDialog {
}
