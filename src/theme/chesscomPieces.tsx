import type { CustomPieces } from 'react-chessboard/dist/chessboard/types';

const base = 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150';

const pieceUrls: Record<string, string> = {
  wP: `${base}/wp.png`,
  wR: `${base}/wr.png`,
  wN: `${base}/wn.png`,
  wB: `${base}/wb.png`,
  wQ: `${base}/wq.png`,
  wK: `${base}/wk.png`,
  bP: `${base}/bp.png`,
  bR: `${base}/br.png`,
  bN: `${base}/bn.png`,
  bB: `${base}/bb.png`,
  bQ: `${base}/bq.png`,
  bK: `${base}/bk.png`
};

export const chesscomPieces: CustomPieces = Object.fromEntries(
  Object.entries(pieceUrls).map(([piece, url]) => [
    piece,
    ({ squareWidth }) => <img src={url} alt={piece} style={{ width: squareWidth, height: squareWidth }} />
  ])
);
