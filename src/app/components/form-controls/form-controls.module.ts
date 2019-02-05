import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ContenteditableDirective} from './contenteditable/contenteditable.directive';
import {HeaderControlComponent} from './header-control/header-control.component';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        HeaderControlComponent,
        ContenteditableDirective
    ],
    declarations: [
        HeaderControlComponent,
        ContenteditableDirective
    ]
})
export class FormControlsModule {
}
