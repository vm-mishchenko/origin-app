import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {ContenteditableDirective} from './contenteditable/contenteditable.directive';
import {EditableTextComponent} from './editable-text/editable-text.component';
import {HeaderControlComponent} from './header-control/header-control.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        // material
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
    ],
    exports: [
        HeaderControlComponent,
        ContenteditableDirective,
        EditableTextComponent
    ],
    declarations: [
        HeaderControlComponent,
        ContenteditableDirective,
        EditableTextComponent
    ]
})
export class FormControlsModule {
}
