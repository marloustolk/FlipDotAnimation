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
import { minMaxPixel, superPixel } from '../fonts';
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

  protected size = model<'small' | 'large'>('large');

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
    this.image() ? Pixels.fromPixelString(images[this.imageValue()]) : this.letterPixels()
  );

  private filterLetters() {
    return Array.from(this.textValue().toLowerCase()).filter((letter) =>
      Object.keys(this.font()).includes(letter)
    );
  }

  private letterPixels() {
    const font = this.font();
    const fontHeight = Pixels.fromPixelString(font['a']).rowCount;

    let content: string[] = new Array(fontHeight).fill('');

    for (let letter of this.filterLetters()) {
      const letterPixels = Pixels.fromPixelString(font[letter]);
      for (let row = 0; row < fontHeight; row++) {
        content[row] += content[row] ? '0' : '';
        content[row] += letterPixels.array[row % (fontHeight + 1)].join('');
      }
    }

    while (this.lineToLong(content)) {
      content = this.split(content, fontHeight);
    }
    if (this.centerX()) {
      const maxWidth = content.reduce((a, b) => a.length < b.length ? b : a).length;
      content = content.map(row => {
        const whitespace = '0'.repeat(Math.floor((maxWidth - row.length) / 2));
        return whitespace + row + whitespace;
      })
    } else {
      content = content.map(row => row + '0'.repeat(this.columns() - row.length));
    }
    return Pixels.fromPixelString(content.join('\n'));
  }

  private lineToLong(content: string[]) {
    return this.lastLine(content).length > this.columns();
  }

  private split(content: string[], fontHeight: number) {
    const currentRow = content.length;
    const nextRow = fontHeight + 1;
    const index = this.indexLastSpace(content);

    content = content.concat(new Array(nextRow).fill(''));
    for (let row = currentRow - fontHeight; row < currentRow; row++) {
      content[row + nextRow] += content[row].slice(index);
      content[row] = content[row].slice(0, index);
    }
    return content;
  }

  private indexLastSpace(content: string[]) {
    const space = Pixels.fromPixelString(this.font()[' '].split('\n').map(row => row + '0').join('\n'));
    const rowsToCheck = content.slice(content.length - space.rowCount);
    for (let column = this.columns() - space.columnCount; column > 0; column--) {
      const stringRow = space.array[0].join('');
      const isSpace = rowsToCheck.every(row => row.slice(column, column + space.columnCount) === stringRow)
      if (isSpace) {
        return column + space.columnCount;
      }
    }
    return this.columns();
  }

  private lastLine(content: string[]) {
    return content[content.length - 1];
  }

  private font() {
    return this.size() === 'large' ? superPixel : minMaxPixel;
  }
}
