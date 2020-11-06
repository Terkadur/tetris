/*BEST AI:
score: 173700
height coefficient: 3.2411994054403293
holes coefficient: 3.9251021596321447
clears coefficient: -97.84801223369767

git status
git commit -am ""
git push

*/

const board_width = 10;
const board_height = 20;
const scl = 16;
const y_gap = 7;
const x_gap = 10;
const base_color = 16;
let piece;
let letter_dict;
let grid = [];
let t = 0;
let wait_time = 1/2;
let score = 0;
let subscore = 0;
const _fr_ = 60;
let tetris_mode = false;
let ai_active = true;
let _cpt_ = 50; //calculations per tick, makes it go faster by moving more times for each frame drawn
let next_piece = false;
let held_piece = false;
let next_show, hold_show;
let hold_lock = false;
let next_x, next_y, held_x, held_y;

const population = 16;
let indivs;
let subject = 0;
let generation = 0;
const max_gen = 8;
const mutation_strength = 10;

let prev_gen = false;
let save_gen = false;

let height_coef;
let hole_coef;
let clear_coef;

function preload() {
  if (prev_gen) {
    indivs = loadTable("gen_data.csv", "csv", "header");
  }
}

//setup is called once when the code is first executed
function setup() {
  createCanvas(board_width*scl + scl*x_gap, board_height*scl + scl*y_gap);
  frameRate(_fr_);

  if (ai_active) {
    newGen();
  }

  //position for "next" piece
  next_x = scl + width - scl*x_gap/2 + (scl*x_gap/2 - scl*4)/2;
  next_y = scl*y_gap/2;
  next_x = (next_x - scl*x_gap/2)/scl;
  next_y = (height - next_y - scl*y_gap/2)/scl;
  next_y -= 2;

  //position for "held" piece
  held_x = scl + (scl*x_gap/2 - scl*4)/2;
  held_y = scl*y_gap/2;
  held_x = (held_x - scl*x_gap/2)/scl;
  held_y = (height - held_y - scl*y_gap/2)/scl;
  held_y -= 2;

  //dictionary for piece colors and shapes
  letter_dict = {
    "I": [color("cyan"),   [[0, 0], [-1, 0], [1, 0],  [2, 0]]], 
    "O": [color("yellow"), [[0, 0], [1, 0],  [0, 1],  [1, 1]]], 
    "T": [color("purple"), [[0, 0], [-1, 0], [1, 0],  [0, 1]]], 
    "S": [color("lime"),   [[0, 0], [-1, 0], [0, 1],  [1, 1]]], 
    "Z": [color("red"),    [[0, 0], [-1, 1], [0, 1],  [1, 0]]], 
    "J": [color("blue"),   [[0, 0], [-1, 0], [-1, 1], [1, 0]]], 
    "L": [color("orange"), [[0, 0], [-1, 0], [1, 0],  [1, 1]]]
  };
  
  newGame();
}

//draw is called continuously after setup
function draw() {
  for (let c = 0; c < _cpt_; c++) {
    //clear full rows
    let rows_cleared = [];
    for (let j = 0; j < board_height; j++) {
      let full_row = true;
      for (let i = 0; i < board_width; i++) {
        if (String(grid[i][j]) == String(color(base_color))) {
          full_row = false;
          break;
        }
      }
      if (full_row) {
        rows_cleared.push(j);
        score += 100;
        subscore += 1;
      }
    }
    clearRow(rows_cleared);
    
    //scoring
    if (rows_cleared.length >= 4) {
      score += 400;
      if (tetris_mode) {
        score += 400;
      }
      tetris_mode = true;
    } else if (rows_cleared.length > 0) {
      tetris_mode = false;
    }
    
    //ai scans the board
    if (ai_active) {
      //newAI
      artIntel(piece.x, piece.y, piece.letter, held_piece, next_piece, piece.rot, grid);

      //oldAI
      // artIntel(piece.x, piece.y, piece.shape, piece.rot, grid);
    }
    
    if (t % (wait_time*_fr_) == wait_time*_fr_ - 1) {
      //move down piece automatically, if can't, make a new piece
      if (!piece.moveD()) {
        newPiece();
      }
    } else {
      if (!ai_active) {
        //player controlled down movement
        if (keyIsDown(DOWN_ARROW)) {
          piece.moveD();
        }
      } else {
        //ai controlled down movement
        if (target_down) {
          piece.moveD();
        }
      }
    }
    
    if (ai_active) {
      //ai controlled left/right movement
      if (target_left) {
        piece.moveL();
      } else if (target_right) {
        piece.moveR();
      }

      //ai controlled left/right rotation
      if (target_rot_l) {
        piece.turnL();
      } else if (target_rot_r) {
        piece.turnR();
      }

      //ai controlled holding
      if (target_hold) {
        holdPiece();
      }
    }
    
    //detect when new piece collides with an old piece, end the game
    let lose = false;
    for (let j = 0; j < piece.shape.length; j++) {
      if (String(grid[piece.x + piece.shape[j][0]][piece.y + piece.shape[j][1]]) != String(color(base_color))) {
        youLose();
        lose = true;
        break;
      }
    }
    if (lose) {
      break;
    }
    t++;
  }

  background(96);

  //draw the board
  for (let i = 0; i < board_width; i++) {
    for (let j = 0; j < board_height; j++) {
      fill(grid[i][j]);
      rect(scl*i + scl*x_gap/2, height - scl*(j + 1) - scl*y_gap/2, scl, scl);
    }
  }

  //draw the piece
  piece.show();

  //draw hold area
  fill(base_color);
  textSize(scl);
  textAlign(CENTER, BOTTOM)
  text("HOLD", scl*x_gap/4, scl*y_gap/2);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2; j++) {
      rect(scl*i + (scl*x_gap/2 - scl*4)/2, scl*j + scl*y_gap/2, scl, scl);
    }
  }
  if (held_piece != false) {
    held_show.show();
  }

  //draw next area
  fill(base_color);
  textSize(scl);
  textAlign(CENTER, BOTTOM)
  text("NEXT", width - scl*x_gap/4, scl*y_gap/2);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2; j++) {
      rect(scl*i + width - scl*x_gap/2 + (scl*x_gap/2 - scl*4)/2, scl*j + scl*y_gap/2, scl, scl);
    }
  }
  next_show.show();

  //draw score
  fill(base_color);
  textSize(scl);
  textAlign(CENTER, BOTTOM)
  if (ai_active) {
    text("GENERATION: " + generation, width/2, height - scl*y_gap/4);
    text("SUBJECT: " + subject, width/2, height - scl*y_gap/16);
  }
  text("SCORE: " + score, width/2, scl*y_gap/2);
}