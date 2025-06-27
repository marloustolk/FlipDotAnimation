import { images } from './images';
import { Pixels } from './models';

export function createAnimation(columns: number) {
  const array: string[] = [];
  for (let i = 0; i < columns; i = i + 4) {
    array.push(position(images['animation1'], columns, i));
    array.push(position(images['animation2'], columns, i + 1));
    array.push(position(images['animation3'], columns, i + 2));
    array.push(position(images['animation4'], columns, i + 3));
  }
  return array;
}

function position(byteString: string, columns: number, pixels: number) {
  return new Pixels(byteString).array
    .map((row) => move(row, columns, pixels))
    .join('\n');
}

function move(row: number[], columns: number, move: number) {
  const offset = columns - row.length - move;
  if (offset > 0) {
    return addZeros(offset).concat(',').concat(row.join());
  }
  return row.splice(-offset).join();
}

function addZeros(width: number) {
  return new Array(width).fill('0').join();
}
