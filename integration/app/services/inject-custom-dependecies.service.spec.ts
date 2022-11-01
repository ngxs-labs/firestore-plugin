import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { NgxsModule } from '@ngxs/store';
import { CustomDependency, InjectCustomDependenciesService } from './inject-custom-dependecies.service';

describe('InjectCustomDependenciesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), NgxsFirestoreModule.forRoot()],
      providers: [
        { provide: CustomDependency, useClass: CustomDependency },
        { provide: Firestore, useValue: jest.fn() }
      ]
    })
  );

  it('should be created', () => {
    const service: InjectCustomDependenciesService = TestBed.inject(InjectCustomDependenciesService);
    expect(service).toBeTruthy();
  });

  it('should inject a custom dep', () => {
    const service: InjectCustomDependenciesService = TestBed.inject(InjectCustomDependenciesService);
    expect(service.customeDependency.works()).toBeTruthy();
  });
});
