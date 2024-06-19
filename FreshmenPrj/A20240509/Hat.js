function hat(r1, r2, h) {
  push()
  translate(0,-50-h/2+5,0)
  //stroke(0); noFill()
  noStroke(); fill(0,150,255)
  beginShape(TRIANGLE_STRIP)
  for (let i = 0; i <= 16; i ++) {
    const th = i * TWO_PI / 16
    normal(cos(th),(r2-r1)/h,sin(th))
    vertex(r1*cos(th),h/2,r1*sin(th))
    vertex(r2*cos(th),-h/2,r2*sin(th))
  }
  endShape()
  beginShape(TRIANGLE_FAN)
  normal(0,-1,0)
  vertex(0,-h/2,0)
  for (let i = 0; i <= 16; i ++) {
    const th = i * TWO_PI / 16
    vertex(r2*cos(th),-h/2,r2*sin(th))
  }
  endShape()
  pop()
}
