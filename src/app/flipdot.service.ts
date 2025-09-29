import { inject, Injectable } from '@angular/core';
import { Concept, CreateConceptDto, CreateMessageDto, Message, MessageFrame, Pixels, PixelSet } from './models';
import { createAnimation } from './animation';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FlipdotService {
  private readonly messageUrl = 'https://api.mobitec.gyzie.com/message';
  private readonly conceptUrl = 'https://api.mobitec.gyzie.com/concept';
  private readonly passwordStorageKey = 'flip-dot-key';
  private http = inject(HttpClient);
  private password: string | undefined;

  readyForRequests$ = new BehaviorSubject<boolean>(false);
  concepts$ = new BehaviorSubject<Concept[]>([]);
  queuedMessages$ = new BehaviorSubject<Message[]>([]);

  constructor() {
    this.loadPasswordFromStorage();
  }

  sendMessage(frames: MessageFrame[], executeAt: string, headers = this.getHeaders()) {
    console.log('execute at', executeAt, frames);
    const body: CreateMessageDto = {
      executeAt,
      frames,
    };
    return this.http.post<CreateMessageDto>(this.messageUrl, body, { headers }).pipe(
      tap(() => {
        this.updateQueuedMessages().catch(err => console.error('Failed to update queued messages after create message', err));
      })
    );
  }

  getQueuedMessages(headers = this.getHeaders()) {
    return this.http.get<Message[]>(this.messageUrl, { headers });
  }

  deleteQueuedMessage(id: number, headers = this.getHeaders()) {
    return this.http.delete<void>(`${this.messageUrl}/${id}`, { headers }).pipe(
      tap(() => {
        this.updateQueuedMessages().catch(err => console.error('Failed to update queued messages after create message', err));
      })
    );
  }

  createConcept(frames: MessageFrame[], name: string, headers = this.getHeaders()) {
    const body: CreateConceptDto = {
      name,
      frames,
    };
    return this.http.post<CreateConceptDto>(this.conceptUrl, body, { headers }).pipe(
      tap(() => {
        this.updateConcepts().catch(err => console.error('Failed to update concepts after create concept', err));
      })
    );
  }

  getConcepts(headers = this.getHeaders()) {
    return this.http.get<Concept[]>(this.conceptUrl, { headers }).pipe(
      map(list => list.reverse()) // Make the first appear at the top of display lists
    );
  }

  deleteConcept(id: number, headers = this.getHeaders()) {
    return this.http.delete<void>(`${this.conceptUrl}/${id}`, { headers }).pipe(
      tap(() => {
        this.updateConcepts().catch(err => console.error('Failed to update concepts after delete concept', err));
      })
    );
  }

  /**
   * Resolves to null if connection succeeds and an error message if it fails
   */
  getPasswordError(password: string): Observable<string | null> {
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

  loadPasswordFromStorage() {
    const sessionPassword = sessionStorage.getItem(this.passwordStorageKey)
    const localPassword = localStorage.getItem(this.passwordStorageKey)
    const password = sessionPassword || localPassword;
    if (!password) {
      return;
    }
    this.login(password);
  }

  login(password: string, { rememberMe }: { rememberMe?: boolean } = {}) {
    this.password = password;
    this.readyForRequests$.next(true);
    this.updateQueuedMessages().catch(err => console.error('Failed to update queued messages', err));
    this.updateConcepts().catch(err => console.error('Failed to update concepts', err));
    sessionStorage.setItem(this.passwordStorageKey, password); // It's not really important to keep this key secret.
    if (rememberMe) {
      localStorage.setItem(this.passwordStorageKey, password);
    }
  }

  logout() {
    this.readyForRequests$.next(false);
    this.queuedMessages$.next([])
    this.concepts$.next([]);
    this.password = undefined;
    sessionStorage.removeItem(this.passwordStorageKey);
    localStorage.removeItem(this.passwordStorageKey);
  }

  private async updateQueuedMessages() {
    this.queuedMessages$.next(await firstValueFrom(this.getQueuedMessages()))
  }

  private async updateConcepts() {
    this.concepts$.next(await firstValueFrom(this.getConcepts()))
  }

  private getHeaders(): Record<string, string> {
    if (!this.password) {
      throw new Error('Missing password');
    }
    return { 'auth-key': this.password };
  }
}
