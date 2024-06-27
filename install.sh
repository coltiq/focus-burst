#!/bin/sh

INSTALLLOC=$HOME/.local/share/gnome-shell/extensions/focus-burst@coltiq.com

rm $INSTALLLOC -rf
cp $HOME/Code/extensions/gnome/focus-burst/ext $INSTALLLOC -r
