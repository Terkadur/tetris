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

function mouseReleased() {
  for (let i = 0; i < buttons.length; i++) {
    if (mouseX > buttons[i].x && mouseX < buttons[i].x + buttons[i].w && mouseY > buttons[i].y && mouseY < buttons[i].y + buttons[i].h) {
      is_button = true;
      buttons[i].state = !buttons[i].state;
      if (i == 0) {
        ai_active = buttons[i].state;
        t = 0;
      } else if (i == 1) {
        newGame();
        buttons[i].state = !buttons[i].state;
      }
      break;
    }
  }

  sloider_held = -1; //signifies the "sloider" is no longer held when the mouse is released
}

let sloider_held = -1;
function mousePressed() {
  for (let i = 0; i < sloiders.length; i++) {
    if (mouseX > sloiders[i].pos - 4 && mouseX < sloiders[i].pos + 4 && mouseY > sloiders[i].y - 16 && mouseY < sloiders[i].y + 16) {
      sloider_held = i;
      break;
    }
  }
}

function mouseDragged() {
  if (sloider_held != -1) {
    if (mouseX >= sloiders[sloider_held].x && mouseX <= sloiders[sloider_held].x + sloiders[sloider_held].w) { //positions the "sloider" at the mouse's X
      sloiders[sloider_held].pos = mouseX;
      sloiders[sloider_held].val = round(map(mouseX, sloiders[sloider_held].x, sloiders[sloider_held].x + sloiders[sloider_held].w, 1, 50)); //updates the value
      _cpt_ = sloiders[sloider_held].val; //updates the _cpt_ (calculations per tick ie the speed of the program)
    } else if (mouseX < sloiders[sloider_held].x) { //lower limit on the "sloider" value
      sloiders[sloider_held].pos = sloiders[sloider_held].x;
      sloiders[sloider_held].val = 1;
      _cpt_ = sloiders[sloider_held].val;
    } else { //upper limit on the "sloider" value
      sloiders[sloider_held].pos = sloiders[sloider_held].x + sloiders[sloider_held].w;
      sloiders[sloider_held].val = 50;
      _cpt_ = sloiders[sloider_held].val;
    }
  }
}