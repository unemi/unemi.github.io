const nBeats = 16, nParts = 5
const nBarsToAlternateRythm = 2, nBeatsInPhrase = 4
const timbre = []
const rythm = []
const rythmP = [
  [[1.0, 0.0], [0.5, 0.4], [0.6, 0.3], [0.1, 0.8]], // sax
  [[0.8, 0.2], [0.2, 0.1], [0.5, 0.1], [0.2, 0.1]],  // piano
  [[0.9, 0.0], [0.05, 0.2], [0.8, 0.3], [0.05, 0.2]],  // bass
  [[0.2, 0.2], [0.5, 0.2], [0.2, 0.3], [0.5, 0.2]],  // snare
  [[0.5, 0.2], [0.2, 0.2], [0.5, 0.3], [0.2, 0.2]]]  // hi-hat
const Maj = [0, 4, 7], Min = [0, 3, 7],
  Sev = [0, 4, 7, 10], Mn7 = [0, 3, 7, 10]
  //  Dim = [0, 3, 6], Aug = [0, 4, 8],
const C = chordCreate(60, Maj), F = chordCreate(65, Maj),
  Am = chordCreate(57, Min), Dm = chordCreate(62, Min),
  Em7 = chordCreate(64, Mn7), G7 = chordCreate(67, Sev);
const prog = [C, F, C, Am, Em7, Dm, G7, C]
const scale = [60, 62, 64, 65, 67, 69, 71]
let crntChrd = 1  // for piano
let saxPhrase // for main melody
let saxPitch = -1, bassPitch = -1
let index = 0;
let ready = false

function preload() {
  for (const name of ["AltoSaxC3","PianoC3","PickBassC2","Snare","HiHat","BassDrum"])
    { timbre.push(loadSound("data/" + name + ".mp3")) }
}
function newRythm() {
  if (rythm.length == 0) {
    for (let i = 0; i < nBeats; i ++) { rythm.push(new Array(nParts)) }
  }
  for (let j = 0; j < nParts; j ++) {
  for (let i = 0; i < nBeats; i ++) {
    const r = random(1), p = rythmP[j][i % rythmP[j].length]
    rythm[i][j] = (r < p[0])? 0 : (r < p[0] + p[1])? 1 : 2
  }}
}
function saxOn() {
  saxPitch = saxPhrase[index % nBeatsInPhrase]
  timbre[0].play(0, midiToFreq(saxPitch)/264, random(0.667,1.0))
}
function saxOff() {
  if (saxPitch >= 0) { timbre[0].stop(); saxPitch = -1 }
}
function pianoOn() {
  crntChrd = chordNotes(prog[int(index/nBeats)])
  for (const k of crntChrd)
    timbre[1].play(0, midiToFreq(k)/264, random(0.3,0.5))
}
function pianoOff() {
  if (crntChrd == null) return
  timbre[1].stop()
  crntChrd = null
}
function bassOn() {
  bassPitch = chordSomeNote(prog[int(index/nBeats)])
  //if (bassPitch > 42) bassPitch -= 12
  timbre[2].play(0, midiToFreq(bassPitch)/264, random(.667,0.9))
}
function bassOff() {
  if (bassPitch >= 0) { timbre[2].stop(); bassPitch = -1 }
}

function setup() {
  createCanvas(480,270)
  frameRate(4)
  newRythm()
}
function draw() {
  background(0)
  fill(255)
  textSize(height/10)
  textAlign(CENTER)
  if (!ready) {
    text("Click here to start.", width*.5, height*.4)
    noLoop()
    return
  } else text("Click here to stop.", width*.5, height*.4)
  const rtm = rythm[index % nBeats];
// sax
  if (index % nBeatsInPhrase == 0) {
    saxPhrase = makePhrase(chordSomeNote(prog[int(index/nBeats)]))
  }
  switch (rtm[0]) {
    case 0: saxOff(); saxOn(); break;
    case 1: saxOff();
  }
// piano
  switch (rtm[1]) {
    case 0: pianoOff(); pianoOn(); break;
    case 1: pianoOff();
  }
// bass
  switch (rtm[2]) {
    case 0: bassOff(); bassOn(); break;
    case 1: bassOff();
  }
// drums
  if (index % 4 == 0)
    timbre[5].play(0, 1, random(0.7,1))  // bass drum
  if (rtm[3] == 0)
    timbre[3].play(0, 1, random(0.7,1))  // snare
  if (rtm[4] == 0)
    timbre[4].play(0, 1, random(0.7,1))  // hi-hat pedal
// next step
  if ((++ index) >= nBeats * prog.length) index = 0;
  if (index % (nBeats*nBarsToAlternateRythm) == 0) newRythm();
}
function mousePressed() {
  if (!ready) { ready = true; loop() }
  else { for (const tmb of timbre) { tmb.stop() } ready = false }
}
