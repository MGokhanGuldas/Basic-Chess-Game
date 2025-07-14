// Satranç taşlarının Unicode karakterleri
const PIECES = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
  '': ''
};

// Başlangıç dizilimi (FEN benzeri)
const START_POSITION = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

let boardState = JSON.parse(JSON.stringify(START_POSITION));
let selected = null;
let currentPlayer = 'w'; // 'w' = beyaz, 'b' = siyah
let botDifficulty = 1;
let gameOver = false;
let capturedByWhite = [];
let capturedByBlack = [];
let lastMove = null;

function showGameOver(message) {
  alert(message);
  gameOver = true;
}

function checkGameOver(color) {
  if (typeof window.getAllValidMoves !== 'function') return;
  const moves = window.getAllValidMoves(boardState, color);
  if (!moves || moves.length === 0) {
    const inCheck = window.isKingInCheck(boardState, color);
    if (inCheck) {
      showGameOver((color === 'w' ? 'Beyaz' : 'Siyah') + ' mat oldu! Oyun bitti.');
    } else {
      showGameOver('Pat! Hiç hamle yok. Oyun berabere.');
    }
    return true;
  }
  return false;
}

const difficultySelect = document.getElementById('difficulty');
difficultySelect.addEventListener('change', (e) => {
  botDifficulty = parseInt(e.target.value);
});

function isWhite(piece) {
  return piece && piece === piece.toUpperCase();
}
function isBlack(piece) {
  return piece && piece === piece.toLowerCase();
}

function clearHighlights() {
  document.querySelectorAll('.square').forEach(sq => {
    sq.classList.remove('selected', 'move-option');
  });
}

// getValidMoves fonksiyonu kaldırıldı, chess-engine.js'deki window.getValidMoves kullanılacak

function updateCapturedPanels() {
  const capturedBlackDiv = document.getElementById('captured-black');
  const capturedWhiteDiv = document.getElementById('captured-white');
  capturedBlackDiv.innerHTML = capturedByWhite.map(p => PIECES[p]).join(' ');
  capturedWhiteDiv.innerHTML = capturedByBlack.map(p => PIECES[p]).join(' ');
}

function createBoard(position, animateMove = null, animateCapture = null) {
  const board = document.getElementById('chess-board');
  board.innerHTML = '';
  // Şah tehditte mi kontrolü
  let inCheckW = false, inCheckB = false;
  if (typeof window.isKingInCheck === 'function') {
    inCheckW = window.isKingInCheck(position, 'w');
    inCheckB = window.isKingInCheck(position, 'b');
  }
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
      square.dataset.row = row;
      square.dataset.col = col;
      // Taş varsa <span class='piece'> ile ekle
      if (position[row][col]) {
        const pieceSpan = document.createElement('span');
        pieceSpan.className = 'piece';
        pieceSpan.textContent = PIECES[position[row][col]];
        // Hareket animasyonu
        if (animateMove && animateMove.to[0] === row && animateMove.to[1] === col) {
          pieceSpan.classList.add('moving');
          const [fromRow, fromCol] = animateMove.from;
          const dx = (fromCol - col) * 100;
          const dy = (fromRow - row) * 100;
          pieceSpan.style.transform = `translate(${dx}px, ${dy}px)`;
          setTimeout(() => {
            pieceSpan.style.transform = '';
          }, 10);
        }
        // Yeme animasyonu
        if (animateCapture && animateCapture.row === row && animateCapture.col === col) {
          pieceSpan.classList.add('capturing');
          pieceSpan.style.setProperty('--capture-x', animateCapture.x + 'px');
          pieceSpan.style.setProperty('--capture-y', animateCapture.y + 'px');
        }
        square.appendChild(pieceSpan);
      }
      // Şah tehditteyse kırmızı göster
      if (position[row][col] === 'K' && inCheckW) square.classList.add('in-check');
      if (position[row][col] === 'k' && inCheckB) square.classList.add('in-check');
      square.addEventListener('click', () => onSquareClick(row, col));
      board.appendChild(square);
    }
  }
  updateCapturedPanels();
}

function animateCaptureAndMove(selRow, selCol, toRow, toCol, captured, cb) {
  // Eğer taş yeniyorsa, yeme animasyonu başlat
  if (captured) {
    // Hedef panelin konumunu bul
    const boardRect = document.getElementById('chess-board').getBoundingClientRect();
    const capturedPanel = currentPlayer === 'w' ? document.getElementById('captured-black') : document.getElementById('captured-white');
    const panelRect = capturedPanel.getBoundingClientRect();
    const x = panelRect.left - boardRect.left + 30;
    const y = panelRect.top - boardRect.top + 30;
    // Önce taşın olduğu karede yeme animasyonu göster
    createBoard(boardState, null, {row: toRow, col: toCol, x, y});
    setTimeout(() => {
      cb();
    }, 500);
  } else {
    // Sadece hareket animasyonu
    createBoard(boardState, {from: [selRow, selCol], to: [toRow, toCol]}, null);
    setTimeout(() => {
      cb();
    }, 350);
  }
}

// chess-engine.js'i import etmeden global olarak ekleyeceğiz
// <script src="chess-engine.js"></script> eklenmeli (index.html'de)

function botPlay() {
  if (gameOver) return;
  if (typeof window.botMove !== 'function') return;
  const move = window.botMove(boardState, 'b', botDifficulty); // şimdilik zorluk 1
  if (!move) {
    showGameOver('Siyah için hamle yok! Oyun bitti.');
    return;
  }
  const {from, to} = move;
  boardState[to[0]][to[1]] = boardState[from[0]][from[1]];
  boardState[from[0]][from[1]] = '';
  currentPlayer = 'w';
  createBoard(boardState);
  checkGameOver('w');
}

// onSquareClick fonksiyonunda, oyuncu hamlesinden sonra botPlay çağrılacak
function onSquareClick(row, col) {
  if (gameOver) return;
  const piece = boardState[row][col];
  if (selected) {
    const [selRow, selCol] = selected;
    const validMoves = window.getValidMoves(boardState, selRow, selCol, currentPlayer);
    const isMove = validMoves.some(([r,c]) => r===row && c===col);
    if (isMove) {
      // Taş yenildiyse kaydet
      const captured = boardState[row][col];
      const moveFn = () => {
        if (captured) {
          if (currentPlayer === 'w') capturedByWhite.push(captured);
          else capturedByBlack.push(captured);
        }
        boardState[row][col] = boardState[selRow][selCol];
        boardState[selRow][selCol] = '';
        selected = null;
        clearHighlights();
        createBoard(boardState);
        currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
        if (!checkGameOver(currentPlayer)) {
          if (currentPlayer === 'b') setTimeout(botPlay, 500);
        }
      };
      animateCaptureAndMove(selRow, selCol, row, col, captured, moveFn);
      return;
    } else {
      selected = null;
      clearHighlights();
      return;
    }
  }
  if ((currentPlayer === 'w' && isWhite(piece)) || (currentPlayer === 'b' && isBlack(piece))) {
    selected = [row, col];
    clearHighlights();
    document.querySelectorAll('.square').forEach(sq => {
      if (parseInt(sq.dataset.row) === row && parseInt(sq.dataset.col) === col) {
        sq.classList.add('selected');
      }
    });
    const validMoves = window.getValidMoves(boardState, row, col, currentPlayer);
    validMoves.forEach(([r, c]) => {
      document.querySelectorAll('.square').forEach(sq => {
        if (parseInt(sq.dataset.row) === r && parseInt(sq.dataset.col) === c) {
          sq.classList.add('move-option');
        }
      });
    });
  }
}

document.getElementById('start-btn').addEventListener('click', () => {
  boardState = JSON.parse(JSON.stringify(START_POSITION));
  selected = null;
  currentPlayer = 'w';
  clearHighlights();
  createBoard(boardState);
  botDifficulty = parseInt(difficultySelect.value);
  gameOver = false;
  capturedByWhite = [];
  capturedByBlack = [];
  updateCapturedPanels();
});

window.onload = () => {
  createBoard(boardState);
}; 