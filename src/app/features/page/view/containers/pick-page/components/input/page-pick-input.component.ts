import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Subject} from 'rxjs';

@Component({
    selector: 'page-pick-input',
    exportAs: 'pagePickInput',
    templateUrl: 'page-pick-input.component.html',
    styleUrls: ['./page-pick-input.component.scss']
})
export class PagePickInputComponent implements OnInit {
    @ViewChild('input') input: ElementRef;
    @Input() placeholder = 'Find your pages';

    searchForm = this.formBuilder.group({
        search: this.formBuilder.control('')
    });

    searchQuery$ = this.searchForm.get('search').valueChanges;
    keyStream$ = new Subject<KeyboardEvent>();

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.input.nativeElement.focus();
    }

    onKeydown(event: KeyboardEvent) {
        this.keyStream$.next(event);
    }
}
