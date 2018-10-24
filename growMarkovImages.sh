#!/bin/bash

for filename in $1; do
  [ -e "$filename" ] || continue
  for ((i=0; i<=3; i++)); do
      node growMarkovImage "$filename" "$2"  "$3"
  done
done