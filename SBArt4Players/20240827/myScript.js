var canvas, ifrm, playBtn
var gl, program, vshader, shader1, shader2, audio1, audio2, codeNumb = 1
var readyToDraw = false, tPos, timer
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
function preload() {
	audio2 = new Audio(codeNumb + ".mp3")
	ifrm.src = codeNumb + ".txt"
}
function setup() {
	canvas = document.querySelector("canvas")
	gl = canvas.getContext("webgl")
	if (!gl) alert("Could not get WebGL context.")
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
	gl.bufferData(gl.ARRAY_BUFFER,
		new Float32Array([-1,-1,0, 1,-1,0, -1,1,0, 1,1,0]), gl.STATIC_DRAW)
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(0)
	gl.viewport(0, 0, canvas.width, canvas.height)
	playBtn = document.querySelector("img")
	canvas.onfullscreenchange = (e)=>{
		if (document.fullscreenElement) {
//			canvas.style.width = screen.width + "px"
//			canvas.style.height = screen.height + "px"
			playBtn.hidden = true
			playNext()
		} else {
//			canvas.style.width = "1280px"
//			canvas.style.height = "720px"
			audio1.pause()
			clearInterval(timer)
			playBtn.hidden = false
		}
//		canvas.width = screen.width * devicePixelRatio
//		canvas.height = screen.height * devicePixelRatio
		
	}
	vshader = makeShader(document.getElementById("vshader"), gl.VERTEX_SHADER)
	ifrm = document.querySelector("iframe")
	ifrm.onload = ()=>{
		shader2 = makeShader(ifrm.contentDocument.body, gl.FRAGMENT_SHADER) }
	preload()
}
async function drawScene() {
	if (!readyToDraw) return
	gl.uniform1f(tPos, audio1.currentTime / audio1.duration)
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	gl.flush()
}
function startPlay() {
    if (canvas.requestFullScreen) canvas.requestFullScreen()
    else if (canvas.webkitRequestFullScreen) canvas.webkitRequestFullScreen()
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
	gl.uniform1f(gl.getUniformLocation(program, "xScale"), canvas.width/canvas.height)
	gl.uniform2f(gl.getUniformLocation(program, "size"), canvas.width, canvas.height)
	tPos = gl.getUniformLocation(program, "T")
	audio1 = audio2
	audio1.addEventListener("ended", playNext)
	audio1.play()
	readyToDraw = true
	codeNumb = (codeNumb % nCodes) + 1
	preload()
}
