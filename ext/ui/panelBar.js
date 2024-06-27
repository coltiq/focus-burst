import St from 'gi://St';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

export function initializeUI(metadata) {
  let indicator = new PanelMenu.Button(0.0, metadata.name, false);
  setupPanelBarIcon(indicator, metadata.path);
  return indicator;
}

function setupPanelBarIcon(indicator, path) {
  // Create Icon
  let iconPath = `${path}/assets/logo.png`;
  let gicon = Gio.icon_new_for_string(iconPath);
  let iconSize = 14;

  // Create Icon Widget
  let icon = new St.Icon({
    gicon: gicon,
    style_class: 'system-status-icon',
    icon_size: iconSize,
    x_align: Clutter.ActorAlign.CENTER,
    y_align: Clutter.ActorAlign.CENTER
  });

  // Create Label (Text) Widget
  let label = new St.Label({
    text: 'FocusBurst',
    style_class: 'panel-menu-label',
    x_align: Clutter.ActorAlign.CENTER,
    y_align: Clutter.ActorAlign.CENTER
  });

  // Create Box Layout to Contain Icon and Label
  let box = new St.BoxLayout({
    style_class: 'panel-menu-box',
    x_align: Clutter.ActorAlign.CENTER,
    y_align: Clutter.ActorAlign.CENTER
  });
  box.add_child(icon);
  box.add_child(label);

  // Add the box to the Panel Button
  indicator.add_child(box);
}
