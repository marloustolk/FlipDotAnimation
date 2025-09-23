export type PixelSet = (0 | 1)[][]

export type MessageFrame = {
  delayMs: number;
  pixels: PixelSet;
}

export type Message = {
  id: number;
  executeAt: string;
  frames: MessageFrame[];
}

export type Concept = {
  id: number;
  name: string;
  frames: MessageFrame[];
}

export type CreateMessageDto = Omit<Message, 'id'>;
export type CreateConceptDto = Omit<Concept, 'id'>;

export interface Content {
  pixels: Pixels;
  offsetX: number;
  offsetY: number;
}

export class Pixels {
  array: PixelSet;

  constructor(pixels: PixelSet) {
    this.array = pixels;
  }

  get rowCount() {
    return this.array.length;
  }

  get columnCount() {
    return this.array[0].length;
  }

  static fromPixelString(pixelString: string): Pixels {
    const array = pixelString
      .split('\n')
      .map((row) => row.split('').map((pixel) => pixel === '1' ? 1 : 0));
    return new Pixels(array);
  }
}
