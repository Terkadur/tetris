
let target_left, target_right, target_down, target_rot_l, target_rot_r, target_hold;
let real_path = [];

function artIntel(x, y, letter_c, letter_h, letter_n, rot, board) {
  //minimum cost is set arbitrarily high
  let cost_min = 1000000;

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
                } else if (String(board[test_piece.shape[cell][0] + test_piece.x][test_piece.shape[cell][1] + test_piece.y - 1]) != String(color(base_color))) {
                  resting = true;
                }
              }
            }

            //skips options that either aren't viable or aren't resting
            if (!viable || !resting) {
              continue;
            }

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