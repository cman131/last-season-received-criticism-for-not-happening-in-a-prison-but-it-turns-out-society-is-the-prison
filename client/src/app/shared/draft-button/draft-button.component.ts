import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'draft-button',
  templateUrl: './draft-button.component.html',
  styleUrls: ['./draft-button.component.css']
})
export class DraftButtonComponent {
  @Input()
  public disabled = false;

  @Input()
  public isPrimary = false;

  @Input()
  public routerLink: any[];

  @Output()
  public clicked = new EventEmitter();
}
