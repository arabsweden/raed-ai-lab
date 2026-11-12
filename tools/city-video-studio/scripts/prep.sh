#!/bin/bash
# usage: prep.sh in out "trim_start:trim_end:factor;..." 
set -e
IN=$1; OUT=$2; SPEC=$3; SHARP=${4:-0.6}
MI="minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
FC=""; LBL=""; i=0
IFS=';' read -ra P <<< "$SPEC"
for p in "${P[@]}"; do IFS=':' read s e f d <<< "$p"
  FC="$FC[0:v]trim=$s:$e,setpts=(PTS-STARTPTS)*$f,scale=720:1280:flags=lanczos,$MI,tpad=stop_mode=clone:stop_duration=0.2,trim=duration=$d[v$i];"; LBL="$LBL[v$i]"; i=$((i+1)); done
ffmpeg -v error -y -i "$IN" -an -filter_complex "${FC}${LBL}concat=n=$i:v=1:a=0,scale=1080:1920:flags=lanczos,unsharp=5:5:$SHARP,fps=30" -c:v libx264 -crf 15 -preset medium -pix_fmt yuv420p "$OUT"
