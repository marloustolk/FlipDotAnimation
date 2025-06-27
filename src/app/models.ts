export interface FlipDotInfo {
    executeAt: string;
    frames: Frame[];
  }
  
  export interface Frame {
    delayMs: number;
    pixels: number[][];
  }
  
  export interface Content {
    pixels: Pixels;
    offsetX: number;
    offsetY: number;
  }
  
  export class Pixels {
    array: number[][];
  
    constructor(pixelString: string) {
      this.array = pixelString
        .split('\n')
        .map((row) => row.split(',').map((pixel) => Number(pixel)));
    }
  
    get rowCount() {
      return this.array.length;
    }
  
    get columnCount() {
      return this.array[0].length;
    }
  }
  