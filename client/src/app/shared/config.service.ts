import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  public configuration = {
    baseUrl: 'http://localhost:4000' // <- Local route. Change to prod when set
  };
}
