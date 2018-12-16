import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { GameConfig } from '../shared/types/game-config';
import { GameService } from '../shared/game.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-draft',
  templateUrl: './app-draft.component.html',
  styleUrls: ['./app-draft.component.css']
})
export class AppDraftComponent implements OnInit {
  public gameConfig: GameConfig = {};
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) { }

  public ngOnInit() {
    this.route.paramMap.pipe(take(1)).subscribe((params: ParamMap) => {
      this.gameConfig.code = params.get('code');
      this.gameConfig.playerId = params.get('player');
      if (this.gameConfig.code) {
        this.gameService.setConfig(this.gameConfig);
      } else {
        this.router.navigate(['']);
      }
    });
    this.gameService.gameConfig.subscribe(config => this.gameConfig = config);
  }
}