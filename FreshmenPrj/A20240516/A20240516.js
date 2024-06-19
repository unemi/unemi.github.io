let myFont, myFont2, myBGM, myVoice
const myText =
  "Hello!\nGood afternoon!\n" +
  "This is a sample text.\nHave a good day!"
let scrScale = 1, volume = 0.3, duration, peaks, timeBGMEnd = 0
function preload() {
  myFont = loadFont("data/Helvetica.ttf")
  myFont2 = loadFont("data/ComicSansMSBold.ttf")
  myBGM = loadSound("data/Headspin.mp3")
  myVoice = loadSound("data/myVoice.mp3")
}
function setup() {
  if (window.innerWidth < 1280)
    scrScale = window.innerWidth / 1280
  createCanvas(1280*scrScale,720*scrScale,WEBGL)
  frameRate(60)
}
function draw() {
  background(0)
  scale(scrScale)
  if (duration == undefined) {
    textFont(myFont)
    textAlign(CENTER)
    textSize(60)
    text("Click here to start animation.", 0, 40)
    return
  }
  if (duration < 0) {
    duration = myBGM.duration()
    peaks = myVoice.getPeaks(int(myVoice.duration()*60))
    myBGM.setVolume(volume) 
    myBGM.play()
    myVoice.play()
  }
  lights()
  orbitControl()
  let tm = duration, faceY = 1
  if (myBGM.isPlaying()) {
    tm = myBGM.currentTime()
    push()
    rotateX(PI/3)
    textAlign(CENTER)
    textFont(myFont)
    textSize(96)
    //text(myText, 0, height/2 - (millis()/10 % height)*2)
    if (!myVoice.isPlaying()) myBGM.setVolume(volume=min(1.0,volume+0.002))
    const alpha = min(2, duration-tm)/2*255
    fill(255,alpha)
    text(myText, 0, 720/2 - (tm*100 % 720)*2)
    textFont(myFont2)
    textSize(60)
    fill(255,255,100,alpha)
    text(myText, 0, 720/2 - (tm*100 % 720)*2 + 600)
    pop()
  } else if (timeBGMEnd == 0) {
    timeBGMEnd = millis()
  } else faceY = pow(1 - min(1, (millis() - timeBGMEnd) / 5000), 2)

// talking head
  push()
  const r = 720/8
  translate(0,-r*2*faceY,0)
  noStroke()
  fill(255,200,150)
  sphere(r)  // head
  fill(0)
  push()
  translate(r*.4,-r*.1,r*.8)
  sphere(r/6)  // left eye
  translate(r*-.8,0,0)
  sphere(r/6)  // right eye
  pop()
  translate(0,r*.5,r*.9)
  rotateX(PI*-.15)
  fill(200,0,0)
  // mouth
  ellipse(0,0,r,r*.5*
    (myVoice.isPlaying()?
      peaks[int(myVoice.currentTime()*60)] + .2 : .2))
  pop()

// dice
  const s = 720/6
  noStroke()
  textFont(myFont)
  textSize(s*.8)
  textAlign(CENTER)
  translate(720/4,-s*faceY,0)
  push()
  rotateY(tm/duration*TWO_PI*5)
  rotateZ(tm/duration*TWO_PI*10)
  dice("123456")
  pop()
  translate(-720/2,0,0)
  rotateY(tm/duration*TWO_PI*5)
  rotateZ(tm/duration*TWO_PI*6)
  dice("ABCDEF")
  
  function dice(str) {
    fill(255)
    box(s)
    fill(200,0,0)
    face(6,()=>{})
    face(1,()=>{rotateY(PI)})
    face(3,()=>{rotateY(PI/2)})
    face(4,()=>{rotateY(-PI/2)})
    face(2,()=>{rotateX(PI/2)})
    face(5,()=>{rotateX(-PI/2)})
    
    function face(idx, Rotate) {
      push()
      Rotate()
      translate(0,s/4,s/2+.1)
      text(str.substring(idx-1,idx),0,0)
      pop()
    }
  }
}
function mousePressed() {
  if (duration == undefined) duration = -1
}
