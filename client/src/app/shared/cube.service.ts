import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { Cube } from './types/cube';

@Injectable()
export class CubeService {
  private baseUrl: string;

  constructor(
    private config: ConfigService,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.configuration.baseUrl;
  }

  public getAllCubes(): Observable<Cube[]> {
    return this.http.get(this.baseUrl + '/cubes')
      .pipe(take(1), map((response: any) => response.data as Cube[]));
  }

  public save(cube: Cube): Observable<string> {
    if (cube.cubeId) {
      return this.http.put(this.baseUrl + '/cubes/' + cube.cubeId, cube)
        .pipe(take(1), map((response: any) => response.data.cubeId));
    }
    return this.http.post(this.baseUrl + '/cubes', cube)
      .pipe(take(1), map((response: any) => response.data.cubeId));
  }
}
