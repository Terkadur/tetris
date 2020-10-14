board_width = 10;
board_height = 20;
scl = 16;
y_gap = 7;
x_gap = 10;
base_color = 16;
var piece;
var letter_dict;
grid = [];
t = 0;
wait_time = 1/2;
score = 0;
_fr_ = 60;
tetris_mode = false;
ai_active = true;
var target_left, target_right, target_down, target_rot_l, target_rot_r;
var x_target, rot_target;
height_coef = 1;
hole_coef = 10;
ledge_coef = 5;
clear_coef = -10;
_cpt_ = 1;
next_piece = false;
held_piece = false;
var next_show, hold_show;
hold_lock = false;
var next_x, next_y, held_x, held_y;
var real_path = [];

//setup is called once when the code is first executed
function setup() {
  //sets up the board
  for (let i = 0; i < board_width; i++) {
    grid[i] = [];
    for (let j = 0; j < board_height + 2; j++) {
      grid[i][j] = color(base_color);
    }
  }

  letter_dict = {
    "I": [color("cyan"),   [[0, 0], [-1, 0], [1, 0],  [2, 0]]], 
    "O": [color("yellow"), [[0, 0], [1, 0],  [0, 1],  [1, 1]]], 
    "T": [color("purple"), [[0, 0], [-1, 0], [1, 0],  [0, 1]]], 
    "S": [color("lime"),   [[0, 0], [-1, 0], [0, 1],  [1, 1]]], 
    "Z": [color("red"),    [[0, 0], [-1, 1], [0, 1],  [1, 0]]], 
    "J": [color("blue"),   [[0, 0], [-1, 0], [-1, 1], [1, 0]]], 
    "L": [color("orange"), [[0, 0], [-1, 0], [1, 0],  [1, 1]]]
  };
  
  createCanvas(board_width*scl + scl*x_gap, board_height*scl + scl*y_gap);
  frameRate(_fr_);

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
  
  //creates new piece and next piece
  piece = new Tetromino(4, board_height - 2, random(["I", "O", "T", "S", "Z", "J", "L"]));
  next_piece = random(["I", "O", "T", "S", "Z", "J", "L"]);
  next_show = new Tetromino(next_x, next_y, next_piece);
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
      artIntel(piece.x, piece.y, piece.letter, piece.rot, grid);

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
  text("SCORE: " + score, width/2, scl*y_gap/2);
}

//class to make pieces
function Tetromino(x, y, letter, rot = 0) {
  this.x = x;
  this.y = y;
  this.letter = letter;
  this.col = letter_dict[this.letter][0];
  this.shape = [];
  this.rot = rot;
  //get the shape of the piece
  for (let i = 0; i < letter_dict[this.letter][1].length; i++) {
    this.shape[i] = [...letter_dict[this.letter][1][i]];
  }
  
  //rotate the piece to its set rotation
  for (let j = 0; j < this.rot; j++) {
    for (let i = 0; i < this.shape.length; i++) {
      let r = dist(this.shape[i][0], this.shape[i][1], 0, 0);
      let theta = atan2(this.shape[i][1], this.shape[i][0]);
      theta -= PI/2;
      this.shape[i][0] = round(r*cos(theta));
      this.shape[i][1] = round(r*sin(theta));
    }
  }

  //draw the piece
  this.show = function() {
    fill(this.col);
    for (let j = 0; j < this.shape.length; j++) {
      rect(scl*(this.x + this.shape[j][0]) + scl*x_gap/2, height - scl*(this.y + this.shape[j][1] + 1) - scl*y_gap/2, scl, scl);
    }
  };
  
  //piece movements
  this.moveD = function() {
    let move_d = true;
    for (let j = 0; j < this.shape.length; j++) {  
      if (this.shape[j][1] + this.y == 0) {
        move_d = false;
      } else if (String(grid[this.shape[j][0] + this.x][this.shape[j][1] + this.y - 1]) != String(color(base_color))) {
        move_d = false;
      }
    }
    if (move_d) {
      this.y -= 1;
      t = 0;
    }
    return move_d;
  };
  this.moveR = function() {
    let move_r = true;
    for (let j = 0; j < this.shape.length; j++) {  
      if (this.shape[j][0] + this.x == 9) {
        move_r = false;
      } else if (String(grid[this.shape[j][0] + this.x + 1][this.shape[j][1] + this.y]) != String(color(base_color))) {
        move_r = false;
      }
    }
    if (move_r) {
      this.x += 1;
    }
    return move_r;
  };
  this.moveL = function() {
    let move_l = true;
    for (let j = 0; j < this.shape.length; j++) {  
      if (this.shape[j][0] + this.x == 0) {
        move_l = false;
      } else if (String(grid[this.shape[j][0] + this.x - 1][this.shape[j][1] + this.y]) != String(color(base_color))) {
        move_l = false;
      }
    }
    if (move_l) {
      this.x -= 1;
    }
    return move_l;
  };
  this.moveU = function() {
    let move_u = true;
    for (let j = 0; j < this.shape.length; j++) {  
      if (this.shape[j][1] + this.y == board_height) {
        move_u = false;
        print("reached top");
      } else if (String(grid[this.shape[j][0] + this.x][this.shape[j][1] + this.y + 1]) != String(color(base_color))) {
        move_u = false;
        print("collided");
      }
    }
    if (move_u) {
      this.y += 1;
    }
    return move_u;
  };
  this.turnR = function() {
    let turn_r = true;
    let save_shape = [];
    for (let i = 0; i < this.shape.length; i++) {
      save_shape[i] = [...this.shape[i]];
    }
    
    for (let i = 0; i < this.shape.length; i++) {
      let r = dist(this.shape[i][0], this.shape[i][1], 0, 0);
      let theta = atan2(this.shape[i][1], this.shape[i][0]);
      theta -= PI/2;
      this.shape[i][0] = round(r*cos(theta));
      this.shape[i][1] = round(r*sin(theta));
      
      if (this.shape[i][0] + this.x < 0 || this.shape[i][0] + this.x > 9) {
        turn_r = false;
        break;
      } else if (this.shape[i][1] + this.y < 0 || this.shape[i][1] + this.y > 19) {
        turn_r = false;
        break;
      } else if (String(grid[this.shape[i][0] + this.x][this.shape[i][1] + this.y]) != String(color(base_color))) {
        turn_r = false;
        break;
      }
    }
    
    if (!turn_r) {
      for (let i = 0; i < save_shape.length; i++) {
        this.shape[i] = [...save_shape[i]];
      }
    } else {
      this.rot = (this.rot + 1) % 4;
    }
    return turn_r;
  };
  this.turnL = function() {
    let turn_l = true;
    let save_shape = [];
    for (let i = 0; i < this.shape.length; i++) {
      save_shape[i] = [...this.shape[i]];
    }
    
    for (let i = 0; i < this.shape.length; i++) {
      let r = dist(this.shape[i][0], this.shape[i][1], 0, 0);
      let theta = atan2(this.shape[i][1], this.shape[i][0]);
      theta += PI/2;
      this.shape[i][0] = round(r*cos(theta));
      this.shape[i][1] = round(r*sin(theta));
      
      if (this.shape[i][0] + this.x < 0 || this.shape[i][0] + this.x > 9) {
        turn_l = false;
        break;
      } else if (this.shape[i][1] + this.y < 0 || this.shape[i][1] + this.y > 19) {
        turn_l = false;
        break;
      } else if (String(grid[this.shape[i][0] + this.x][this.shape[i][1] + this.y]) != String(color(base_color))) {
        turn_l = false;
        break;
      }
    }
    
    if (!turn_l) {
      for (let i = 0; i < save_shape.length; i++) {
        this.shape[i] = [...save_shape[i]];
      }
    } else {
      this.rot = (this.rot + 3) % 4;
    }
    return turn_l;
  };
}

//player controlled left/right movement
function keyPressed() {
  if (!ai_active) {
    if (keyCode === LEFT_ARROW) {
      piece.moveL();
    } else if (keyCode === RIGHT_ARROW) {
      piece.moveR();
    }
  }
}

//player controlled left/right turning and hold piece
function keyTyped() {
  if (!ai_active) {
    if (key === "a") {
      piece.turnL();
    } else if (key === "d") {
      piece.turnR();
    } else if (key === " ") {
      holdPiece();
    }
  }
}

function holdPiece() {
  if (!hold_lock) {
    if (!held_piece) {
      held_piece = piece.letter;
      piece = new Tetromino(4, 18, next_piece);
      next_piece = random(["I", "O", "T", "S", "Z", "J", "L"]);
      next_show = new Tetromino(next_x, next_y, next_piece);
      held_show = new Tetromino(held_x, held_y, held_piece);
      t = 0;
    } else {
      let temp_piece = held_piece;
      held_piece = piece.letter;
      piece = new Tetromino(4, 18, temp_piece);
      held_show = new Tetromino(held_x, held_y, held_piece);
    }
    hold_lock = true;
  }
}

function newPiece() {
  hold_lock = false;
  //"solidify" piece into board
  for (let j = 0; j < piece.shape.length; j++) {
    let old_x = piece.x + piece.shape[j][0];
    let old_y = piece.y + piece.shape[j][1];
    grid[old_x][old_y] = piece.col;
  }
  
  //get next piece
  piece = new Tetromino(4, 18, next_piece);
  next_piece = random(["I", "O", "T", "S", "Z", "J", "L"]);
  next_show = new Tetromino(next_x, next_y, next_piece);
  t = 0;
}

function clearRow(rows) {
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < board_width; i++) {
      grid[i].splice(rows[j] - j, 1);
      grid[i].push(color(base_color));
    }
  }
}

function youLose() {
  print("YOU LOSE!");
  print("SCORE: " + score);
  noLoop();
}

//newAI
function artIntel(x, y, letter, rot, board) {
  let cost_min = 1000;
  if (t == 1) {
    //scans possible locations
    for (let x_pos = 0; x_pos < board.length; x_pos++) {
      for (let y_pos = 0; y_pos <= y; y_pos++) {
        for (let rot_pos = 0; rot_pos < 4; rot_pos++) {
          let test_piece = new Tetromino(x_pos, y_pos, letter, rot_pos);
          let viable = true;
          let resting = false;
          for (let cell = 0; cell < test_piece.shape.length; cell++) {    
            //horizontal limits check
            if (test_piece.shape[cell][0] + x_pos < 0 || test_piece.shape[cell][0] + x_pos > board.length - 1) {
              viable = false;
              break;
            }
            //vertical limits check
            if (test_piece.shape[cell][1] + y_pos < 0 || test_piece.shape[cell][1] + y_pos > y + 1) {
              viable = false;
              break;
            }
            //collides with grid check
            if (String(board[test_piece.shape[cell][0] + x_pos][test_piece.shape[cell][1] + y_pos]) != String(color(base_color))) {
              viable = false;
              break;
            }

            //resting check
            if (!resting) {
              if (test_piece.shape[cell][1] + y_pos == 0) {
                resting = true;
              } else if (String(board[test_piece.shape[cell][0] + test_piece.x][test_piece.shape[cell][1] + test_piece.y - 1]) == String(color(base_color))) {
                resting = true;
              }
            }
          }
          if (!viable || !resting) {
            continue;
          }
          
          /*
          TODO
          check for paths to candidate location (likely using a test Tetromino)
          store path as a sequence of moves
          */
          
          //scores possible locations
          let y_max = 0;
          let empty_test = 0;
          for (let j = 0; j < test_piece.shape.length; j++) {
            //height
            if (y_pos + test_piece.shape[j][1] > y_max) {
              y_max = y_pos + test_piece.shape[j][1];
            }
            
            //holes
            let check_below = true;
            let check_y = 1;
            while (check_below) {
              check_below = false;
              if (test_piece.shape[j][1] + y_pos - check_y >= 0) {
                check_below = true;
                if (board[test_piece.shape[j][0] + x_pos][test_piece.shape[j][1] + y_pos - check_y] == String(color(base_color))) {
                  let over_cell = false;
                  for (let k = 0; k < test_piece.shape.length; k++) {
                    if (k == j) {
                      continue;
                    } else if (test_piece.shape[j][0] == test_piece.shape[k][0] && test_piece.shape[j][1] - 1 == test_piece.shape[k][1]) {
                      over_cell = true;
                      check_below = false;
                      break;
                    }
                  }
                  if (!over_cell) {
                    empty_test++;
                    check_below = true;
                  }
                }
                check_y += 1;
              }
            }
          }
          
          //clear
          let clear_test = 0;
          for (let j = 0; j < board[0].length; j++) {
            let full_row = true;
            for (let k = 0; k < board.length; k++) {
              if (String(board[k][j]) == String(color(base_color))) {
                full_row = false;
                for (let m = 0; m < test_piece.shape.length; m++) {
                  if (k == x_pos + test_piece.shape[m][0] && j == y_pos + test_piece.shape[m][1]) {
                    full_row = true;
                  }
                }
                if (!full_row) {
                  break;
                }
              }
            }
            if (full_row) {
              clear_test++;
            }
          }
          
          let cost_test = height_coef*y_max + hole_coef*empty_test + clear_coef*clear_test;
          if (cost_test < cost_min) {
            //CHEATING teleports piece to best location
            piece.x = test_piece.x;
            piece.y = test_piece.y;
            piece.shape = test_piece.shape;
            cost_min = cost_test;
            /*
            TODO
            save best path
            delete cheating teleport
            */
          }
        }
      }
    }
  }
  /*
  TODO
  go through path moves using target_left, target_right, target_down, target_rot_l, target_rot_r
  */
}
