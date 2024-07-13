import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { initializeUI } from './ui/panelBarUI.js';
import { initControlButtons } from './ui/controlsUI.js';
import { initStateDisplay } from './ui/stateUI.js';
import { createInputFields } from './ui/inputUI.js';
import { PomodoroTimer } from './pomodoro/pomodoroTimer.js'
import Preferences, { init as initPrefs } from './prefs.js';

export default class FocusBurst extends Extension {
  constructor(metadata) {
    super(metadata);
    this._indicator = null;
    // References to Input Fields
    this._inputs = {};
    // Countdown Timer
    this._stateLabel = null;
    this.currentSeconds = 0;
    // Settings
    this.settings = new Preferences() 
    // Pomodoro
    this.pomodoroTimer = new PomodoroTimer(this.setTimerDisplay.bind(this), this.setStateDisplay.bind(this));
  }

  enable() {
    // Initialize the Indicator and Core UI Components
    this._indicator = initializeUI(this.metadata);

    //PopupMenu: Add State Display
    let { stateMenu, stateLabel } = initStateDisplay();
    this._indicator.menu.addMenuItem(stateMenu);
    this._stateLabel = stateLabel;

    // PopupMenu: Add Control Buttons
    const onStart = () => {
      console.log('onStart triggered');
      this.pomodoroTimer.start();
    };    
    const onStop = () => {
      console.log('onStop triggered');
      this.pomodoroTimer.stop();
    };
    const onReset = () => {
      console.log('onReset triggered');
      this.resetTimer();
    }
    let controls = initControlButtons(onStart, onStop, onReset);
    this._indicator.menu.addMenuItem(controls)

    // PopupMenu: Add Input Fields
    this._initInputs();

    // Add the Indicator to the GNOME Shell panel
    Main.panel.addToStatusArea(this.uuid, this._indicator);

    //
    this.pomodoroTimer.workDuration = this.settings.get_int('work-duration') * 60;
    this.pomodoroTimer.shortBreakDuration = this.settings.get_int('short-break-duration') * 60;
    this.pomodoroTimer.longBreakDuration = this.settings.get_int('long-break-duration') * 60;
    this.pomodoroTimer.intervalsBeforeLongBreak = this.settings.get_int('intervals-before-long-break');

    console.log('Enabled FocusBurst');
  }

  _initInputs() {
    const inputConfiguration = [
    { label: 'Intervals', default: '4', increment: 1 },
    { label: 'Work', default: '25', increment: 5 },
    { label: 'Short Break', default: '5', increment: 5 },
    { label: 'Long Break', default: '15', increment: 5 },
    ]

    inputConfiguration.forEach(config => {
      const { menu, input } = createInputFields(config.label, config.default, config.increment);
      this._indicator.menu.addMenuItem(menu);
      this._inputs[config.label.replace(' ', '-')] = input
    });
  }

  getInputValue() {
    return {
        'Work': parseInt(this._inputs['Work'].clutter_text.get_text(), 10),
        'Short-Break': parseInt(this._inputs['Short-Break'].clutter_text.get_text(), 10),
        'Long-Break': parseInt(this._inputs['Long-Break'].clutter_text.get_text(), 10),
        'Intervals': parseInt(this._inputs['Intervals'].clutter_text.get_text(), 10)
    };
  }

  setTimerDisplay(newTime, state) {
    this.updatePanelTitle(newTime);
  }

  setStateDisplay(state) {
    this._stateLabel.set_text(state);
  }

  updatePanelTitle(newTitle) {
    const label = this._indicator.get_child_at_index(0)
    label.get_child_at_index(1).set_text(newTitle)
  }

  resetTimer() {
    const timerSettings = this.getInputValue(); 
    this.pomodoroTimer.reset(
        timerSettings['Work'],
        timerSettings['Short-Break'],
        timerSettings['Long-Break'],
        timerSettings['Intervals']
    );
  }

  disable() {
    this._indicator?.destroy();
    this._indicator = null;

    console.error("This is our error");
    console.trace();
  }
}
