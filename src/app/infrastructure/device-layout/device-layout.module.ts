import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DeviceLayoutService} from './device-layout.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ]
})
export class DeviceLayoutModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DeviceLayoutModule,
            providers: [DeviceLayoutService]
        };
    }
}
