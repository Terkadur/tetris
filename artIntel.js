
let target_left, target_right, target_down, target_rot_l, target_rot_r, target_hold;
let real_path = [];

function artIntel(x, y, letter_c, letter_h, letter_n, rot, board) {
  //minimum cost is set arbitrarily high
  let cost_min = 1000000;

  //create list to look at current piece and the held piece (next piece if no held piece exists)
  let letters = [letter_c];
  if (letter_h == false) {
    letters.push(letter_n);
  } else {
    letters.push(letter_h);
  }

  //find best location path at the start of each round
  if (t == 1) {
    let final_val;
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
            let test_piece = new Tetromino(x_pos, y_pos, letters[l], rot_pos);
            let viable = true;
            let resting = false;

            //check the piece is resting and not colliding
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

            let holes_test = 0;
            let ledge_test = 0;
            let bury_test = 0;
            
            //iterates through cells in the piece
            for (let j = 0; j < test_piece.shape.length; j++) {
              //finds the height of the highest point on the possible piece
              if (y_pos + test_piece.shape[j][1] > y_max) {
                y_max = y_pos + test_piece.shape[j][1];
              }

              let check_y = 1;
              let burried = false;
              let ledge = false;
              //loop ensures not going through the floor
              while (test_piece.shape[j][1] + y_pos - check_y >= 0) {
                //is space below occupied by board
                if (board[test_piece.shape[j][0] + x_pos][test_piece.shape[j][1] + y_pos - check_y] == String(color(base_color))) {
                  //is space below occupied by piece
                  let over_self = false;
                  for (let k = 0; k < test_piece.shape.length; k++) {
                    if (k == j) {
                      continue;
                    } else if (test_piece.shape[j][0] == test_piece.shape[k][0] && test_piece.shape[j][1] - check_y == test_piece.shape[k][1]) {
                      over_self = true;
                      break;
                    }
                  }
                  if (over_self) {
                    break;
                  }

                  //--------------------------------------------------
                  //test if ledge (right)
                  if (test_piece.shape[j][0] + x_pos + 1 <= 9 && check_y == 1) {
                    //is space to right empty
                    let right_empty = false;
                    if (board[test_piece.shape[j][0] + x_pos + 1][test_piece.shape[j][1] + y_pos - check_y] == String(color(base_color))) {
                      let occupied_self = false;
                      for (let k = 0; k < test_piece.shape.length; k++) {
                        if (k == j) {
                          continue;
                        } else if (test_piece.shape[j][0] + 1 == test_piece.shape[k][0] && test_piece.shape[j][1] - check_y == test_piece.shape[k][1]) {
                          occupied_self = true;
                          break;
                        }
                      }
                      if (!occupied_self) {
                        right_empty = true;
                      }
                    }
                    
                    //is space to up right empty
                    if (right_empty) {
                      if (board[test_piece.shape[j][0] + x_pos + 1][test_piece.shape[j][1] + y_pos] == String(color(base_color))) {
                        let occupied_self = false;
                        for (let k = 0; k < test_piece.shape.length; k++) {
                          if (k == j) {
                            continue;
                          } else if (test_piece.shape[j][0] + 1 == test_piece.shape[k][0] && test_piece.shape[j][1] == test_piece.shape[k][1]) {
                            occupied_self = true;
                            break;
                          }
                        }
                        if (!occupied_self) {
                          ledge = true;
                        }
                      }
                    }
                  }

                  //test if ledge (left)
                  if (!ledge && test_piece.shape[j][0] + x_pos - 1 >= 0 && check_y == 1) {
                    //is space to right empty
                    let left_empty = false;
                    if (board[test_piece.shape[j][0] + x_pos - 1][test_piece.shape[j][1] + y_pos - check_y] == String(color(base_color))) {
                      let occupied_self = false;
                      for (let k = 0; k < test_piece.shape.length; k++) {
                        if (k == j) {
                          continue;
                        } else if (test_piece.shape[j][0] - 1 == test_piece.shape[k][0] && test_piece.shape[j][1] - check_y == test_piece.shape[k][1]) {
                          occupied_self = true;
                          break;
                        }
                      }
                      if (!occupied_self) {
                        left_empty = true;
                      }
                    }
                    
                    //is space to up left empty
                    if (left_empty) {
                      if (board[test_piece.shape[j][0] + x_pos - 1][test_piece.shape[j][1] + y_pos] == String(color(base_color))) {
                        let occupied_self = false;
                        for (let k = 0; k < test_piece.shape.length; k++) {
                          if (k == j) {
                            continue;
                          } else if (test_piece.shape[j][0] - 1 == test_piece.shape[k][0] && test_piece.shape[j][1] == test_piece.shape[k][1]) {
                            occupied_self = true;
                            break;
                          }
                        }
                        if (!occupied_self) {
                          ledge = true;
                        }
                      }
                    }
                  }
                  //-----------------------------------------------

                  if (!ledge && !burried) {
                    holes_test++;
                  } else if (ledge && !burried) {
                    ledge_test++;
                  } else if (burried) {
                    bury_test++;
                  }
                } else {
                  burried = true;
                }
                check_y++;
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

            //how many empty pillars
            let x_min = 100;
            let x_max = -100;
            //finds columns to check
            for (let j = 0; j < test_piece.shape.length; j++) {
              if (test_piece.shape[j][0] + x_pos < x_min) {
                x_min = test_piece.shape[j][0] + x_pos;
              }
              if (test_piece.shape[j][0] + x_pos > x_max) {
                x_max = test_piece.shape[j][0] + x_pos;
              }
            }
            x_min -= 1;
            x_max += 1;
            let pillar_test = 0;
            if (x_min >= 0) {
              let pillar_height = 0;
              for (let y_test = 0; y_test <= y_max; y_test++) {
                //if chosen cell is empty
                if (String(board[x_min][y_test]) == String(color(base_color))) {
                  //check adjacent sides
                  //check left side
                  let left_surrounded = true;
                  if (x_min > 0) {
                    //if not surrounded by board
                    if (String(board[x_min - 1][y_test]) == String(color(base_color))) {
                      left_surrounded = false;
                    }
                  }
                  //check right side
                  let right_surrounded = true;
                  if (x_min < 9) {
                    if (String(board[x_min + 1][y_test]) == String(color(base_color))) {
                      right_surrounded = false;
                      for (let j = 0; j < test_piece.shape.length; j++) {
                        if (x_min + 1 == x_pos + test_piece.shape[j][0] && y_test == y_pos + test_piece.shape[j][1]) {
                          right_surrounded = true;
                          break;
                        }
                      }
                    }
                  }
                  if (left_surrounded && right_surrounded) {
                    pillar_height += 1;
                  }
                }
              }
              if (pillar_height > 2) {
                pillar_test += pillar_height;
              }
            }
            if (x_max <= 9) {
              let pillar_height = 0;
              for (let y_test = 0; y_test <= y_max; y_test++) {
                //if chosen cell is empty
                if (String(board[x_max][y_test]) == String(color(base_color))) {
                  //check adjacent sides
                  //check left side
                  let left_surrounded = true;
                  if (x_max > 0) {
                    //if not surrounded by board
                    if (String(board[x_max - 1][y_test]) == String(color(base_color))) {
                      left_surrounded = false;
                      for (let j = 0; j < test_piece.shape.length; j++) {
                        if (x_max - 1 == x_pos + test_piece.shape[j][0] && y_test == y_pos + test_piece.shape[j][1]) {
                          left_surrounded = true;
                          break;
                        }
                      }
                    }
                  }
                  //check right side
                  let right_surrounded = true;
                  if (x_max < 9) {
                    if (String(board[x_max + 1][y_test]) == String(color(base_color))) {
                      right_surrounded = false;
                    }
                  }

                  if (left_surrounded && right_surrounded) {
                    pillar_height += 1;
                  }
                }
              }
              if (pillar_height > 2) {
                pillar_test += pillar_height;
              }
            }


            //calculate bumpiness
            let bumps_test = 0;
            for (let i = 0; i < board_width - 1; i++) {
              let highest_1 = board_height - 1;
              while (String(board[i][highest_1]) == String(color(base_color))) {
                let search_next = true;
                for (let j = 0; j < test_piece.shape.length; j++) {
                  if (test_piece.shape[j][0] + x_pos == i && test_piece.shape[j][1] + y_pos == highest_1) {
                    search_next = false;
                    break;
                  }
                }
                if (search_next) {
                  highest_1 -= 1;
                  if (highest_1 <= -1) {
                    break;
                  }
                } else {
                  break;
                }
              }
              let highest_2 = board_height - 1;
              while (String(board[i + 1][highest_2]) == String(color(base_color))) {
                let search_next = true;
                for (let j = 0; j < test_piece.shape.length; j++) {
                  if (test_piece.shape[j][0] + x_pos == i + 1 && test_piece.shape[j][1] + y_pos == highest_2) {
                    search_next = false;
                    break;
                  }
                }
                if (search_next) {
                  highest_2 -= 1;
                  if (highest_2 <= -1) {
                    break;
                  }
                } else {
                  break;
                }
              }
              bumps_test += abs(highest_1 - highest_2);
            }

            
            //calculate the score of the possible piece
            let cost_test = height_coef*y_max*y_max;
            cost_test += hole_coef*holes_test;
            cost_test += clear_coef*clear_test;
            cost_test += pillar_coef*pillar_test;
            cost_test += bump_coef*bumps_test;
            cost_test += ledge_coef*ledge_test;
            cost_test += bury_coef*bury_test;

            if (cost_test < cost_min) {
              let possible_path = true;
              let test_path = [];
              let iter = 0;

              //loops until the test piece is 1 below the current piece (to allow AI to rotate "I" piece)
              while (test_piece.y < y - 1) {
                iter++;

                //since it is moving from the test location to the current piece, the direction and order
                //of moves is saved backwards in the list of moves

                //if the test piece can move up, move it up and add to the path
                let try_turning = true;
                if (test_piece.moveU()) {
                  test_path.unshift("mD");
                  try_turning = false;
                } else if (test_piece.x < x) { //if the piece can't move up, move the piece horizontally towards the current piece
                  if (test_piece.moveR()) {
                    test_path.unshift("mL");
                    try_turning = false;
                  } 
                } else if (test_piece.x > x) {
                  if (test_piece.moveL()) {
                    test_path.unshift("mR");
                    try_turning = false;
                  }
                }
                if (try_turning) {
                  if (test_piece.turnR()) {
                    test_path.unshift("tL");
                  } else if (test_piece.turnL()) {
                    test_path.unshift("tR");
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
                final_val = [holes_test, ledge_test, bury_test];

                //y_max, holes_test, clear_test, pillar_test, bumps_test, ledge_test, bury_test
              }
            }
          }
        }
      }
    }
    // print(final_val);
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