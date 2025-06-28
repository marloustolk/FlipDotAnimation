import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
  Signal,
} from '@angular/core';
import { images } from '../images';
import { superPixel } from '../superPixel';
import { Content, Pixels } from '../models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [FormsModule],
  templateUrl: './form.html',
})
export class Form {
  preview = output<Content>();
  add = output<Content>();
  cancel = output<void>();

  rows = input<number>(0);
  columns = input<number>(0);
  image = input<boolean>(false);

  protected textValue = model<string>('');
  protected imageValue = model<string>('pythios');

  protected offsetX = model<number>(0);
  protected centerX = model<boolean>(true);

  protected offsetY = model<number>(0);
  protected centerY = model<boolean>(true);

  constructor() {
    effect(() => this.preview.emit(this.content()));
  }

  content = computed(() => {
    return {
      pixels: this.pixels(),
      offsetX: this.offsetXSignal(),
      offsetY: this.offsetYSignal(),
    };
  });

  offsetXSignal: Signal<number> = computed(() => {
    return this.centerX()
      ? Math.ceil((112 - this.pixels().columnCount) / 2)
      : this.offsetX();
  });

  offsetYSignal: Signal<number> = computed(() => {
    return this.centerY()
      ? Math.ceil((19 - this.pixels().rowCount) / 2)
      : this.offsetY();
  });

  private pixels = computed(() =>
    this.image() ? new Pixels(images[this.imageValue()]) : this.letterPixels()
  );

  private filterLetters() {
    return Array.from(this.textValue().toLowerCase()).filter((letter) =>
      Object.keys(superPixel).includes(letter)
    );
  }

  private letterPixels() {
    const content: string[] = new Array(9).fill('');
    let currentRow = 0;
    for (let l of this.filterLetters()) {
      const letter = new Pixels(superPixel[l]);
      if (this.endOfLine(currentRow, content, letter)) {
        currentRow = 10;
        content.concat(new Array(10).fill(''));
      }
      for (let row = currentRow; row < currentRow + letter.rowCount; row++) {
        content[row] += content[row] ? ',0,' : '';
        content[row] += letter.array[row % 10].join();
      }
    }
    return new Pixels(content.join('\n'));
  }

  private endOfLine(currentRow: number, content: string[], letter: Pixels) {
    if (currentRow > 0) {
      return false;
    }
    const pixels = new Pixels(content.join('\n'));
    return pixels.columnCount + letter.columnCount > this.columns();
  }
}
