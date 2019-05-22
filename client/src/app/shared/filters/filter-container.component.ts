import { Component, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'filter-container',
  templateUrl: './filter-container.component.html',
  styleUrls: ['./filter-container.component.css']
})
export class FilterContainerComponent {
  @Input()
  public show = false;

  @Input()
  public label: string;
}
