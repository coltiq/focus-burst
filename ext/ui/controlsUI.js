import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export function initControlButtons(onStart, onStop, onReset) {
  // Create Outer Box for Centering
  let outerBox = new St.BoxLayout({
    style_class: 'control-buttons-outer',
    vertical: false,
    x_expand: true
  });

  // Create a horizontal box to hold both buttons
  let controlsBox = new St.BoxLayout({
    style_class: 'control-buttons',
    vertical: false,
    x_align: Clutter.ActorAlign.CENTER,
  });

  // Create Start and Stop buttons
  let startButton = new St.Button({
    label: 'Start',
    style_class: 'control-button round-button',
    x_expand: true
  });
  let stopButton = new St.Button({
    label: 'Stop',
    style_class: 'control-button round-button',
    x_expand: true
  });
  let resetButton = new St.Button({
    label: 'Reset',
    style_class: 'control-button round-button',
    x_expand: true
  });

  // Connect signals
  startButton.connect('clicked', () => {
    console.log("Start button pressed");
    onStart();
  });

  stopButton.connect('clicked', () => {
    console.log("Stop button pressed");
    onStop();
  });

  resetButton.connect('clicked', () => {
    console.log("Reset button pressed");
    onReset();
  });

  // Add buttons to the horizontal box
  controlsBox.add_child(startButton);
  controlsBox.add_child(stopButton);
  controlsBox.add_child(resetButton);

  // Add horizontal box it the outer box
  outerBox.add_child(controlsBox);

  // Add the box to the menu as a menu item
  let controlsMenu = new PopupMenu.PopupBaseMenuItem({ reactive: false });
  controlsMenu.add_child(outerBox);

  return controlsMenu;
}
