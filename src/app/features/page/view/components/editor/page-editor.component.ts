import {Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {
    BeforeChangeEvent,
    CopyPlugin,
    IWallDefinition,
    IWallModel,
    IWallUiApi,
    SelectedBrickEvent,
    SelectionPlugin,
    SetPlanEvent,
    UNDO_REDO_API_NAME,
    UndoRedoPlugin,
    WallModelFactory
} from 'ngx-wall';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-page-editor',
    templateUrl: './page-editor.component.html',
    styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit, OnChanges, OnDestroy {
    @Input() pageBody: IWallDefinition;
    @Input() scrollableContainer: HTMLElement;

    @Output() wallEvents: EventEmitter<any> = new EventEmitter();
    @Output() pageBodyUpdated: EventEmitter<IWallDefinition> = new EventEmitter();
    @Output() selectedBrickIds: EventEmitter<string[]> = new EventEmitter();

    wallModel: IWallModel;
    private subscriptions: Subscription[] = [];

    constructor(private wallModelFactory: WallModelFactory,
                private injector: Injector) {
        // initialize wall model
        this.wallModel = this.wallModelFactory.create({
            plugins: [
                new CopyPlugin(this.injector),
                new UndoRedoPlugin(this.injector),
                new SelectionPlugin(this.injector, {
                    shouldUnselectBrick: (e) => {
                        return !this.isMenuButton(e.target as HTMLElement);
                    }
                })
            ]
        });

        this.subscriptions.push(
            this.wallModel.api.core.subscribe((event) => {
                if (!(event instanceof SetPlanEvent) && !(event instanceof BeforeChangeEvent)) {
                    this.pageBodyUpdated.emit(this.wallModel.api.core.getPlan());
                }

                this.wallEvents.emit(event);
            })
        );

        // todo: fix that
        setTimeout(() => {
            this.subscriptions.push(
                (this.wallModel.api.ui as IWallUiApi).subscribe((uiEvent) => {
                    if (uiEvent instanceof SelectedBrickEvent) {
                        this.selectedBrickIds.emit(uiEvent.selectedBrickIds);
                    }
                })
            );
        });
    }

    ngOnInit() {

    }

    // public API
    // focus on first empty text brick
    focusOnPageEditor() {
        let firstEmptyTextBrickId;

        const brickIds = this.wallModel.api.core.getBrickIds();

        if (brickIds.length) {
            const firstBrickSnapshot = this.wallModel.api.core.getBrickSnapshot(brickIds[0]);

            if (firstBrickSnapshot.tag === 'text' && !Boolean(firstBrickSnapshot.state.text)) {
                firstEmptyTextBrickId = firstBrickSnapshot.id;
            }
        }

        if (!firstEmptyTextBrickId) {
            firstEmptyTextBrickId = this.wallModel.api.core.addBrickAtStart('text').id;
        }

        setTimeout(() => {
            (this.wallModel.api.ui as IWallUiApi).focusOnBrickId(firstEmptyTextBrickId);
        });
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

    private isMenuButton(targetElement: HTMLElement): boolean {
        // todo: 'paged-editor-menu-handler' - hardcoded value, it's used in page-menu-container
        // that is a quick fix for which should be found more robust solution
        return Array.from(targetElement.classList).includes('paged-editor-menu-handler');
    }
}
