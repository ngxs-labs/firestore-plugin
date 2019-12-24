import { Injectable, Injector } from '@angular/core';

@Injectable()
export class NgxsInjector {
    public static injector: Injector = null;

    constructor(injector: Injector) {
        NgxsInjector.injector = injector;
    }
}
