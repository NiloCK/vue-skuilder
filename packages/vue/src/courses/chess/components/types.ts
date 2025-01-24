export interface ChessPosition {
  fen: string;
  lastMove?: Move;
  orientation?: 'cg-white' | 'cg-black';
}

export interface Move {
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface BoardConfig {
  movable?: {
    free: boolean;
    color?: 'white' | 'black' | 'both';
    showDests?: boolean;
    dests?: Map<string, string[]>;
  };
  viewOnly?: boolean;
  orientation?: 'white' | 'black';
  coordinates?: boolean;
  animation?: {
    enabled: boolean;
    duration?: number;
  };
}
