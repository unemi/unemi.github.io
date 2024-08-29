#! /bin/zsh
# (C) Tatsuo Unemi, August 28, 2024.
# Makes MP3 files from CAF
if [ -f 1.caf ]
then for x in {[1-9],[1-9][0-9]}.caf
do ffmpeg -i $x -v fatal -y `echo $x | cut -d. -f1`.mp3
rm $x
done
elif [ ! -f 1.mp4 ]
then echo "No sound file found in `cwd`."; exit
fi
# makes index.html unified the shader codes extracted from HTML files.
if [ ! -f 1.html ]; then echo "No HTML file found in `cwd`."; exit; fi
cat > index.html <<EOF
<!doctype html>
<!-- (C) Tatsuo Unemi, `date +%Y` -->
<html lang="en-US">
<head>
<meta charset="utf-8"/>
<title>SBArt4 Animation on WebGL `date +%Y%m%d`</title>
<script src="myScript.js" type="text/javascript"></script>
<script id="vshader" type="x-shader/x-vertex">
attribute vec4 vPos;
uniform float xScale;
varying vec2 pCoord;
void main(void) {
	gl_Position = vPos;
	pCoord = vec2(vPos.x*xScale,vPos.y);
}
</script>
EOF
for x in {[1-9],[1-9][0-9]}.html
do echo '<script id="fs'`echo $x | cut -d. -f1`'" type="x-shader/x-fragment">' >> index.html
awk '/script>/{m=0}m==1{print}/fshader/{m=1}' $x >> index.html
echo '</script>' >> index.html
rm $x
done
cat >> index.html <<EOF
</head>
<body onload="setup()">
<canvas width=1280px height=720px></canvas>
<svg onclick="startPlay(this)" style="position:absolute;top:232px;left:512px"
version="1.1" width="256.0" height="256.0" viewBox="0 0 256 256">
<path d="M48,240C30.327,240 16,225.673 16,208L16,48C16,30.327 30.327,16 48,16
L208,16C225.673,16 240,30.327 240,48L240,208C240,225.673 225.673,240 208,240Z"
fill="#000000" fill-opacity="0.5" stroke="none"></path>
<path d="M63.500,47.500L63.500,207.500L208,128Z"
fill="#FEFEFE" fill-opacity="0.8" stroke="none"></path>
</svg>
</body>
</html>
EOF
