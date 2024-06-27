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
  }

  enable() {
    // Initialize the Indicator and Core UI Components
    this._initializeUI();

    // PopupMenu: Add Input Fields
    this._initInputs()

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
    let input = new St.Entry({
      style_class: `${labelText.toLowerCase().replace(' ', '-')}-input-box`,
      can_focus: true
    });
    input.clutter_text.set_text(defaultValue); // Set Default Value
    menu.add_child(label);
    menu.add_child(input);

    this._indicator.menu.addMenuItem(menu);
    this[storageProperty] = input;
  }

  disable() {
    this._indicator?.destroy();
    this._indicator = null;

    console.error("This is our error");
    console.trace();
  }
}
