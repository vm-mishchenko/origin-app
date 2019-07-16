import {Component, ElementRef, EventEmitter, HostListener, Output, ViewChild} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {ValueAccessor} from '../value-accessor';

@Component({
    selector: 'o-header-control',
    template: `
        <h1 attr.placeholder="{{placeholder}}"
            #editor
            contenteditable
            [(ngModel)]="value">
        </h1>
    `,
    styleUrls: ['./header-control.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: HeaderControlComponent,
            multi: true
        }
    ]
})
export class HeaderControlComponent extends ValueAccessor<string> {
    @Output() enter: EventEmitter<any> = new EventEmitter();

    @ViewChild('editor') editor: ElementRef;

    placeholder = 'Untitled';

    @HostListener('keypress', ['$event'])
    onKeyUpHandler(e: KeyboardEvent) {
        const ENTER_KEY = 13;

        // todo: fix keyCode
        if (e.keyCode === ENTER_KEY) {
            e.preventDefault();

            this.editor.nativeElement.blur();

            this.enter.emit();
        }
    }

    // public API
    focus() {
        const textNode = this.editor.nativeElement.childNodes[0];

        if (textNode) {
            // place caret at the end
            const range = document.createRange();
            const sel = window.getSelection();

            range.setStart(textNode, this.editor.nativeElement.textContent.length);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            // or focus on element if it's empty
            this.editor.nativeElement.focus();
        }
    }
}
