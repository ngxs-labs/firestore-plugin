import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { environment } from '../environments/environment';
import { TestState } from './states/test.state';
import { provideNgxsFirestore } from '@ngxs-labs/firestore-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      NgxsModule.forRoot([TestState], {
        developmentMode: !environment.production
      }),
      NgxsLoggerPluginModule.forRoot({
        disabled: environment.production
      })
    ),
    provideNgxsFirestore({
      developmentMode: true
    })
  ]
};
