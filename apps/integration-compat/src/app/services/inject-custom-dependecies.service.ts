import { Inject, Injectable } from '@angular/core';
import { NgxsFirestoreCompat, NgxsFirestoreCompatAdapter } from '@ngxs-labs/firestore-plugin/compat';

@Injectable()
export class CustomDependency {
  works() {
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class InjectCustomDependenciesService extends NgxsFirestoreCompat<any> {
  protected path = 'races';

  constructor(
    @Inject(NgxsFirestoreCompatAdapter) adapter: NgxsFirestoreCompatAdapter,
    public customeDependency: CustomDependency
  ) {
    super(adapter);
  }
}
