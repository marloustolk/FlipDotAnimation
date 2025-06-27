import { Component, computed, inject, model } from '@angular/core';
import { Display } from './display/display';
import { Form } from './form/form';
import { FlipdotService } from './flipdot.service';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [Display, Form, FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected title = 'Flip-dot Animation';
  protected rowCount = 19;
  protected columnCount = 112;
  protected add: 'text' | 'image' | undefined;
  delay = model<number>(400);
  execute = model<string>('now');

  executeAt = computed(() => {
    let time = this.execute();
    if (time !== 'now') {
      const now = new Date();
      time = new Date(now.getTime() + Number(time) * 60 * 1000).toISOString();
    }
    return time;
  });

  flipDotService = inject(FlipdotService);
}
