//best score: 36849900
//best observed coefficients
let height_coef = 0.43570807022242075;
let hole_coef = 82.05378849471467;
let clear_coef = -58.0380722700375;
let pillar_coef = 43.21766139788567;
let bump_coef = 12.927637033962396;
let ledge_coef = 95.97913157897403;
let bury_coef = -0.5795635795632053;

/*how to update files with git
git status
git commit -am ""
git push
*/

const board_width = 10;
const board_height = 20;
const scl = 20;
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
let _cpt_ = 1; //calculations per tick
let next_piece = false;
let held_piece = false;
let next_show, hold_show;
let hold_lock = false;
let next_x, next_y, held_x, held_y;

let current_pop = 128;
let next_pop = 128;
let indivs;
let subject = 0;
let generation = 0;
const max_gen = 1000;
let mutation_strength = 5;

let ai_active = false;
let prev_gen = false;
let save_gen = false;
let show_screen = true;
let natural_selection = false;

let best_data = [0, -1];
let buttons = [];
let sloiders = [];



function preload() {
  if (prev_gen) { //loads previous generation data
    // indivs = loadTable("gen_data.csv", "csv", "header");

    indivs = new p5.Table();

    indivs.addColumn("score");
    indivs.addColumn("height");
    indivs.addColumn("holes");
    indivs.addColumn("clears");
    indivs.addColumn("pillars");
    indivs.addColumn("bumps");
    indivs.addColumn("ledges");
    indivs.addColumn("buries");

    for (let i = 0; i < current_pop; i++) {
      let newRow = indivs.addRow();

      //creates random coefficients for each subject
      newRow.setNum("score", 100);
      newRow.setNum("height", height_coef);
      newRow.setNum("holes", hole_coef);
      newRow.setNum("clears", clear_coef);
      newRow.setNum("pillars", pillar_coef);
      newRow.setNum("bumps", bump_coef);
      newRow.setNum("ledges", ledge_coef);
      newRow.setNum("buries", bury_coef);
    }
  }
}

//setup is called once when the code is first executed
function setup() {
  if (show_screen) {
    createCanvas(board_width*scl + scl*x_gap + 128, board_height*scl + scl*y_gap);
  }
  frameRate(_fr_);

  if (ai_active && natural_selection) {
    newGen();
  }

  //position for "next" piece
  next_x = scl + (board_width*scl + scl*x_gap) - scl*x_gap/2 + (scl*x_gap/2 - scl*4)/2;
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

  buttons[0] = new Button(width - 112, y_gap*scl/2 + 64, 96, 32, "AI OFF", "AI ON");
  buttons[1] = new Button(width - 112, y_gap*scl/2, 96, 32, "NEW GAME", "NEW GAME");

  sloiders[0] = new Sloider(width - 112, y_gap*scl/2 + 152, 96, 1);
  
  newGame();
}

//draw is called continuously after setup
function draw() {
  for (let c = 0; c < _cpt_; c++) {
    //find and clear full rows
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
      artIntel(piece.x, piece.y, piece.letter, held_piece, next_piece, piece.rot, grid);
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

  if (show_screen) {
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
    text("NEXT", (board_width*scl + scl*x_gap) - scl*x_gap/4, scl*y_gap/2);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        rect(scl*i + (board_width*scl + scl*x_gap) - scl*x_gap/2 + (scl*x_gap/2 - scl*4)/2, scl*j + scl*y_gap/2, scl, scl);
      }
    }
    next_show.show();

    //draw score, generation, and subject
    fill(base_color);
    textSize(scl);
    textAlign(CENTER, BOTTOM)
    if (ai_active && natural_selection) {
      text("GENERATION: " + generation, (board_width*scl + scl*x_gap)/2, height - scl*y_gap/4);
      text("SUBJECT: " + subject, (board_width*scl + scl*x_gap)/2, height - scl*y_gap/16);
    }
    text("SCORE: " + score, (board_width*scl + scl*x_gap)/2, scl*y_gap/2);
  }
  
  

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].show();
  }

  textAlign(LEFT, TOP);
  text("SPEED: " + _cpt_, width - 112, y_gap*scl/2 + 112);
  for (let i = 0; i < sloiders.length; i++) {
    sloiders[i].show();
  }

  fill(0);
  textAlign(CENTER, TOP);
  text("INSTRUCTIONS:", width - 112, y_gap*scl/2 + 196);

  textSize(scl*3/4);
  text("Move Right: 🡆", width - 112, y_gap*scl/2 + 224);
  text("Move Left: 🡄", width - 112, y_gap*scl/2 + 244);
  text("Move Down: 🡇", width - 112, y_gap*scl/2 + 264);
  text("Turn Clockwise: D", width - 112, y_gap*scl/2 + 284);
  text("Turn Counterclockwise: A", width - 112, y_gap*scl/2 + 304);
  text("Hold: SPACE", width - 112, y_gap*scl/2 + 324);
}