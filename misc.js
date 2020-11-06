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

  if (ai_active) {
    //records score of subject
    indivs.setNum(subject, "score", score);

    //breaks at end of generation
    if (subject < population - 1) {
      //goes to next subject
      subject++;

      newGame();
    } else {
      //best subject
      let best_score = -1;
      let best_subject = -1;
      for (let i = 0; i < population; i++) {
        if (indivs.getNum(i, "score") > best_score) {
          best_score = indivs.getNum(i, "score");
          best_subject = i;
        }
      }

      print("subject: " + best_subject);
      print("score: " + best_score);
      print("height coefficient: " + indivs.getNum(best_subject, "height"));
      print("holes coefficient: " + indivs.getNum(best_subject, "holes"));
      print("clears coefficient: " + indivs.getNum(best_subject, "clears"));
      if (generation < max_gen - 1) {
        generation++;
        newGen();
      } else {
        if (save_gen) {
          saveTable(indivs, 'gen_data.csv');
        }
        noLoop();
      }
    }
  } else {
    newGame();
  }
}
  
function newGame() {
  t = 0;
  score = 0;
  subscore = 0;
  hold_lock = false;

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

  if (ai_active) {
    height_coef = indivs.getNum(subject, "height");
    hole_coef = indivs.getNum(subject, "holes");
    clear_coef = indivs.getNum(subject, "clears");
  }
}