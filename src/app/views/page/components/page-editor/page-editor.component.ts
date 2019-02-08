import {Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {
    BeforeChangeEvent,
    CopyPlugin,
    IWallDefinition,
    IWallModel,
    SelectionPlugin,
    SetPlanEvent,
    TurnBrickIntoEvent,
    UNDO_REDO_API_NAME,
    UndoRedoPlugin,
    WallModelFactory
} from 'ngx-wall';
import {Subscription} from 'rxjs';
import {IPageBrickState} from '../../../../features/page-ui/bricks/page-brick/page-brick.types';

@Component({
    selector: 'app-page-editor',
    templateUrl: './page-editor.component.html',
    styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit, OnChanges, OnDestroy {
    @Input() pageBody: IWallDefinition;
    @Input() pageBrickIdProvider: (pageBrickId: string) => Promise<string>;

    @Output() wallEvents: EventEmitter<any> = new EventEmitter();
    @Output() pageBodyUpdated: EventEmitter<IWallDefinition> = new EventEmitter();

    wallModel: IWallModel;
    private subscriptions: Subscription[] = [];

    constructor(private wallModelFactory: WallModelFactory,
                private injector: Injector) {
        // initialize wall model
        this.wallModel = this.wallModelFactory.create({
            plugins: [
                new CopyPlugin(this.injector),
                new UndoRedoPlugin(this.injector),
                new SelectionPlugin(this.injector)
            ]
        });

        this.subscriptions.push(
            this.wallModel.api.core.subscribe((event) => {
                this.wallEvents.emit(event);

                if (!(event instanceof SetPlanEvent) && !(event instanceof BeforeChangeEvent)) {
                    this.pageBodyUpdated.emit(this.wallModel.api.core.getPlan());
                }

                if (event instanceof TurnBrickIntoEvent && event.newTag === 'page') {
                    this.pageBrickIdProvider(event.brickId).then((newPageIdentityId) => {
                        const newPageBrickState: IPageBrickState = {
                            pageId: newPageIdentityId
                        };

                        this.wallModel.api.core.updateBrickState(event.brickId, newPageBrickState);
                    });
                }
            })
        );
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.pageBody && changes.pageBody.currentValue) {
            this.wallModel.api[UNDO_REDO_API_NAME].clear();
            this.wallModel.api.core.setPlan(changes.pageBody.currentValue);
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }
}
