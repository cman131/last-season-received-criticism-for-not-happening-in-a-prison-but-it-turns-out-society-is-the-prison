import { Input, Component } from '@angular/core';

@Component({
  selector: 'wait',
  templateUrl: './wait.component.html',
  styleUrls: ['./wait.component.css']
})
export class WaitComponent {
  @Input()
  public isWaiting = false;
}
