import { Component } from '@angular/core';
import { ManagementService } from '../shared/management.service';
import { GameConfig } from '../shared/types/game-config';
import { GameConnection } from '../shared/types/game-connection';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-join',
  templateUrl: './app-join.component.html',
  styleUrls: ['./app-join.component.css']
})
export class AppJoinComponent {
  public game: GameConfig = {
    name: '',
    code: ''
  };
  public errorMessage: string;
  public isWaiting = false;

  constructor(
    private managementService: ManagementService,
    private router: Router
  ) { }

  public submit(): void {
    // submit the thing and validate
    this.isWaiting = true;
    this.managementService.joinGame(this.game)
      .pipe(finalize(() => this.isWaiting = false))
      .subscribe((connection: GameConnection) => {
        if (connection.success) {
          this.router.navigate(['/draft', connection.code, connection.playerId]);
        } else {
          this.errorMessage = connection.errorMessage;
        }
    });
  }
}
