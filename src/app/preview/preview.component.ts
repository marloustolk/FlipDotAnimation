import { AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, input, OnInit, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageFrame, Pixels } from '../models';
import { Display } from "../display/display";
import { displayRowCount, displayColumnCount } from '../constants';

@Component({
  selector: 'app-preview',
  imports: [FormsModule],
  template: `
    <canvas #canvas [height]="rowCount" [width]="columnCount"></canvas>
  `,
  styles: `
    :host {
      display: block;
    }

    canvas {
      width: 100%;
      image-rendering: pixelated;
      border: solid 5px black;
      box-sizing: border-box;
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewComponent implements AfterViewInit {
  protected rowCount = displayRowCount;
  protected columnCount = displayColumnCount;

  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  frames = input.required<MessageFrame[]>();

  constructor() {
    effect(() => this.drawPreview());
  }

  ngAfterViewInit(): void {
    this.drawPreview();
  }

  drawPreview() {
    const ctx = this.canvas().nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.columnCount, this.rowCount);

    ctx.fillStyle = 'yellow';
    this.frames().at(0)?.pixels.forEach((row, rowIndex) => {
      row.forEach((pixel, columnIndex) => {
        if (pixel !== 1) {
          return;
        }
        ctx.fillRect(columnIndex, rowIndex, 1, 1);
      })
    }); 
  }
}
