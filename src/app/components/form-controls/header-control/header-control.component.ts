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
    @Output() unfocus: EventEmitter<any> = new EventEmitter();

    @ViewChild('editor') editor: ElementRef;

    placeholder = 'Untitled';

    @HostListener('keydown', ['$event'])
    onKeyDownHandler(e: KeyboardEvent) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();

            this.editor.nativeElement.blur();
            this.unfocus.emit();
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
