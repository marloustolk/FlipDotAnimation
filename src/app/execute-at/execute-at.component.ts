import { ChangeDetectionStrategy, Component, computed, effect, input, model, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as cronConverter from "cron-converter";
import { DateTime } from 'luxon';

@Component({
  selector: 'app-execute-at',
  imports: [FormsModule],
  templateUrl: './execute-at.component.html',
  styleUrl: './execute-at.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecuteAtComponent {
  executeAtChange = output<string|null>();

  mode = model<'now'|'date'|'cron'>('now');

  date = signal<string>(this.nowDateString());
  dateError = signal<string|null>(null);

  cron = signal<string>('0 12 * * *');
  cronNext = computed<string|null>(() => {
    if (this.cronError()) {
      return null;
    }

    try {
      const cronArray = cronConverter.stringToArray(this.cron());
      const schedule = cronConverter.getSchedule(cronArray, new Date(), "Europe/Amsterdam")
      return schedule.next().setLocale('nl').toLocaleString(DateTime.DATETIME_MED);
    } catch(err) {
      return null;
    }
  });
  cronError = signal<string|null>(null);

  modeEffect = effect(() => {
    switch(this.mode()) {
      case 'now':
        this.executeAtChange.emit('now');
        break;
      case 'date':
        this.executeAtChange.emit(this.dateToUtcIsoString(this.date()));
        break;
      case 'cron':
        this.executeAtChange.emit(this.cron());
        break;
    }
  })

  dateChange(newValue: string) {
    const newDate = new Date(newValue)
    const now = new Date();

    if (newDate.getTime() < now.getTime()) {
      this.dateError.set('Date cannot be in the past');
      this.executeAtChange.emit(null);
    } else {
      this.dateError.set(null);
      this.date.set(newValue);
      this.executeAtChange.emit(this.dateToUtcIsoString(newValue));
    }
  }

  dateToUtcIsoString(sourceDate: Date|string): string {
    const date = new Date(sourceDate);
    return date.toISOString();
  }

  nowDateString(date?: Date|string): string {
    const newDate = date ? new Date(date) : new Date();
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset())
    return newDate.toISOString().substring(0, 16);
  }

  cronChange(newValue: string) {
    newValue = newValue.trim()
    try {
      cronConverter.stringToArray(newValue); // Validate, throws on bad regex
      this.cronError.set('');
      this.cron.set(newValue);
      this.executeAtChange.emit(newValue);
    } catch(err) {
      console.warn('Invalid cron', err);
      this.cronError.set('Invalid cron format');
      this.executeAtChange.emit(null);
    }
  }

  reset() {
    this.cron.set('0 12 * * *');
    this.date.set(this.nowDateString());
    this.mode.set('now');
  }
}
