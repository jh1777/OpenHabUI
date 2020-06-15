import { Injectable, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { IConfirmationModal } from './model/confirmation-modal.model';

@Injectable({
  providedIn: 'root'
})

export class DynamicModalService {
  vcr: ViewContainerRef;
  constructor(private cfr: ComponentFactoryResolver) { }

  setViewContainerRef(vcr: ViewContainerRef) {
    this.vcr = vcr;
  }

  openConfirmationModal(component: any, id: string) { // any should be only Components! // TODO: Try use IConfirmationModal as interface not any
    const factory = this.cfr.resolveComponentFactory(component);
    const ref = factory.create(this.vcr.parentInjector);
    // Access component instance and set id property
    var componentInstance = (<IConfirmationModal>ref.instance);
    componentInstance.id = id;
    
    // detection changes
    setTimeout(() => this.vcr.insert(ref.hostView));

    return componentInstance
      .destroy$.asObservable()
      .pipe(
        take(1),
        tap(() => ref.destroy())
      )
      .toPromise();
  }
}