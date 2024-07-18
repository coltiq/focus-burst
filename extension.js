import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import St from "gi://St";
import GLib from "gi://GLib";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";

let focusBurstMenu;
let timerId = null;
let remainingDuration = null;

const FocusBurstMenuButton = GObject.registerClass(
  {
    GTypeName: "Gjs_FocusBurstMenuButton",
  },
  class FocusBurstMenuButton extends PanelMenu.Button {
    _init(extensionObject) {
      super._init(Clutter.ActorAlign.FILL);

      this._extension = extensionObject;
      this._settings = extensionObject.getSettings();
      this.roundNumber = 0;
      this.intervalsBeforeLongBreak = this._settings.get_int(
        "intervals-before-long-break"
      );
      this.sequence = this._getSequence();
      this.currentSequenceIndex = 0;
      this.durationLabels = [];

      this.add_child(
        new St.Icon({
          icon_name: "alarm-symbolic",
          style_class: "focus-burst-icon",
        })
      );

      this._initializeMenu();
      this._updateSeparatorVisibility();
    }

    _initializeMenu() {
      // Round Tracker
      let roundTrackerContainer = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        style_class: "focus-burst-round-tracker-container",
      });

      this.roundTrackerLabel = new St.Label({
        text: _("Be Productive!"),
        style_class: "focus-burst-round-tracker-label",
        x_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
      });
      roundTrackerContainer.add_child(this.roundTrackerLabel);

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
        if (this.roundNumber === 0) {
          this._onRoundChange();
        }
        this._startTimer();
      });
      controlButtonBox.add_child(playButton);

      // Pause Button
      let pauseButton = this._createRoundButton(
        "media-playback-pause-symbolic",
        _("Pause")
      );
      pauseButton.connect("clicked", (self) => {
        this._stopTimer();
      });
      controlButtonBox.add_child(pauseButton);

      // Skip Button
      let skipButton = this._createRoundButton(
        "media-skip-forward-symbolic",
        _("Play")
      );
      skipButton.connect("clicked", (self) => {
        if (this.roundNumber === 0) {
          return;
        } else if (this.roundNumber <= this.intervalsBeforeLongBreak) {
          this._onSequenceIndexChange();
          return;
        }
        this._reset();
      });
      controlButtonBox.add_child(skipButton);

      controlContainer.add_child(controlButtonBox);

      this.menu.addMenuItem(controlContainer);

      // Separator
      this.separator = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(this.separator);

      // Time Tracker Section
      this.timerContainer = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        style_class: "focus-burst-timer-container",
      });

      this.timerBox = new St.BoxLayout({
        vertical: true,
        style_class: "focus-burst-timer-box",
        x_expand: true,
        x_align: Clutter.ActorAlign.FILL,
      });

      this.timerContainer.actor.add_child(this.timerBox);
      this.menu.addMenuItem(this.timerContainer);

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
        this._reset();
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

      prefsContainer.add_child(customButtonBox);

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

    _reset() {
      this._stopTimer();
      this.roundNumber = 0;
      this.sequence = this._getSequence();
      this.currentSequenceIndex = 0;
      this.durationLabels = [];

      this.menu.removeAll();
      this._initializeMenu();
    }

    _getSequence() {
      // Accessing this._settings within the method
      let workDuration = this._settings.get_int("work-duration");
      let shortBreakDuration = this._settings.get_int("short-break-duration");
      let longBreakDuration = this._settings.get_int("long-break-duration");

      let sequence = [];
      for (let i = 0; i < this.intervalsBeforeLongBreak; i++) {
        sequence.push({
          type: "Work",
          duration: workDuration,
          icon: "emblem-system-symbolic",
        });
        if (i < this.intervalsBeforeLongBreak - 1) {
          sequence.push({
            type: "Short Break",
            duration: shortBreakDuration,
            icon: "media-playback-pause-symbolic",
          });
        }
      }
      sequence.push({
        type: "Long Break",
        duration: longBreakDuration,
        icon: "media-playback-start-symbolic",
      });

      return sequence;
    }

    _onSequenceIndexChange() {
      this.currentSequenceIndex =
        (this.currentSequenceIndex + 1) % this.sequence.length;
      this._stopTimer();
      remainingDuration =
        this.sequence[this.currentSequenceIndex].duration * 60; // Reset remaining duration to new sequence duration

      // Check if we need to change the round
      if (this.currentSequenceIndex % 2 === 0) {
        if (this.roundNumber >= this.intervalsBeforeLongBreak) {
          this._reset();
        } else {
          this._onRoundChange();
        }
      }

      this._updateTimerContainer();
    }
    _onRoundChange() {
      this.roundNumber += 1;
      this.roundTrackerLabel.set_text(_("Round ") + this.roundNumber);

      this._updateTimerContainer();
      this._updateSeparatorVisibility();
    }

    _updateTimerContainer() {
      this.timerBox.destroy_all_children();
      this.durationLabels = []; // Clear the map when updating the container
      let startIndex = (this.roundNumber - 1) * 2;
      let endIndex = startIndex + 2;

      for (let i = startIndex; i < endIndex && i < this.sequence.length; i++) {
        let item = this.sequence[i];

        let isCurrentSequence = i === this.currentSequenceIndex;

        let itemBox = new St.BoxLayout({
          vertical: false,
          style_class: isCurrentSequence
            ? "focus-burst-timer-item-highlight"
            : "focus-burst-timer-item",
          x_expand: true,
        });

        let itemIcon = new St.Icon({
          icon_name: item.icon,
          style_class: "focus-burst-timer-icon",
        });

        let itemTypeLabel = new St.Label({
          text: ` ${item.type} `,
          style_class: isCurrentSequence
            ? "focus-burst-timer-item-highlight"
            : "focus-burst-timer-type",
          x_align: Clutter.ActorAlign.START,
          x_expand: true,
        });

        let itemDurationLabel = new St.Label({
          text: `${item.duration}:00`,
          style_class: "focus-burst-timer-duration",
          x_align: Clutter.ActorAlign.END,
          x_expand: false,
        });

        // Store reference to the duration label
        this.durationLabels.push(itemDurationLabel);

        itemBox.add_child(itemIcon);
        itemBox.add_child(itemTypeLabel);
        itemBox.add_child(itemDurationLabel);

        this.timerBox.add_child(itemBox);

        if (i != endIndex - 1) {
          // Add a spacer box for spacing between rows
          let spacerBox = new St.BoxLayout({
            style_class: "focus-burst-timer-spacer",
            height: 10, // Adjust the height as needed
          });
          this.timerBox.add_child(spacerBox);
        }
      }
    }

    _updateSeparatorVisibility() {
      if (this.roundNumber === 0) {
        this.separator.actor.hide();
      } else {
        this.separator.actor.show();
      }
    }

    _startTimer() {
      if (timerId) {
        return; // A timer is already running, so do nothing
      }

      let currentDuration =
        remainingDuration !== null
          ? remainingDuration
          : this.sequence[this.currentSequenceIndex].duration * 60;
      remainingDuration = null; // Clear remaining duration as the timer is starting

      timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
        currentDuration--;
        this._updateTimeDisplay(currentDuration);
        if (currentDuration <= 0) {
          this._onSequenceIndexChange();
          this._startTimer();
          return GLib.SOURCE_REMOVE;
        }
        return GLib.SOURCE_CONTINUE;
      });
    }

    _stopTimer() {
      if (timerId) {
        GLib.source_remove(timerId);
        timerId = null;
        remainingDuration =
          this.sequence[this.currentSequenceIndex].duration * 60 -
          this._getElapsedTime(); // Calculate remaining duration
      }
    }

    _getElapsedTime() {
      let elapsedTime = 0;
      let durationText =
        this.durationLabels[this.currentSequenceIndex % 2].text;
      let [minutes, seconds] = durationText.split(":").map(Number);
      elapsedTime =
        this.sequence[this.currentSequenceIndex].duration * 60 -
        (minutes * 60 + seconds);
      return elapsedTime;
    }

    _updateTimeDisplay(currentDuration) {
      let minutes = Math.floor(currentDuration / 60);
      let seconds = currentDuration % 60;
      let timeText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      this.durationLabels[this.currentSequenceIndex % 2].set_text(timeText);
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
