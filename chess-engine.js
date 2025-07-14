(function(global){
// Satranç botu ve hareket kuralları

function isWhite(piece) { return piece && piece === piece.toUpperCase(); }
function isBlack(piece) { return piece && piece === piece.toLowerCase(); }

function cloneBoard(board) {
  return board.map(row => row.slice());
}

global.isKingInCheck = function(board, color) {
  // Şahın yerini bul
  let kingRow = -1, kingCol = -1;
  const kingChar = color === 'w' ? 'K' : 'k';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingChar) {
        kingRow = r;
        kingCol = c;
      }
    }
  }
  if (kingRow === -1) return false; // Şah yoksa
  // Rakip tüm taşların geçerli hamlelerini bul, şahı tehdit ediyor mu bak
  const enemyColor = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      if ((enemyColor === 'w' && isWhite(piece)) || (enemyColor === 'b' && isBlack(piece))) {
        const moves = global.getValidMovesRaw(board, r, c, enemyColor, true); // Sadece hamle üret, şah kontrolü yapma
        if (moves.some(([mr, mc]) => mr === kingRow && mc === kingCol)) {
          return true;
        }
      }
    }
  }
  return false;
};

// Hamle sonrası şah tehditte mi kontrolü için, şah kontrolü hariç hamle üretici
// (hamleleri filtrelemeden, sadece taşın gidebileceği yerleri döndürür)
global.getValidMovesRaw = function(board, row, col, color, skipKingCheck) {
  const piece = board[row][col];
  let moves = [];
  if (!piece) return moves;
  const isWhitePiece = isWhite(piece);
  const isBlackPiece = isBlack(piece);
  if ((color === 'w' && !isWhitePiece) || (color === 'b' && !isBlackPiece)) return moves;
  // Piyon
  if (piece.toLowerCase() === 'p') {
    const dir = isWhitePiece ? -1 : 1;
    const startRow = isWhitePiece ? 6 : 1;
    if (board[row + dir] && !board[row + dir][col]) {
      moves.push([row + dir, col]);
      if (row === startRow && !board[row + 2 * dir][col]) {
        moves.push([row + 2 * dir, col]);
      }
    }
    for (let dc of [-1, 1]) {
      const nr = row + dir, nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = board[nr][nc];
        if (target && ((isWhitePiece && isBlack(target)) || (isBlackPiece && isWhite(target)))) {
          moves.push([nr, nc]);
        }
      }
    }
    return moves;
  }
  // At
  if (piece.toLowerCase() === 'n') {
    const jumps = [
      [2, 1], [1, 2], [-1, 2], [-2, 1],
      [-2, -1], [-1, -2], [1, -2], [2, -1]
    ];
    jumps.forEach(([dr, dc]) => {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = board[nr][nc];
        if (!target || (isWhitePiece && isBlack(target)) || (isBlackPiece && isWhite(target))) {
          moves.push([nr, nc]);
        }
      }
    });
    return moves;
  }
  function slide(directions) {
    directions.forEach(([dr, dc]) => {
      let nr = row + dr, nc = col + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = board[nr][nc];
        if (!target) {
          moves.push([nr, nc]);
        } else {
          if ((isWhitePiece && isBlack(target)) || (isBlackPiece && isWhite(target))) {
            moves.push([nr, nc]);
          }
          break;
        }
        nr += dr;
        nc += dc;
      }
    });
  }
  // Kale
  if (piece.toLowerCase() === 'r') {
    slide([[1,0], [-1,0], [0,1], [0,-1]]);
    return moves;
  }
  // Fil
  if (piece.toLowerCase() === 'b') {
    slide([[1,1], [1,-1], [-1,1], [-1,-1]]);
    return moves;
  }
  // Vezir
  if (piece.toLowerCase() === 'q') {
    slide([[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]]);
    return moves;
  }
  // Şah
  if (piece.toLowerCase() === 'k') {
    [
      [1,0], [-1,0], [0,1], [0,-1],
      [1,1], [1,-1], [-1,1], [-1,-1]
    ].forEach(([dr, dc]) => {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = board[nr][nc];
        if (!target || (isWhitePiece && isBlack(target)) || (isBlackPiece && isWhite(target))) {
          moves.push([nr, nc]);
        }
      }
    });
    return moves;
  }
  return moves;
};

global.getValidMoves = function(board, row, col, color) {
  // Sadece şahı tehditte bırakmayan hamleleri döndür
  const rawMoves = global.getValidMovesRaw(board, row, col, color, false);
  const validMoves = [];
  for (const [nr, nc] of rawMoves) {
    const newBoard = cloneBoard(board);
    newBoard[nr][nc] = newBoard[row][col];
    newBoard[row][col] = '';
    if (!global.isKingInCheck(newBoard, color)) {
      validMoves.push([nr, nc]);
    }
  }
  return validMoves;
};

global.getAllValidMoves = function(board, color) {
  const moves = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      if ((color === 'w' && isWhite(piece)) || (color === 'b' && isBlack(piece))) {
        global.getValidMoves(board, row, col, color).forEach(([nr, nc]) => {
          moves.push({from: [row, col], to: [nr, nc]});
        });
      }
    }
  }
  return moves;
};

global.botMove = function(board, color, difficulty = 1) {
  const moves = global.getAllValidMoves(board, color);
  if (moves.length === 0) return null;
  const move = moves[Math.floor(Math.random() * moves.length)];
  return move;
};

})(window); 