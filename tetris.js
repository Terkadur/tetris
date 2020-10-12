/*NOTE TO FUTURE SELF
CONTINUOUSLY CHECK FOR POSSIBLE LOCATIONS WHILE EXCLUDING UNREACHABLE ONES
Add in holding pieces and upcoming pieces
Variables:
height
holes
blocks above holes
no holes if line is cleared
ledges
good for next piece
bumpiness
blocks in rightmost lane (or penalize empty pillars?)
clearing less than 4 lines
*/


/*Holding rules
Can switch any time
Switch causes current piece to be held and held piece starts at the top
Cannot switch back
If no held, go to next piece
*/
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

function setup() {
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

  next_x = scl + width - scl*x_gap/2 + (scl*x_gap/2 - scl*4)/2;
  next_y = scl*y_gap/2;
  next_x = (next_x - scl*x_gap/2)/scl;
  next_y = (height - next_y - scl*y_gap/2)/scl;
  next_y -= 2;


  //scl*i + (scl*x_gap/2 - scl*4)/2
  held_x = scl + (scl*x_gap/2 - scl*4)/2;
  held_y = scl*y_gap/2;
  held_x = (held_x - scl*x_gap/2)/scl;
  held_y = (height - held_y - scl*y_gap/2)/scl;
  held_y -= 2;
  
  piece = new Tetromino(4, board_height - 2, random(["I", "O", "T", "S", "Z", "J", "L"]));
  next_piece = random(["I", "O", "T", "S", "Z", "J", "L"]);
  next_show = new Tetromino(next_x, next_y, next_piece);
}


function draw() {
  for (let c = 0; c < _cpt_; c++) {
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
    if (rows_cleared.length >= 4) {
      score += 400;
      if (tetris_mode) {
        score += 400;
      }
      tetris_mode = true;
    } else if (rows_cleared.length > 0) {
      tetris_mode = false;
    }
    if (rows_cleared.length > 0) {
      // print(score);
    }
    
    if (ai_active) {
      //newAI
      artIntel(piece.x, piece.y, piece.letter, piece.rot, grid);

      //oldAI
      // artIntel(piece.x, piece.y, piece.shape, piece.rot, grid);
    }

    if (t % (wait_time*_fr_) == wait_time*_fr_ - 1) {
      if (!piece.moveD()) {
        newPiece();
      }
    } else {
      if (!ai_active) {
        if (keyIsDown(DOWN_ARROW)) {
          piece.moveD();
        }
      } else {
        if (target_down) {
          piece.moveD();
        }
      }
    }
    
    if (target_left) {
      piece.moveL();
    } else if (target_right) {
      piece.moveR();
    }

    if (target_rot_l) {
      piece.turnL();
    } else if (target_rot_r) {
      piece.turnR();
    }
    
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

  for (let i = 0; i < board_width; i++) {
    for (let j = 0; j < board_height; j++) {
      fill(grid[i][j]);
      rect(scl*i + scl*x_gap/2, height - scl*(j + 1) - scl*y_gap/2, scl, scl);
    }
  }

  piece.show();

  //hold area
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

  //next area
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

  //score
  fill(base_color);
  textSize(scl);
  textAlign(CENTER, BOTTOM)
  text("SCORE: " + score, width/2, scl*y_gap/2);
}

function Tetromino(x, y, letter, rot = 0) {
  this.x = x;
  this.y = y;
  this.letter = letter;
  this.col = letter_dict[this.letter][0];
  this.shape = [];
  this.rot = rot;
  for (let i = 0; i < letter_dict[this.letter][1].length; i++) {
    this.shape[i] = [...letter_dict[this.letter][1][i]];
  }
  
  for (let j = 0; j < this.rot; j++) {
    for (let i = 0; i < this.shape.length; i++) {
      let r = dist(this.shape[i][0], this.shape[i][1], 0, 0);
      let theta = atan2(this.shape[i][1], this.shape[i][0]);
      theta -= PI/2;
      this.shape[i][0] = round(r*cos(theta));
      this.shape[i][1] = round(r*sin(theta));
    }
  }

  this.show = function() {
    fill(this.col);
    for (let j = 0; j < this.shape.length; j++) {
      rect(scl*(this.x + this.shape[j][0]) + scl*x_gap/2, height - scl*(this.y + this.shape[j][1] + 1) - scl*y_gap/2, scl, scl);
    }
  };
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

function keyPressed() {
  if (!ai_active) {
    if (keyCode === LEFT_ARROW) {
      piece.moveL();
    } else if (keyCode === RIGHT_ARROW) {
      piece.moveR();
    }
  }
}

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
  for (let j = 0; j < piece.shape.length; j++) {
    let old_x = piece.x + piece.shape[j][0];
    let old_y = piece.y + piece.shape[j][1];
    grid[old_x][old_y] = piece.col;
  }
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

          //viable move?
          /*
          keep moves in a backwards list
          move up every wait_time*_fr_ frames (needed?)

          if real right of test: try move right
          if doesn't work, try left/rotating

          if real up of test: try move up
          if real left of test: try move left

          */
          
          // let p = 0;
          // while (x_pos != x || y_pos != y || rot_pos != rot) {
          //   //aligns horizontally if possible
          //   if (x_pos < x) {
          //     if (test_piece.moveR()) {
          //       test_path.unshift("ml");
          //     }  
          //   } else if (x_pos > x) {
          //     if (test_piece.moveL()) {
          //       test_path.unshift("mr");
          //     }
          //   } else if (y_pos < y) {
          //     if (test_piece.moveU()) {
          //       test_path.unshift("md");
          //     }
          //   } else if (rot_pos != rot) {
          //     let dif = rot - rot_pos;
          //     if (abs(dif) == 3) {
          //       dif *= -1/3;
          //     }
          //     if (dif > 0) {
          //       if (test_piece.turnR()) {
          //         test_path.unshift("tl");
          //       }
          //     } else {
          //       if (test_piece.turnL()) {
          //         test_path.unshift("tr");
          //       }
          //     }
          //   }
          //   p++;
          //   if (p > 100) {
          //     print(x_pos, y_pos);
          //     break;
          //   }
          // }
          

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
            // let test_path = [];
            // while (test_piece.x != x) {
            //   if (test_piece.x < x) {
            //     if (test_piece.moveR()) {
            //       test_path.unshift("ml");
            //     } else if (test_piece.moveU()) {
            //       test_path.unshift("md");
            //     }
            //   } else if (test_piece.x > x) {
            //     if (test_piece.moveL()) {
            //       test_path.unshift("mr");
            //     } else if (test_piece.moveU()) {
            //       test_path.unshift("md");
            //     }
            //   }
            // }
            // print("x");
            // while (test_piece.y != y) {
            //   if (test_piece.moveU()) {
            //     test_path.unshift("md");
            //   }
            //   print(test_piece.y, y);
            // }
            // print("y");
            // while (test_piece.rot != rot) {
            //   let dif = rot - test_piece.rot;
            //   if (abs(dif) == 3) {
            //     dif *= -1/3;
            //   }
            //   if (dif > 0) {
            //     if (test_piece.turnR()) {
            //       test_path.unshift("tl");
            //     }
            //   } else {
            //     if (test_piece.turnL()) {
            //       test_path.unshift("tr");
            //     }
            //   }
            // }
            // print("rot");
            // //CHEATING
            piece.x = test_piece.x;
            piece.y = test_piece.y;
            piece.shape = test_piece.shape;
            cost_min = cost_test;
            // real_path = test_path;
          }
        }
      }
    }
  }
  // if (real_path.length > 0) {
  //   target_right = false;
  //   target_left = false;
  //   target_down = false;
  //   target_rot_r = false;
  //   target_rot_l = false;
  //   if (real_path[0] == "mr") {
  //     target_right = true;
  //   } else if (real_path[0] == "ml") {
  //     target_left = true;
  //   } else if (real_path[0] == "md") {
  //     target_down = true;
  //   } else if (real_path[0] == "tl") {
  //     target_rot_l = true;
  //   } else if (real_path[0] == "tr") {
  //     target_rot_r = true;
  //   }
  //   real_path.shift();
  // }
}

//oldAI
// function artIntel(x, y, shape, rot, board) {
//   let cost_min = 1000;
//   if (t == 1) {
//     for (let n = 0; n < 4; n++) {
//       let x_min = 0;
//       let x_max = 0;
//       for (let j = 0; j < shape.length; j++) {
//         if (shape[j][0] < x_min) {
//           x_min = shape[j][0];
//         } else if (shape[j][0] > x_max) {
//           x_max = shape[j][0];
//         }
//       }
      
//       for (let i = 0; i < board_width; i++) {
//         if (i + x_min < 0) {
//           continue;
//         } else if (i + x_max >= board_width) {
//           continue;
//         }
        
//         let move_d = true;
//         let y_test = y;
//         while (move_d) {
//           for (let j = 0; j < shape.length; j++) {  
//             if (shape[j][1] + y_test == 0) {
//               move_d = false;
//             } else if (String(board[shape[j][0] + i][shape[j][1] + y_test - 1]) != String(color(base_color))) {
//               move_d = false;
//             }
//           }
//           if (move_d) {
//             y_test -= 1;
//           }
//         }
        
//         let y_max = 0;
//         let empty_test = 0;
//         for (let j = 0; j < shape.length; j++) {
//           //height
//           if (y_test + shape[j][1] > y_max) {
//             y_max = y_test + shape[j][1];
//           }
          
//           //holes
//           let check_below = true;
//           let check_y = 1;
//           while (check_below) {
//             check_below = false;
//             if (shape[j][1] + y_test - check_y >= 0) {
//               check_below = true;
//               if (board[shape[j][0] + i][shape[j][1] + y_test - check_y] == String(color(base_color))) {
//                 let over_cell = false;
//                 for (let k = 0; k < shape.length; k++) {
//                   if (k == j) {
//                     continue;
//                   } else if (shape[j][0] == shape[k][0] && shape[j][1] - 1 == shape[k][1]) {
//                     over_cell = true;
//                     check_below = false;
//                     break;
//                   }
//                 }
//                 if (!over_cell) {
//                   empty_test++;
//                   check_below = true;
//                 }
//               }
//               check_y += 1;
//             }
//           }
//         }
        
//         //clear
//         let clear_test = 0;
//         for (let j = 0; j < board_height; j++) {
//           let full_row = true;
//           for (let k = 0; k < board_width; k++) {
//             if (String(grid[k][j]) == String(color(base_color))) {
//               full_row = false;
//               for (let m = 0; m < shape.length; m++) {
//                 if (k == i + shape[m][0] && j == y_test + shape[m][1]) {
//                   full_row = true;
//                 }
//               }
//               if (!full_row) {
//                 break;
//               }
//             }
//           }
//           if (full_row) {
//             clear_test++;
//           }
//         }
        
//         let cost_test = height_coef*y_max + hole_coef*empty_test + clear_coef*clear_test;
//         if (cost_test < cost_min) {
//           x_target = i;
//           rot_target = n;
//           cost_min = cost_test;
//         }
//       }
      
//       for (let j = 0; j < shape.length; j++) {
//         let r = dist(shape[j][0], shape[j][1], 0, 0);
//         let theta = atan2(shape[j][1], shape[j][0]);
//         theta -= PI/2;
//         shape[j][0] = round(r*cos(theta));
//         shape[j][1] = round(r*sin(theta));
//       }
//     }
//   }

  
//   target_left = false;
//   target_right = false;
//   if (x_target < x) {
//     target_left = true;
//   } else if (x < x_target) {
//     target_right = true;
//   }
  
//   target_rot_l = false;
//   target_rot_r = false;
//   if (rot_target - rot == 3) {
//     target_rot_l = true;
//   } else if (rot_target - rot > 0) {
//     target_rot_r = true;
//   }
  
//   target_down = false;
//   if (!target_left && !target_right && !target_rot_r && !target_rot_l) {
//     target_down = true;
//   }
// }
