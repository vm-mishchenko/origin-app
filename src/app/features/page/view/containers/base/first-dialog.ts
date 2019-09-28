import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {startWith, switchMap} from 'rxjs/operators';

@Component({
    selector: 'first-dialog',
    templateUrl: './first-dialog.html',
    styles: [`
        ::ng-deep .active {
            background-color: #ececec;
        }
    `],
})
export class FirstDialog {
}
