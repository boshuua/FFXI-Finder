import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WowApiService {

  private backendUrl = 'http://localhost:3000'; // Nodestone backend URL

  constructor(private http: HttpClient) { }

  /**
   * Fetches FFXIV character data by name and world.
   * Resolves the world/character name to a Lodestone ID via Search and fetches details.
   */
  getCharacterData(characterName: string, realm: string): Observable<any> {
    const searchParams = new HttpParams()
      .set('name', characterName)
      .set('server', realm);

    return this.http.get<any>(`${this.backendUrl}/Character/Search`, { params: searchParams }).pipe(
      switchMap(searchResult => {
        if (!searchResult || !searchResult.List || searchResult.List.length === 0) {
          throw new Error('Character not found');
        }
        
        // Find the character that matches the search name exactly (case-insensitive)
        const exactMatch = searchResult.List.find((char: any) => 
          char.Name.toLowerCase() === characterName.toLowerCase()
        );
        const characterId = exactMatch ? exactMatch.ID : searchResult.List[0].ID;

        // Fetch detailed character sheet with ClassJobs (CJ) and Achievements (AC) data
        const detailParams = new HttpParams()
          .append('data', 'CJ')
          .append('data', 'AC');

        return this.http.get<any>(`${this.backendUrl}/Character/${characterId}`, { params: detailParams });
      }),
      catchError(error => {
        console.error('Error in FFXIV character API pipeline:', error);
        throw error;
      })
    );
  }
}