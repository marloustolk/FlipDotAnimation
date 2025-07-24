import { AfterViewInit, ChangeDetectionStrategy, Component, effect, input, OnInit, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageFrame, Pixels } from '../models';
import { Display } from "../display/display";
import { displayRowCount, displayColumnCount } from '../constants';

@Component({
  selector: 'app-preview',
  imports: [FormsModule, Display],
  template: `
    <app-display #display [rows]="rowCount" [columns]="columnCount" />
  `,
  styles: `
    app-display {
      font-size: inherit;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewComponent implements AfterViewInit {
  protected rowCount = displayRowCount;
  protected columnCount = displayColumnCount;

  display = viewChild.required<Display>('display');
  frames = input.required<MessageFrame[]>();

  ngAfterViewInit(): void {
    const pixels = new Pixels(this.frames()[0]?.pixels ?? []);

    this.display().add({
      pixels,
      offsetX: 0,
      offsetY: 0,
    });
  }
}
