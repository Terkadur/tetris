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