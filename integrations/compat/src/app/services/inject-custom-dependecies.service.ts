import { Inject, Injectable } from '@angular/core';
import { NgxsFirestore, NgxsFirestoreAdapter } from '@ngxs-labs/firestore-plugin/compat';

@Injectable()
export class CustomDependency {
  works() {
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class InjectCustomDependenciesService extends NgxsFirestore<any> {
  protected path = 'races';

  constructor(@Inject(NgxsFirestoreAdapter) adapter: NgxsFirestoreAdapter, public customeDependency: CustomDependency) {
    super(adapter);
  }
}
