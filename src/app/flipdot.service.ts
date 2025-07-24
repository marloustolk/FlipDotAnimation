import { inject, Injectable } from '@angular/core';
import { Frame, FlipDotInfo, Pixels } from './models';
import { createAnimation } from './animation';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FlipdotService {
  private readonly url = 'https://api.mobitec.gyzie.com/message';
  private http = inject(HttpClient);
  private password: string | undefined;

  readyForRequests$ = new BehaviorSubject<boolean>(false);

  /**
   * @deprecated use sendMessage
   */
  sendPixels(pixels: number[][], delayMs: number, executeAt: string) {
    this.sendMessage([{ delayMs, pixels }], executeAt);
  }

  /**
   * @deprecated use sendMessage
   */
  sendAnimation(columns: number, delayMs: number, executeAt: string) {
    this.sendMessage(
      createAnimation(columns).map((image) => {
        return {
          delayMs,
          pixels: new Pixels(image).array,
        };
      }),
      executeAt
    );
  }

  sendMessage(frames: Frame[], executeAt: string, headers = this.getHeaders()) {
    console.log('execute at', executeAt, frames);
    const body: FlipDotInfo = {
      executeAt,
      frames,
    };
    return this.http.post<FlipDotInfo>(this.url, body, { headers }).subscribe();
  }

  getQueuedMessages(headers = this.getHeaders()) {
    return this.http.get(this.url, { headers });
  }

  /**
   * Resolves to null if connection succeeds and an error message if it fails
   */
  getPasswordError(password: string): Observable<string|null> {
    return this.getQueuedMessages({ 'auth-key': password })
    .pipe(
      map(() => null),
      catchError((err) => {
        if (
          typeof err === 'object' &&
          'status' in err &&
          typeof err.status === 'number' &&
          (err.status === 401 || err.status === 403)
        ) {
          return of('Invalid password')
        }
        console.error('Unknown login error:', err);
        return of('Unknown error');
      }),
    );
  }

  setPassword(password: string) {
    this.password = password;
    this.readyForRequests$.next(true);
  }

  private getHeaders(): Record<string, string> {
    if (!this.password) {
      throw new Error('Missing password');
    }
    return { 'auth-key': this.password };
  }
}
