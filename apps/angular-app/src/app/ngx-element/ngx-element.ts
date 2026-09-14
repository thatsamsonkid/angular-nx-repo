import {
  AfterViewInit,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  ElementRef,
  inject,
  reflectComponentType,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { readDataAttributes } from './attribute-utils';
import { NgxElementService } from './ngx-element.service';

/**
 * Angular 22 adapter for the ngx-element contract
 * (https://github.com/thatsamsonkid/ngx-element).
 *
 * The published `ngx-el` package still targets Angular 12 APIs
 * (`ReflectiveInjector`, `ComponentFactoryResolver`). This host registers
 * one `<ngx-element>` custom element and lazy-loads feature modules from
 * the aggregated library.
 */
@Component({
  selector: 'app-ngx-element',
  template: '<ng-container #container />',
})
export class NgxElementComponent implements AfterViewInit, OnDestroy {
  @Input() selector = '';

  @ViewChild('container', { read: ViewContainerRef, static: true })
  private readonly container!: ViewContainerRef;

  private readonly ngxElementService = inject(NgxElementService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly subscriptions: Subscription[] = [];
  private attributeObserver?: MutationObserver;
  private componentRef?: ComponentRef<unknown>;

  async ngAfterViewInit(): Promise<void> {
    if (!this.selector) {
      return;
    }

    const loaded = await this.ngxElementService.loadComponent(this.selector);
    this.container.clear();
    this.componentRef = this.container.createComponent(loaded.componentClass, {
      injector: loaded.injector,
    });
    this.applyDataAttributes();
    this.proxyOutputs(loaded.componentClass);
    this.observeAttributes();
  }

  ngOnDestroy(): void {
    this.attributeObserver?.disconnect();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.componentRef?.destroy();
  }

  private applyDataAttributes(): void {
    if (!this.componentRef) {
      return;
    }

    for (const attribute of readDataAttributes(this.elementRef.nativeElement)) {
      this.componentRef.setInput(attribute.name, attribute.value);
    }
  }

  private proxyOutputs(componentClass: unknown): void {
    if (!this.componentRef) {
      return;
    }

    const mirror = reflectComponentType(componentClass as never);
    const outputs =
      mirror?.outputs ??
      Object.entries(this.componentRef.instance as object)
        .filter(([, value]) => value instanceof EventEmitter)
        .map(([propName]) => ({ propName, templateName: propName }));

    for (const output of outputs) {
      const emitter = (this.componentRef.instance as Record<string, unknown>)[
        output.propName
      ];
      if (!(emitter instanceof EventEmitter)) {
        continue;
      }

      this.subscriptions.push(
        emitter.subscribe((detail: unknown) => {
          this.elementRef.nativeElement.dispatchEvent(
            new CustomEvent(output.templateName, {
              detail,
              bubbles: true,
            }),
          );
        }),
      );
    }
  }

  private observeAttributes(): void {
    this.attributeObserver = new MutationObserver(() => {
      this.applyDataAttributes();
    });
    this.attributeObserver.observe(this.elementRef.nativeElement, {
      attributes: true,
    });
  }
}
