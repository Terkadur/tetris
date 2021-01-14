function Sloider(x, y, w, val) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.val = val;
  this.pos = map(this.val, 1, 50, this.x, this.x + this.w); //converts the value to the x position of the slider piece

  this.show = function() {
    line(this.x, this.y, this.x + this.w, this.y);
    fill(224);
    rect(this.pos - 4, this.y - 16, 8, 32);
  }
}