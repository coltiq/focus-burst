import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import St from "gi://St";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";

let focusBurstMenu;

const FocusBurstMenuButton = GObject.registerClass(
  {
    GTypeName: "Gjs_FocusBurstMenuButton",
  },
  class FocusBurstMenuButton extends PanelMenu.Button {
    _init(extensionObject) {
      super._init(Clutter.ActorAlign.FILL);

      this._extension = extensionObject;
      this._settings = extensionObject.getSettings();

      this.add_child(
        new St.Icon({
          icon_name: "alarm-symbolic",
          style_class: "focus-burst-icon",
        })
      );

      this._initializeMenu();
    }

    _initializeMenu() {
      // Round Tracker
      let roundTrackerContainer = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        style_class: "focus-burst-round-tracker-container",
      });

      let roundTrackerLabel = new St.Label({
        text: _("Round 1"),
        style_class: "focus-burst-round-tracker-label",
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
      });
      roundTrackerContainer.actor.add_child(roundTrackerLabel);

      this.menu.addMenuItem(roundTrackerContainer);

      // Control Section
      let controlContainer = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        style_class: "focus-burst-menu-button-container",
      });

      let controlButtonBox = new St.BoxLayout({
        style_class: "focus-burst-button-box",
        vertical: false,
        clip_to_allocation: true,
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER,
        reactive: true,
        x_expand: true,
        pack_start: false,
      });

      // Play Button
      let playButton = this._createRoundButton(
        "media-playback-start-symbolic",
        _("Play")
      );
      playButton.connect("clicked", (self) => {
        Main.notify(_("Play Notification"), _("Play Button Clicked"));
      });
      controlButtonBox.add_child(playButton);

      // Pause Button
      let pauseButton = this._createRoundButton(
        "media-playback-pause-symbolic",
        _("Pause")
      );
      pauseButton.connect("clicked", (self) => {
        Main.notify(_("Pause Notification"), _("Pause Button Clicked"));
      });
      controlButtonBox.add_child(pauseButton);

      // Skip Button
      let skipButton = this._createRoundButton(
        "media-skip-forward-symbolic",
        _("Play")
      );
      skipButton.connect("clicked", (self) => {
        Main.notify(_("Skip Notification"), _("Skip Button Clicked"));
      });
      controlButtonBox.add_child(skipButton);

      controlContainer.actor.add_child(controlButtonBox);

      this.menu.addMenuItem(controlContainer);

      // Separator
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      // Separator
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      // Preferences Section
      let prefsContainer = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        style_class: "focus-burst-menu-button-container",
      });

      let customButtonBox = new St.BoxLayout({
        style_class: "focus-burst-button-box",
        vertical: false,
        clip_to_allocation: true,
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER,
        reactive: true,
        x_expand: true,
        pack_start: false,
      });

      // Refresh Button
      let refreshButton = this._createRoundButton(
        "view-refresh-symbolic",
        _("Refresh")
      );
      refreshButton.connect("clicked", (self) => {
        Main.notify(_("Refresh Notification"), _("Refresh Button Clicked"));
      });
      customButtonBox.add_child(refreshButton);

      // Preferences Button
      let prefsButton = this._createRoundButton(
        "preferences-system-symbolic",
        _("Preferences")
      );
      prefsButton.connect("clicked", (self) => {
        this.menu._getTopMenu().close();
        this._extension.openPreferences();
      });
      customButtonBox.add_child(prefsButton);

      prefsContainer.actor.add_child(customButtonBox);

      this.menu.addMenuItem(prefsContainer);
    }

    _createRoundButton(iconName) {
      let button = new St.Button({
        style_class: "button focus-burst-button-action",
      });

      button.child = new St.Icon({
        icon_name: iconName,
      });

      return button;
    }
  }
);

export default class FocusBurstExtension extends Extension {
  enable() {
    focusBurstMenu = new FocusBurstMenuButton(this);
    Main.panel.addToStatusArea(this.uuid, focusBurstMenu);
  }

  disable() {
    focusBurstMenu?.destroy();
    focusBurstMenu = null;
  }
}
