// Javascript code for SBArt animation player
// (C) Tatsuo Unemi, 2024.
var canvas, playBtn
var gl, program, vshader, shader1, shader2, audio1, audio2, codeNumb = 1
var readyToDraw = false, tPos, timer
var canvasW, canvasH, isWebKit
const nCodes = 20
function makeShader(element, shaderType) {
	const shader = gl.createShader(shaderType)
	gl.shaderSource(shader, element.textContent)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader))
		return null
	} else return shader
}
function preload(postProc) {
	audio2 = new Audio(codeNumb + ".mp3")
	if (postProc) audio2.onloadeddata = postProc
	shader2 = makeShader(document.getElementById("fs" + codeNumb), gl.FRAGMENT_SHADER)
}
function canvasSizeSetup() {
	gl.viewport(0, 0, canvas.width, canvas.height)
	if (program) {
		gl.uniform1f(gl.getUniformLocation(program, "xScale"), canvas.width/canvas.height)
		gl.uniform2f(gl.getUniformLocation(program, "size"), canvas.width, canvas.height)
	}
}
async function drawScene() {
	if (!readyToDraw) return
	gl.uniform1f(tPos, audio1.currentTime / audio1.duration)
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	gl.flush()
}
function didCanvasFullScreenChange() {
	let stw, sth, postProc
	if (document.fullscreenElement) {
		stw = screen.width; sth = screen.height
		playBtn.hidden = true
		postProc = ()=>{ if (audio1) audio1.play(); else playNext() }
	} else {
		stw = canvasW; sth = canvasH
		playBtn.hidden = false
		postProc = ()=>{ audio1.pause(); clearInterval(timer); drawScene() }
	}
	canvas.style.width = stw + "px"
	canvas.style.height = sth + "px"
	canvas.width = stw * devicePixelRatio
	canvas.height = sth * devicePixelRatio
	canvasSizeSetup()
	postProc()
}
function setup() {
	canvas = document.querySelector("canvas")
	canvasW = canvas.width
	canvasH = canvas.height
	gl = canvas.getContext("webgl")
	if (!gl) alert("Could not get WebGL context.")
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
	gl.bufferData(gl.ARRAY_BUFFER,
		new Float32Array([-1,-1,0, 1,-1,0, -1,1,0, 1,1,0]), gl.STATIC_DRAW)
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(0)
	playBtn = document.querySelector("svg")
	playBtn.hidden = true
	canvas.addEventListener((navigator.userAgent.indexOf("AppleWebKit") >= 0)?
		"webkitfullscreenchange" : "fullscreenchange",
		didCanvasFullScreenChange)
	vshader = makeShader(document.getElementById("vshader"), gl.VERTEX_SHADER)
	preload(()=>{ playBtn.hidden = false })
}
function startPlay() {
    if (canvas.requestFullScreen) canvas.requestFullScreen()
    else if (canvas.webkitRequestFullScreen) canvas.webkitRequestFullScreen()
    else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen()
    else playNext()
	timer = setInterval(drawScene, 1000./60.)
}
function playNext() {
	readyToDraw = false
	if (shader1) { gl.detachShader(program, shader1); gl.deleteShader(shader1) }
	shader1 = shader2
	if (program) gl.deleteProgram(program)
	program = gl.createProgram()
	gl.attachShader(program, vshader)
	gl.attachShader(program, shader1)
	gl.bindAttribLocation(program, 0, "vPos")
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS))
		{ alert("Could not Link shaders"); return }
	gl.useProgram(program)
	canvasSizeSetup()
	tPos = gl.getUniformLocation(program, "T")
	audio1 = audio2
	audio1.addEventListener("ended", playNext)
	audio1.play()
	readyToDraw = true
	codeNumb = (codeNumb % nCodes) + 1
	preload()
}
