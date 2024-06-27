import St from 'gi://St';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export default class FocusBurst extends Extension {
  constructor(metadata) {
    super(metadata);
    this._indicator = null;
    // References to Input Fields
    this._intervalsInput = null;
    this._workInput = null;
    this._shortBreakInput = null;
    this._longBreakInput = null;
    // Countdown Timer
    this._minutes = null;
    this._seconds = null;
  }

  enable() {
    // Initialize the Indicator and Core UI Components
    this._initializeUI();
    //PopupMenu: Add Timer
    this._initTimer();
    // PopupMenu: Add Control Buttons
    this._initControls();
    // PopupMenu: Add Input Fields
    this._initInputs();

    // Add the Indicator to the GNOME Shell panel
    Main.panel.addToStatusArea(this.uuid, this._indicator);

    console.log('Enabled FocusBurst');
  }

  _initializeUI() {
    // Create Panel Button
    this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
    // Create Icon and Label
    this._setupPanelBarIcon();
  }

  _setupPanelBarIcon() {
    // Create Icon
    let iconPath = `${this.path}/assets/logo.png`;
    let gicon = Gio.icon_new_for_string(iconPath);
    let iconSize = 14;

    // Create Icon Widget
    let icon = new St.Icon({
      gicon: gicon,
      style_class: 'system-status-icon',
      icon_size: iconSize,
      x_align: Clutter.ActorAlign.CENTER, // Center align horizontally
      y_align: Clutter.ActorAlign.CENTER // Center align vertically
    });

    // Create Label (Text) Widget
    let label = new St.Label({
      text: 'FocusBurst',
      style_class: 'panel-menu-label',
      x_align: Clutter.ActorAlign.CENTER, // Center align horizontally
      y_align: Clutter.ActorAlign.CENTER // Center align vertically
    });

    // Create Box Layout to Contain Icon and Label
    let box = new St.BoxLayout({
      style_class: 'panel-menu-box',
      x_align: Clutter.ActorAlign.CENTER, // Center align horizontally
      y_align: Clutter.ActorAlign.CENTER // Center align vertically
    });
    box.add_child(icon);
    box.add_child(label);

    // Add the box to the Panel Button
    this._indicator.add_child(box);
  }

  _initTimer() {
    let timer = new St.Label({
      text: '00:00',
      style_class: 'timer-label'
    });

    let timerMenu = new PopupMenu.PopupBaseMenuItem({ reactive: false });
    timerMenu.add_child(timer);
    this._indicator.menu.addMenuItem(timerMenu);
  }

  _initControls() {
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
      style_class: 'control-button',
      x_expand: true
    });
    let stopButton = new St.Button({
      label: 'Stop',
      style_class: 'control-button',
      x_expand: true
    });

    // Connect signals
    startButton.connect('clicked', () => {
      console.log("Start button pressed");
      // Implement Start functionality here
    });

    stopButton.connect('clicked', () => {
      console.log("Stop button pressed");
      // Implement Stop functionality here
    });

    // Add buttons to the horizontal box
    controlsBox.add_child(startButton);
    controlsBox.add_child(stopButton);

    outerBox.add_child(controlsBox);

    // Add the box to the menu as a menu item
    let controlsMenu = new PopupMenu.PopupBaseMenuItem({ reactive: false });
    controlsMenu.add_child(outerBox);
    this._indicator.menu.addMenuItem(controlsMenu);
  }

  _initInputs() {
    this._createInputFields('Intervals', '4', '_intervalsInput');
    this._createInputFields('Work', '50', '_workInput');
    this._createInputFields('Short Break', '10', '_shortBreakInput');
    this._createInputFields('Long Break', '20', '_longBreakInput');
  }

  _createInputFields(labelText, defaultValue, storageProperty) {
    let menu = new PopupMenu.PopupBaseMenuItem({ reactive: false });
    let label = new St.Label({
      text: labelText,
      y_align: Clutter.ActorAlign.CENTER
    });

    let leftButton = new St.Button({ label: '-', style_class: 'input-button' });
    let rightButton = new St.Button({ label: '+', style_class: 'input-button' });

    let input = new St.Entry({
      style_class: `${labelText.toLowerCase().replace(' ', '-')}-input-box`,
      can_focus: true
    });
    input.clutter_text.set_text(defaultValue); // Set Default Value

    let increment = labelText === 'Intervals' ? 1 : 5;

    leftButton.connect('clicked', () => {
      let currentValue = parseInt(input.clutter_text.get_text(), 10);
      if (!isNaN(currentValue) && currentValue > increment) {
        input.clutter_text.set_text(String(currentValue - increment));
      } else if (!isNaN(currentValue) && currentValue >= 0) {
        input.clutter_text.set_text('0');
      }
    });

    rightButton.connect('clicked', () => {
      let currentValue = parseInt(input.clutter_text.get_text(), 10);
      if (!isNaN(currentValue) && currentValue + increment < 999) {
        input.clutter_text.set_text(String(currentValue + increment));
      } else if (!isNaN(currentValue)) {
        input.clutter_text.set_text('999')
      }
    });

    let hbox = new St.BoxLayout({ style_class: 'input-container' });
    hbox.add_child(leftButton);
    hbox.add_child(input);
    hbox.add_child(rightButton);

    menu.add_child(label);
    menu.add_child(hbox);

    this._indicator.menu.addMenuItem(menu);
    this[storageProperty] = input;
  }

  getInputValue() {
    return {
      intevals: this._intervalsInput ? this._intervalsInput.clutter_text.get_text() : '',
      work: this._workInput ? this._workInput.clutter_text.get_text() : '',
      shortBreak: this._shortBreakInput ? this._shortBreakInput.clutter_text.get_text() : '',
      longBreak: this._longBreakInput ? this._longBreakInput.clutter_text.get_text() : ''
    }
  }

  disable() {
    this._indicator?.destroy();
    this._indicator = null;

    console.error("This is our error");
    console.trace();
  }
}
