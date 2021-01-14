function Button(x, y, w, h, txt1, txt2) { //class for the buttons
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.txt1 = txt1; //text for the "false" state
  this.txt2 = txt2; //text for the "true" state
  this.state = false;

  this.show = function() {
    if (!this.state) {
      fill(224);
    } else {
      fill(160);
    }
    rect(this.x, this.y, this.w, this.h);

    textAlign(CENTER, CENTER);
    textSize(scl*3/4);
    fill(0);
    if (!this.state) {
      text(txt1, this.x + this.w/2, this.y + this.h/2);
    } else {
      text(txt2, this.x + this.w/2, this.y + this.h/2);
    }
  }
}