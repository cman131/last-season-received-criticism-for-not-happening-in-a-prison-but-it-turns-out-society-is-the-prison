import { Input, EventEmitter, Component, Output } from '@angular/core';
import { Card } from '../../shared/types/card';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'card-display',
  templateUrl: './card-display.component.html',
  styleUrls: ['./card-display.component.css']
})
export class CardDisplayComponent {
  @Input()
  public card: Card;

  @Input()
  public empty = false;

  @Output()
  public selected = new EventEmitter();

  @Output()
  public clicked = new EventEmitter();

  public click(): void {
    if (!this.empty) {
      this.clicked.emit(this.card);
    }
  }
}
