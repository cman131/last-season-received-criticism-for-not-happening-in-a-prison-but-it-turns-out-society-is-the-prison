import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'filter-container',
  templateUrl: './filter-container.component.html',
  styleUrls: ['./filter-container.component.css']
})
export class FilterContainerComponent {
  @Input()
  public size = 3;

  @Input()
  public show = false;

  @Input()
  public label: string;

  @Output()
  public opened = new EventEmitter();

  public toggleShow(): void {
    this.show = !this.show;
    if (this.show) {
      this.opened.emit();
    }
  }
}
