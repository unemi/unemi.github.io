// Snowman
function setup() {
  createCanvas(600,400,WEBGL)
  noStroke()
}
let th = 0
function draw() {
  background(220)
  lights()
  orbitControl()
  axes()
  fill(255,200)
  translate(0,50,0)
  sphere(80)  // body
  push()
  translate(0,-100,0)
  sphere(50)  // head
  hat(20,15,40)
  push()
  translate(0,0,60)
  rotateX(PI/2)
  fill(250,100,20)
  cone(10,30)
  pop()
  fill(0)
  translate(20,-10,40)
  sphere(10)  // left eye
  translate(-40,0,0)
  sphere(10)  // right eye
  translate(20,25,5)
  rotateZ(PI/2)
  cylinder(6,30)  // mouth
  pop()
  rotateY(-PI/6)
  rotateZ(PI/4)
  translate(0,-80,0)
  rotateZ(PI/6 * sin(th))
  translate(0,-40,0)
  fill(200,100,0)
  cylinder(5,80)  // arm
  if ((th += PI/20) > TWO_PI) th -= TWO_PI
}
