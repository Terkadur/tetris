//BEST AI SCORE: 121100

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
let target_left, target_right, target_down, target_rot_l, target_rot_r, target_hold;
const height_coef = 1; //height is squared
const hole_coef = 10;
const ledge_coef = 5;
const burry_coef = 3;
const clear_coef = -10;
let _cpt_ = 1; //calculations per tick, makes it go faster by moving more times for each frame drawn
let next_piece = false;
let held_piece = false;
let next_show, hold_show;
let hold_lock = false;
let next_x, next_y, held_x, held_y;
let real_path = [];

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
      // t = 0;
      t = wait_time*_fr_;
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
      t = wait_time*_fr_;
      // t = 0;
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
function artIntel(x, y, letter_c, letter_h, letter_n, rot, board) {
  //minimum cost is set arbitrarily high
  let cost_min = 1000;

  //create list in order to look at both the current piece and the held piece (next piece if no held piece exists)
  let letters = [letter_c];
  if (letter_h == false) {
    letters.push(letter_n);
  } else {
    letters.push(letter_h);
  }

  //only find best location and its path at the start of each round
  if (t == 1) {
    //empties the real path
    real_path = [];

    //scans possible locations
    //iterates through x positions
    for (let x_pos = 0; x_pos < board.length; x_pos++) {
      //iterates through y positions
      for (let y_pos = 0; y_pos <= y; y_pos++) {
        //iterates through rotations
        for (let rot_pos = 0; rot_pos < 4; rot_pos++) {
          //iterates between current and held piece
          for (let l = 0; l < letters.length; l++) {
            //creates a test piece at the possible position
            let test_piece = new Tetromino(x_pos, y_pos, letters[l], rot_pos);
            let viable = true;
            let resting = false;

            //iterates through cells in the piece to make sure the possible location actually works
            for (let cell = 0; cell < test_piece.shape.length; cell++) {    
              //horizontal boundaries check
              if (test_piece.shape[cell][0] + x_pos < 0 || test_piece.shape[cell][0] + x_pos > board.length - 1) {
                viable = false;
                break;
              }
              //vertical boundaries check
              if (test_piece.shape[cell][1] + y_pos < 0 || test_piece.shape[cell][1] + y_pos > y + 1) {
                viable = false;
                break;
              }
              //checks if it collides with an occupied cell
              if (String(board[test_piece.shape[cell][0] + x_pos][test_piece.shape[cell][1] + y_pos]) != String(color(base_color))) {
                viable = false;
                break;
              }

              //checks if the piece is resting (if it isn't resting it is not a final position)
              if (!resting) {
                if (test_piece.shape[cell][1] + y_pos == 0) {
                  resting = true;
                } else if (String(board[test_piece.shape[cell][0] + test_piece.x][test_piece.shape[cell][1] + test_piece.y - 1]) == String(color(base_color))) {
                  resting = true;
                }
              }
            }

            //skips options that either aren't viable or aren't resting
            if (!viable || !resting) {
              continue;
            }
            
            /*
            TODO
            check for paths to candidate location (likely using a test Tetromino)
            store path as a sequence of moves



            try to move up
            if cant, try to move in direction of piece
            if cant, try to rotate

            move this to scoring area so only good moves path find
            */
            
            //scores possible locations
            let y_max = 0;
            let empty_test = 0;
            
            //iterates through cells in the piece
            for (let j = 0; j < test_piece.shape.length; j++) {
              //finds the height of the highest point on the possible piece
              if (y_pos + test_piece.shape[j][1] > y_max) {
                y_max = y_pos + test_piece.shape[j][1];
              }
              
              //counts the holes created by the possible piece
              let check_below = true;
              let check_y = 1; //how far down to check for holes
              while (check_below) {
                check_below = false;
                //don't look for holes lower than the floor
                if (test_piece.shape[j][1] + y_pos - check_y >= 0) {
                  //check if the chosen cell is empty
                  if (board[test_piece.shape[j][0] + x_pos][test_piece.shape[j][1] + y_pos - check_y] == String(color(base_color))) {
                    //if the board is empty there, make sure that the chosen cell isn't occupied by the piece itself
                    let over_cell = false;
                    //iterates through cells in the piece
                    for (let k = 0; k < test_piece.shape.length; k++) {
                      //skip if it is the same cell in the piece
                      if (k == j) {
                        continue;
                      } else if (test_piece.shape[j][0] == test_piece.shape[k][0] && test_piece.shape[j][1] - check_y == test_piece.shape[k][1]) {
                        //turns out that the chosen cell is occupied by the piece itself
                        over_cell = true;
                        break;
                      }
                    }
                    if (!over_cell) {
                      //adds to the number of holes created by the piece, keeps checking below
                      empty_test++;
                      check_below = true;
                      check_y += 1;
                    }
                  }
                }
              }
            }
            
            //how many lines does the new piece clear
            let clear_test = 0;
            //iterates through rows
            for (let j = 0; j < board[0].length; j++) {
              let full_row = true;
              //iterates through x positions of that row
              for (let k = 0; k < board.length; k++) {
                //is there an empty cell in that row
                if (String(board[k][j]) == String(color(base_color))) {
                  full_row = false;
                  //check to see if that empty cell is occupied by the current piece
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
                //add to the number of rows cleared
                clear_test++;
              }
            }
            
            //calculate the score of the possible piece
            let cost_test = height_coef*y_max*y_max + hole_coef*empty_test + clear_coef*clear_test;
            if (cost_test < cost_min) {

              //NEW BASIC ALGORITHM TO FIND POSSIBLE PATHS
              //COULD BE IMPROVED UPON (FOR EXAMPLE ROTATING AS LAST MOVE)
              let possible_path = true;
              let test_path = [];
              let iter = 0;

              //iterates until the test piece is 1 below the current piece (to allow AI to rotate "I" piece)
              while (test_piece.y < y - 1) {
                iter++;

                //since it is moving from the test location to the current piece, the direction and order
                //of moves is saved backwards in the list of moves

                //if the test piece can move up, move it up and add to the path
                if (test_piece.moveU()) {
                  test_path.unshift("mD");
                } else if (test_piece.x < x) { //if the piece can't move up, move the piece horizontally towards the current piece
                  if (test_piece.moveR()) {
                    test_path.unshift("mL");
                  } 
                } else if (test_piece.x > x) {
                  if (test_piece.moveL()) {
                    test_path.unshift("mR");
                  }
                }

                //break out of path finding and declare possibility as impossible if the path doesn't exist
                if (iter > 50) {
                  possible_path = false;
                  break;
                }
              }

              //same algorithm to move the piece to the correct horizontal position
              while (test_piece.x != x) {
                iter++;
                if (test_piece.x < x) {
                  if (test_piece.moveR()) {
                    test_path.unshift("mL");
                  }
                } else if (test_piece.x > x) {
                  if (test_piece.moveL()) {
                    test_path.unshift("mR");
                  }
                }

                if (iter > 50) {
                  possible_path = false;
                  break;
                }
              }

              //same algorithm to turn the piece to the correct rotation
              while (test_piece.rot != rot) {
                iter++;
                let rot_dif = rot - test_piece.rot;
                if (abs(rot_dif) == 3) {
                  rot_dif *= -1/3;
                }
                if (rot_dif > 0) {
                  if (test_piece.turnR()) {
                    test_path.unshift("tL");
                  }
                } else if (rot_dif < 0) {
                  if (test_piece.turnL()) {
                    test_path.unshift("tR");
                  }
                }
                
                if (iter > 50) {
                  possible_path = false;
                  break;
                }
              }

              //if the path is possible
              if (possible_path) {
                //adds back in final move down (since previously only went to y-1)
                if (test_piece.moveU()) {
                  test_path.unshift("mD");
                }
                //if the held piece is better, add in a hold step at the begining
                if (l > 0) {
                  test_path.unshift("h");
                }
                //readjust the cost and set the real path to the possible path
                cost_min = cost_test;
                real_path = test_path;
              }
            }
          }
        }
      }
    }
  }

  target_down = false;
  target_right = false;
  target_left = false;
  target_rot_r = false;
  target_rot_l = false;
  target_hold = false;

  //uses the target booleans above and the real path to go through the correct set of moves
  if (real_path.length > 0) {
    if (real_path[0] == "mD") {
      target_down = true;
    } else if (real_path[0] == "mR") {
      target_right = true;
    } else if (real_path[0] == "mL") {
      target_left = true;
    } else if (real_path[0] == "tR") {
      target_rot_r = true;
    } else if (real_path[0] == "tL") {
      target_rot_l = true;
    } else if (real_path[0] == "h") {
      target_hold = true;
    }
    real_path.shift();
  }
}

//git status
//git commit -am ""
//git push