import { inject, Injectable } from '@angular/core';
import { Frame, FlipDotInfo, Pixels } from './models';
import { createAnimation } from './animation';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FlipdotService {
  private readonly url = 'https://api.mobitec.gyzie.com/message';
  private http = inject(HttpClient);

  sendPixels(pixels: number[][], delayMs: number, executeAt: string) {
    this.send([{ delayMs, pixels }], executeAt);
  }

  sendAnimation(columns: number, delayMs: number, executeAt: string) {
    this.send(
      createAnimation(columns).map((image) => {
        return {
          delayMs,
          pixels: new Pixels(image).array,
        };
      }),
      executeAt
    );
  }

  private send(frames: Frame[], executeAt: string) {
    console.log('execute at', executeAt, frames);
    const body: FlipDotInfo = {
      executeAt,
      frames,
    };
    this.http.post<FlipDotInfo>(this.url, body).subscribe();
  }
}
