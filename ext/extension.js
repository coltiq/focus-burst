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
    this._menu = null;
  }

  enable() {
    // Create a panel button
    this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

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

    // Add the box to the PanelMenu button
    this._indicator.add_child(box);

    // Create a Dropdown Menu
    this._menu = new PopupMenu.PopupMenu(this._indicator, 0.0, St.Side.BOTTOM);

    // Add Menu Items
    const workTime = new PopupMenu.PopupMenuSection();
    workTime.addAction('Work Time', () => console.log('activated'));
    this._menu.addMenuItem(workTime);

    // Connect Signal to show Menu on Button Click
    this._indicator.connect('button-press-event', () => {
      this._menu.toggle();
    });

    // Add the indicator to the GNOME Shell panel
    Main.panel.addToStatusArea(this.uuid, this._indicator);

    console.log("Enabled FocusBurst");
  }

  disable() {
    this._menu?.destroy();
    this._menu = null;

    this._indicator?.destroy();
    this._indicator = null;

    console.error("This is our error");
    console.trace();
  }
}
