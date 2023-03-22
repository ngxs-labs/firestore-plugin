import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { NgxsModule } from '@ngxs/store';
import { CustomDependency, InjectCustomDependenciesService } from './inject-custom-dependecies.service';

describe('InjectCustomDependenciesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), NgxsFirestoreModule.forRoot()],
      providers: [
        { provide: CustomDependency, useClass: CustomDependency },
        { provide: AngularFirestore, useValue: jest.fn() }
      ]
    })
  );

  it('should be created', () => {
    const service: InjectCustomDependenciesService = TestBed.get(InjectCustomDependenciesService);
    expect(service).toBeTruthy();
  });

  it('should inject a custom dep', () => {
    const service: InjectCustomDependenciesService = TestBed.get(InjectCustomDependenciesService);
    expect(service.customeDependency.works()).toBeTruthy();
  });
});
