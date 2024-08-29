// Javascript code for SBArt animation player
// (C) Tatsuo Unemi, 2024.
var canvas, playBtn
var gl, program, vshader, shader1, shader2, audio1, audio2, codeNumb = 1
var readyToDraw = false, tPos, timer, loadedFlags = 0, loadedHandler
var canvasW, canvasH, isWebKit, isSmartPhone
const nCodes = 20
function makeShader(ID, shaderType) {
	const shader = gl.createShader(shaderType)
	gl.shaderSource(shader, document.getElementById(ID).textContent)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader))
		return null
	} else return shader
}
function didLoadingComplete(flag) {
	if ((loadedFlags |= flag) < 3) return
	if (loadedHandler) loadedHandler()
}
async function preload(postProc) {
	loadedFlags = 0
	loadedHandler = postProc
	audio2 = new Audio(codeNumb + ".mp3")
	audio2.oncanplay = (e)=>{ didLoadingComplete(1) }
	audio2.addEventListener("ended", playNext, {once:true})
	shader2 = makeShader("fs" + codeNumb, gl.FRAGMENT_SHADER)
	didLoadingComplete(isSmartPhone? 3 : 2)
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
function adjustCanvasSize(stw, sth) {
	canvas.style.width = stw + "px"
	canvas.style.height = sth + "px"
	canvas.width = stw * devicePixelRatio
	canvas.height = sth * devicePixelRatio
	canvasSizeSetup()
}
function playNext() {
console.log("playNext " + loadedFlags)
	if (loadedFlags < 3) { loadedHandler = playNext; return }
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
	audio1.play().catch(alert)
	readyToDraw = true
	codeNumb = (codeNumb % nCodes) + 1
	preload()
}
function didWindowResize() {	// for smart phone
	adjustCanvasSize(innerWidth, innerHeight)
	if (playBtn.parentNode) {
		const sz = ((innerWidth < innerHeight)? innerWidth : innerHeight) / 3.
		playBtn.style.width = playBtn.style.height = sz + "px"
		playBtn.style.top = (innerHeight - sz) / 2 + "px"
		playBtn.style.left = (innerWidth - sz) / 2 + "px"
	}
}
function startStop(start) {
	if (start) {
		console.log("start")
		playBtn.remove()
		if (audio1) audio1.play(); else playNext()
	} else {
		audio1.pause(); clearInterval(timer); timer = null
		document.body.appendChild(playBtn)
	}
}
function didCanvasFullScreenChange() {	// for PC
	if (document.fullscreenElement) {
		adjustCanvasSize(screen.width, screen.height)
		startStop(true)
	} else {
		adjustCanvasSize(canvasW, canvasH)
		startStop(false)
		drawScene()
	}
}
function setup() {
	const ua = navigator.userAgent
	for (const key of ["iPhone", "iPod", "iPad", "Android"])
		if (ua.indexOf(key) >= 0) { isSmartPhone = true; break }
	isWebKit = ua.indexOf("AppleWebKit") >= 0
	canvas = document.querySelector("canvas")
	playBtn = document.querySelector("svg")
	gl = canvas.getContext("webgl")
	if (!gl) alert("Could not get WebGL context.")
	if (isSmartPhone) {
		document.body.style.padding = 0
		document.body.style.margin = 0
		onresize = didWindowResize
		didWindowResize()
		canvas.onclick = ()=>{ if (timer) startStop(false) }
	} else {
		canvasW = canvas.width
		canvasH = canvas.height
		canvas.addEventListener(isWebKit? "webkitfullscreenchange" : "fullscreenchange",
			didCanvasFullScreenChange)
	}
	playBtn.hidden = true
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
	gl.bufferData(gl.ARRAY_BUFFER,
		new Float32Array([-1,-1,0, 1,-1,0, -1,1,0, 1,1,0]), gl.STATIC_DRAW)
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(0)
	vshader = makeShader("vshader", gl.VERTEX_SHADER)
	preload(()=>{ playBtn.hidden = false })
}
function startPlay() {
	if (isSmartPhone) startStop(true)
	else {
		if (canvas.requestFullScreen) canvas.requestFullScreen()
		else if (canvas.webkitRequestFullScreen) canvas.webkitRequestFullScreen()
		else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen()
		if (!audio1) { audio2.play(); audio2.pause() }
	}
	timer = setInterval(drawScene, 1000./60.)
}
