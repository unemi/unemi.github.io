function arrow() {
  cylinder(2,320)
  push()
  translate(0,160)
  cone(10,20)
  pop()
}
function axes() {
  push()
  noStroke()
  fill(0,120,0)
  arrow()
  rotateZ(-PI/2)
  fill(200,0,0)
  arrow()
  rotateX(PI/2)
  fill(0,0,220)
  arrow()
  pop()
}
