import {Component, Injector, Input, OnInit} from '@angular/core';
import {CopyPlugin, IWallDefinition, IWallModel, SelectionPlugin, UndoRedoPlugin, WallModelFactory} from 'ngx-wall';

@Component({
    selector: 'app-page-editor',
    templateUrl: './page-editor.component.html',
    styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit {
    @Input() pageBody: IWallDefinition;

    wallModel: IWallModel;

    constructor(private wallModelFactory: WallModelFactory,
                private injector: Injector) {
    }

    ngOnInit() {
        // initialize wall model
        this.wallModel = this.wallModelFactory.create({
            plugins: [
                new CopyPlugin(this.injector),
                new UndoRedoPlugin(this.injector),
                new SelectionPlugin(this.injector)
            ]
        });
    }
}
