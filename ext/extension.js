import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { initializeUI } from './ui/panelBarUI.js';
import { initControlButtons } from './ui/controlsUI.js';
import { initTimer } from './ui/timerUI.js';
import { createInputFields } from './ui/inputUI.js';

export default class FocusBurst extends Extension {
  constructor(metadata) {
    super(metadata);
    this._indicator = null;
    // References to Input Fields
    this._inputs = {};
    // Countdown Timer
    this._timerLabel = null;
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
    const inputConfiguration = [
    { label: 'Intervals', default: '4', increment: 1 },
    { label: 'Work', default: '50', increment: 5 },
    { label: 'Short Break', default: '10', increment: 5 },
    { label: 'Long Break', default: '20', increment: 5 },
    ]

    inputConfiguration.forEach(config => {
      const { menu, input } = createInputFields(config.label, config.default, config.increment);
      this._indicator.menu.addMenuItem(menu);
      this._inputs[config.label.replace(' ', '-')] = input
    });
  }

  getInputValue() {
    return Object.keys(this._inputs).reduce((values, key) => {
      values[key] = this._inputs[key].clutter_text.get_text();
      return values;
    }, {});
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
