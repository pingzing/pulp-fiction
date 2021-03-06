import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AlertsService } from '../../modules/alerts';
import { SearchResults } from '../../models/admin';
import { SearchUser } from '@pulp-fiction/models/users';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private url: string = `/api/search`

  constructor(private http: HttpClient, private alertsService: AlertsService) { }
  
  public getUsersFromQuery(query: string, pageNum: number, pageSize: number) {
    return this.http.get<SearchResults<SearchUser>>(`${this.url}/find-user-results?query=${query}&pageNum=${pageNum}&pageSize=${pageSize}`, {observe: 'response', withCredentials: true})
      .pipe(map(res => {
        console.log(res.body);
        return;
      }), catchError(err => {
        this.alertsService.error(`Something went wrong performing this search on users. Try again in a little bit.`);
        return throwError(err);
      }));
  }
}
