import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { initializeUI } from './ui/panelBar.js';
import { initControlButtons } from './ui/controls.js';
import { initTimer } from './ui/timer.js';

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
    this._timerlabel = null;
  }

  enable() {
    // Initialize the Indicator and Core UI Components
    this._indicator = initializeUI(this.metadata);

    //PopupMenu: Add Timer
    let { timerMenu, timerLabel } = initTimer();
    this._indicator.menu.addMenuItem(timerMenu);
    this._timerLabel = timerLabel;

    // PopupMenu: Add Control Buttons
    let controls = initControlButtons();
    this._indicator.menu.addMenuItem(controls)

    // PopupMenu: Add Input Fields
    this._initInputs();

    // Add the Indicator to the GNOME Shell panel
    Main.panel.addToStatusArea(this.uuid, this._indicator);

    console.log('Enabled FocusBurst');
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

  setTimerValue(newTime) {
    if (this._timerLabel){
      this.timerLabel.set_text(this._timerLabel);
    }
  }

  disable() {
    this._indicator?.destroy();
    this._indicator = null;

    console.error("This is our error");
    console.trace();
  }
}
