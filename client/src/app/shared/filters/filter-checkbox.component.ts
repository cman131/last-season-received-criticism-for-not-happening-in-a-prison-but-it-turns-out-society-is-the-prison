import { Component, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'filter-checkbox',
  templateUrl: './filter-checkbox.component.html'
})
export class FilterCheckboxComponent {
  @Input()
  public label: string;

  @Input()
  public model = false;
}
