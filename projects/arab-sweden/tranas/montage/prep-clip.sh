#!/usr/bin/env bash
# Upscale a Flow clip to 1080x1920 and stretch it smoothly to the scene length.
# Usage: ./prep-clip.sh <input.mp4> <scene number> <target seconds>
# Scene lengths incl. transition overlap: 1=14.5  2=12.7  3=14.7  4=12.3  5=11.7  6=8.6 (trimmed, no stretch)
set -euo pipefail
in="$1"; n="$2"; dur="$3"
src=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
f=$(echo "$dur / $src" | bc -l); t=$(echo "1 / $f" | bc -l)
ffmpeg -v error -y -i "$in" -filter_complex \
  "[0:v]setpts=${f}*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir,scale=1080:1920:flags=lanczos,unsharp=5:5:0.5:5:5:0.0[v];[0:a]atempo=${t}[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p -c:a aac -b:a 128k -t "$dur" "public/s${n}.mp4"
echo "public/s${n}.mp4 ready"
