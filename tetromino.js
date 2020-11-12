
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
    //verify it's a possible move
    for (let j = 0; j < this.shape.length; j++) {  
      if (this.shape[j][1] + this.y == 0) {
        move_d = false;
      } else if (String(grid[this.shape[j][0] + this.x][this.shape[j][1] + this.y - 1]) != String(color(base_color))) {
        move_d = false;
      }
    }
    if (move_d) {
      this.y -= 1;
      t = wait_time*_fr_; //resets timer
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
      if (this.shape[j][1] + this.y >= board_height - 1) {
        move_u = false;
      } else if (String(grid[this.shape[j][0] + this.x][this.shape[j][1] + this.y + 1]) != String(color(base_color))) {
        move_u = false;
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
    for (let i = 0; i < this.shape.length; i++) { //backup shape in case of impossible move
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
      for (let i = 0; i < save_shape.length; i++) { //returns shape to previous
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