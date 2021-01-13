function holdPiece() {
  if (!hold_lock) {
    if (!held_piece) { //switches with next piece if no held piece exists
      held_piece = piece.letter;
      piece = new Tetromino(4, 18, next_piece);
      next_piece = random(["I", "O", "T", "S", "Z", "J", "L"]);
      next_show = new Tetromino(next_x, next_y, next_piece);
      held_show = new Tetromino(held_x, held_y, held_piece);
      t = wait_time*_fr_;
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
  let next_game = true;

  if (ai_active && natural_selection) {
    indivs.setNum(subject, "score", score);

    let print_data = [String(generation) + ":" + String(subject)];
    print_data.push(score);
    print_data.push(height_coef);
    print_data.push(hole_coef);
    print_data.push(clear_coef);
    print_data.push(pillar_coef);
    print_data.push(bump_coef);
    print_data.push(ledge_coef);
    print_data.push(bury_coef);
    print(print_data);

    //breaks at end of generation
    if (subject < current_pop - 1) {
      //goes to next subject
      subject++;
    } else {
      //find best subject
      let best_score = -1;
      let best_subject = -1;
      for (let i = 0; i < current_pop; i++) {
        if (indivs.getNum(i, "score") > best_score) {
          best_score = indivs.getNum(i, "score");
          best_subject = i;
        }
      }

      print("BEST SUBJECT: " + best_subject);
      print("BEST SCORE: " + best_score);

      if (generation < max_gen - 1) {
        generation++;
        newGen();
      } else {
        //last generation
        if (save_gen) {
          saveTable(indivs, 'gen_data.csv');
        }
        next_game = false;
        //DANGER
        generation++;
        newGen();
        //DANGER
        print("--- BEST DATA ---");
        print(best_data);
        noLoop();
      }
    }
  }
  if (next_game) {
    // newGame();
  }

}
  
function newGame() {
  t = 0;
  score = 0;
  subscore = 0;
  hold_lock = false;
  real_path = [];

  //sets up the board
  for (let i = 0; i < board_width; i++) {
    grid[i] = [];
    for (let j = 0; j < board_height + 2; j++) {
      grid[i][j] = color(base_color);
    }
  }

  //creates new piece and next piece
  piece = new Tetromino(4, board_height - 2, random(["I", "O", "T", "S", "Z", "J", "L"]));
  next_piece = random(["I", "O", "T", "S", "Z", "J", "L"]);
  next_show = new Tetromino(next_x, next_y, next_piece);
  held_piece = false;

  //sets new AI coefficients
  if (ai_active && natural_selection) {
    height_coef = indivs.getNum(subject, "height");
    hole_coef = indivs.getNum(subject, "holes");
    clear_coef = indivs.getNum(subject, "clears");
    pillar_coef = indivs.getNum(subject, "pillars");
    bump_coef = indivs.getNum(subject, "bumps");
    ledge_coef = indivs.getNum(subject, "ledges");
    bury_coef = indivs.getNum(subject, "buries");
  }
}