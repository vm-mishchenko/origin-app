import {Component, ElementRef, ViewChild} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {ValueAccessor} from '../value-accessor';

@Component({
    selector: 'o-editable-text',
    templateUrl: 'editable-text.component.html',
    styleUrls: ['./editable-text.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: EditableTextComponent,
            multi: true
        }
    ]
})
export class EditableTextComponent extends ValueAccessor<string> {
    @ViewChild('inputElement') inputElement: ElementRef;

    updateValue() {
        this.value = this.inputElement.nativeElement.value;
    }
}
