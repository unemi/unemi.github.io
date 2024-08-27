#! /bin/zsh
for x in {1..20}; do ffmpeg -i $x.caf -v fatal -y $x.mp3;done
rm *.caf
