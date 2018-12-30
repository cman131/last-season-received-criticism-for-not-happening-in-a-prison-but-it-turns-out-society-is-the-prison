import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from './config.service';

@Injectable()
export class ExportService {
  private baseUrl: string;

  constructor(
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.configuration.baseUrl;
  }

  public getTabletopConvertUrl(code: string, playerId: string, addLand = true): string {
    return this.baseUrl + '/game/' + code + '/player/' + playerId + '/cards/tabletop?addLand=' + (addLand ? 'true' : 'false');
  }
}
