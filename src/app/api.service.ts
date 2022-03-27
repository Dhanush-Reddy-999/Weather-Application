import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';


const API_KEY = environment.API_KEY
const API_URL = environment.API_URL

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private httpClient: HttpClient) {}


  public getCurrentDayData(city:string): Observable<any> {
    let dataURL: string = `${API_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    return this.httpClient.get(dataURL).pipe(
      catchError(this.handleError)
    );
  }


  public get7daysForecast(lat:any,lon:any): Observable<any> {
    let dataURL: string = `${API_URL}/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    return this.httpClient.get(dataURL).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error(`City not found. Please enter the city name correctly`));
  }
}
