import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, OnInit, signal } from '@angular/core';
import { Concept, Content, Pixels, PixelSet } from '../models';
import { createAnimation } from '../animation';

@Component({
  selector: 'app-display',
  imports: [NgClass],
  templateUrl: './display.html',
  styleUrl: './display.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Display implements OnInit {
  rows = input<number>(0);
  columns = input<number>(0);
  previewDots = signal<PixelSet>([]);

  flipdots = signal<PixelSet>([]);
  animations = signal(false);

  ngOnInit(): void {
    this.clear();
  }

  clear() {
    this.flipdots.set(
      new Array(this.rows())
        .fill(0)
        .map(() => new Array(this.columns()).fill(0))
    );
    this.clearPreview();
  }

  clearPreview() {
    this.previewDots.set(
      new Array(this.rows())
        .fill(0)
        .map(() => new Array(this.columns()).fill(0))
    );
  }

  add(content: Content, preview = false) {
    if (preview) {
      this.clearPreview();
    }
    const { pixels, offsetX, offsetY } = content;
    const flipdots = this.flipdots();

    const signalToUpdate = preview ? this.previewDots : this.flipdots;
    signalToUpdate.update(signalValue => {
      for (let row = offsetY; row < offsetY + pixels.rowCount; row++) {
        for (let col = offsetX; col < offsetX + pixels.columnCount; col++) {
          if (flipdots[row] && flipdots[row][col] != undefined) {
            const pixel = Number(pixels.array[row - offsetY][col - offsetX]);
            signalValue[row][col] = pixel === 1 ? 1 : 0;
          }
        }
      }
      return [...signalValue];
    });
  }

  load(concept: Concept) {
    // Todo: animations?
    this.clear();
    this.add({
      pixels: new Pixels(concept.frames[0]?.pixels ?? []),
      offsetX: 0,
      offsetY: 0,
    })
  }

  multiToggle(event: MouseEvent, rowIndex: number, columnIndex: number) {
    if (event.buttons === 1) {
      this.flipdots.update(value => {
        value[rowIndex][columnIndex] = 1;
        return [...value];
      });
    } else if (event.buttons === 2) {
      this.flipdots.update(value => {
        value[rowIndex][columnIndex] = 0;
        return [...value];
      });
    }
  }

  toggle(rowIndex: number, columnIndex: number) {
    this.flipdots.update(flipdots => {
      const curruntValue = flipdots[rowIndex][columnIndex];
      flipdots[rowIndex][columnIndex] = curruntValue === 0 ? 1 : 0;
      return [...flipdots];
    })
  }

  async animation() {
    this.animations.set(!this.animations());
    for (const p of createAnimation(this.columns())) {
      if (!this.animations()) break;
      this.clear();

      this.flipdots.update(signalValue => {
        Pixels.fromPixelString(p).array.forEach((row, indexRow) =>
          row.forEach(
            (byte, indexCol) => (signalValue[indexRow][indexCol] = byte)
          )
        );
        return [...signalValue];
      });

      await new Promise((f) => setTimeout(f, 500));
    }
    this.clear();
    this.animations.set(false);
  }

  print() {
    const bytes = this.flipdots()
      .map((row) => row.join(''))
      .join('\n');
    console.log(bytes);
  }
}
