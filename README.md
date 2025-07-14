InternetGame.md
Local Chess Game – HTML-Based Chess Application

General Information
This project is a chess game developed to run entirely locally. It does not connect to the internet or use any external services. All components are built using HTML, CSS, and JavaScript. The game can be run directly in the browser.

Purpose
To build a basic chess game using HTML, CSS, and JavaScript.
To allow the player to play against an AI (bot).
To make the bot's difficulty adjustable from level 1 to 5.
The entire game will work only in a local environment.


Features
👤 Player vs Bot
🤖 5 adjustable difficulty levels
♟️ Standard 8x8 chess board
🔄 Turn-based move control
🚫 Invalid moves are blocked
💾 All data is stored temporarily in memory only


Technologies Used
HTML5 (Structure)
CSS3 (Styling)
JavaScript (Logic and Bot AI)
Optional: Web Storage (using localStorage to remember difficulty level)


File Structure
project-folder/  
├── index.html  
├── style.css  
├── script.js  
├── chess-engine.js  
├── README.md  
└── InternetGame.md  
index.html Contents
Defines the page structure.

Contains a <div id="chess-board"> for the chess board.
Contains a <select id="difficulty"> for choosing difficulty.
A "Start Game" button will initialize the game.


style.css Contents
The 8x8 chess board will be designed using a grid system.
Black and white squares will be styled with different colors.
Icons or Unicode characters can be used for pieces: ♔ ♕ ♖ ♗ ♘ ♙


script.js Contents
Allows the player to click and move pieces.
Renders the board via JavaScript.
Calls the bot’s move after the player’s move.
Difficulty level is controlled via a botDifficulty variable (1–5).


chess-engine.js Contents
This file will contain the bot’s AI logic. Difficulty is determined roughly like this:
Level 1: Bot makes a random legal move.
Level 2: Bot tries to capture opponent pieces.
Level 3: Bot evaluates a few moves ahead.
Level 4: Simplified version of the Minimax algorithm.
Level 5: Minimax + Alpha-Beta pruning + evaluation function.
If you're short on time, differences in difficulty can also be implemented manually (e.g., using a limited set of "better" moves).


Initial To-Do List
Create the index.html file.
Write the grid system for an 8x8 board in style.css.
Render the board and add the initial setup with JavaScript.
Implement player move handling in script.js.
After each player move, call a function from chess-engine.js for the bot move.
The chosen difficulty level should be taken from the difficulty input and used to guide the bot’s behavior.
Update the board after every move.
Detect game-ending conditions (checkmate, stalemate) and stop the game.


Development Notes
If you wish to use external libraries like chess.js or chessboard.js, make sure to include them locally to avoid internet dependency.
However, this project is intended to be written in pure vanilla JS.
To implement truly challenging bot logic, the Minimax algorithm is recommended.

Extra Features (If Time Allows)
Move history display
Undo feature
Game statistics after it ends
Sound effects

Sample Difficulty Selector (HTML)
<label for="difficulty">Difficulty:</label>
<select id="difficulty">
  <option value="1">1 - Easy</option>
  <option value="2">2 - Simple</option>
  <option value="3">3 - Medium</option>
  <option value="4">4 - Hard</option>
  <option value="5">5 - Very Hard</option>
</select>
