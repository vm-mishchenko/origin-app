import {Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {
    CopyPlugin,
    IWallDefinition2,
    IWallModel,
    IWallUiApi,
    SelectionPlugin,
    UNDO_REDO_API_NAME,
    UndoRedoPlugin,
    WallModelFactory
} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/internal/operators';

/**
 * Dump component responsible for rendering Wall model.
 */
@Component({
    selector: 'app-page-editor',
    templateUrl: './page-editor.component.html',
    styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit, OnChanges, OnDestroy {
    @Input() pageBody: IWallDefinition2;
    @Input() isPageLocked$: Observable<boolean>;
    @Input() scrollableContainer: HTMLElement;

    @Output() wallEvents: EventEmitter<any> = new EventEmitter();
    @Output() pageBodyUpdated: EventEmitter<IWallDefinition2> = new EventEmitter();
    @Output() selectedBrickIds: EventEmitter<string[]> = new EventEmitter();

    wallModel: IWallModel;

    private destroyed$ = new Subject();

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

        // proxy all wall model events to parent
        // todo: replace to destroy$
        this.wallModel.api.core2.events$.pipe(
          takeUntil(this.destroyed$)
        ).subscribe((event) => {
            this.pageBodyUpdated.emit(this.wallModel.api.core2.getPlan());
            this.wallEvents.emit(event);
        });

        // todo: fix set timeout
        setTimeout(() => {
            // todo: replace to destroy$
            (this.wallModel.api.ui as IWallUiApi).mode.navigation.selectedBricks$
              .pipe(
                takeUntil(this.destroyed$)
              )
              .subscribe((selectedBrickIds) => {
                  this.selectedBrickIds.emit(selectedBrickIds);
              });
        });
    }

    ngOnInit() {
        // update wall model "readonly" mode
        this.isPageLocked$.pipe(
          takeUntil(this.destroyed$)
        ).subscribe((isPageLocked) => {
            if (isPageLocked) {
                this.wallModel.api.core2.enableReadOnly();
            } else {
                this.wallModel.api.core2.disableReadOnly();
            }
        });
    }

    // public API
    // focus on first empty text brick
    focusOnPageEditor() {
        let firstEmptyTextBrickId;

        const brickIds = this.wallModel.api.core2.getBrickIds();

        if (brickIds.length) {
            const firstBrickSnapshot = this.wallModel.api.core2.getBrickSnapshot(brickIds[0]);

            if (firstBrickSnapshot.tag === 'text' && !Boolean(firstBrickSnapshot.state.text)) {
                firstEmptyTextBrickId = firstBrickSnapshot.id;
            }
        }

        if (!firstEmptyTextBrickId) {
            firstEmptyTextBrickId = this.wallModel.api.core2.addBrickAtStart('text').id;
        }

        setTimeout(() => {
            (this.wallModel.api.ui as IWallUiApi).mode.edit.focusOnBrickId(firstEmptyTextBrickId);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.pageBody && changes.pageBody.currentValue) {
            this.wallModel.api[UNDO_REDO_API_NAME].clear();
            this.wallModel.api.core2.setPlan(changes.pageBody.currentValue);
        }
    }

    ngOnDestroy() {
        this.destroyed$.next(true);
    }

    private isMenuButton(targetElement: HTMLElement): boolean {
        // todo: 'paged-editor-menu-handler' - hardcoded value, it's used in page-menu-container
        // that is a quick fix for which should be found more robust solution
        return Array.from(targetElement.classList).includes('paged-editor-menu-handler');
    }
}
