import { NgClass } from '@angular/common';
import { Component, input, model, OnInit } from '@angular/core';
import { Content, Pixels } from '../models';
import { createAnimation } from '../animation';

@Component({
  selector: 'app-display',
  imports: [NgClass],
  templateUrl: './display.html',
  styleUrl: './display.scss',
})
export class Display implements OnInit {
  rows = input<number>(0);
  columns = input<number>(0);
  previewDots: number[][] = [];

  flipdots: number[][] = [];
  animations = false;

  ngOnInit(): void {
    this.clear();
  }

  clear() {
    this.flipdots = new Array(this.rows())
      .fill(0)
      .map(() => new Array(this.columns()).fill(0));
    this.clearPreview();
  }

  clearPreview() {
    this.previewDots = new Array(this.rows())
      .fill(0)
      .map(() => new Array(this.columns()).fill(0));
  }

  add(content: Content, preview = false) {
    if (preview) {
      this.clearPreview();
    }
    const { pixels, offsetX, offsetY } = content;
    for (let row = offsetY; row < offsetY + pixels.rowCount; row++) {
      for (let col = offsetX; col < offsetX + pixels.columnCount; col++) {
        if (this.flipdots[row] && this.flipdots[row][col] != undefined) {
          const pixel = Number(pixels.array[row - offsetY][col - offsetX]);
          if (preview) {
            this.previewDots[row][col] = pixel;
          } else {
            this.flipdots[row][col] = pixel;
          }
        }
      }
    }
  }

  multiToggle(event: MouseEvent, rowIndex: number, columnIndex: number) {
    if (event.buttons === 1) {
      this.flipdots[rowIndex][columnIndex] = 1;
    } else if (event.buttons === 2) {
      this.flipdots[rowIndex][columnIndex] = 0;
    }
  }

  toggle(rowIndex: number, columnIndex: number) {
    const curruntValue = this.flipdots[rowIndex][columnIndex];
    this.flipdots[rowIndex][columnIndex] = curruntValue === 0 ? 1 : 0;
  }

  async animation() {
    this.animations = !this.animations;
    for (const p of createAnimation(this.columns())) {
      if (!this.animations) break;
      this.clear();
      new Pixels(p).array.forEach((row, indexRow) =>
        row.forEach(
          (byte, indexCol) => (this.flipdots[indexRow][indexCol] = Number(byte))
        )
      );
      await new Promise((f) => setTimeout(f, 500));
    }
    this.clear();
    this.animations = false;
  }

  print() {
    const bytes = this.flipdots
      .map((row) => row.join(''))
      .join('\n');
    console.log(bytes);
  }
}
