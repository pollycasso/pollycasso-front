export interface Point {
  x: number;
  y: number;
}

export interface Line {
  tool: 'pencil' | 'brush' | 'neon' | 'bucket' | 'eraser';
  color: string;
  size: number;
  points: number[];
}

export interface DrawData {
  lines: Line[];
}
