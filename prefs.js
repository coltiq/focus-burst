import Adw from "gi://Adw";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

const Settings = new GObject.Class({
  Name: "FocusBurst.Settings",

  _init: function (extensionObject, params) {
    this._extensionObject = extensionObject;
    this.parent(params);

    this._settings = extensionObject.getSettings();

    this.builder = new Gtk.Builder();
    this.builder.set_translation_domain(
      this._extensionObject.metadata["gettext-domain"]
    );
    this.builder.add_from_file(this._extensionObject.path + "/prefs.ui");
    this.widget = this.builder.get_object("prefs-container");

    this._bind_settings();
  },

  _bind_settings: function () {
    let widget;
    let sensors = [
      "work-duration",
      "short-break-duration",
      "long-break-duration",
      "intervals-before-long-break",
    ];

    for (let key in sensors) {
      let sensor = sensors[key];
      widget = this.builder.get_object(sensor);
      widget.set_value(this._settings.get_int(sensor));
      widget.connect("value-changed", (widget) => {
        this._settings.set_int(sensor, widget.get_value());
      });
    }
  },
});

export default class FocusBurstPrefs extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    window._settings = this.getSettings();

    let settings = new Settings(this);
    let widget = settings.widget;

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({});
    group.add(widget);
    page.add(group);
    window.add(page);
    window.set_default_size(widget.width, widget.height);
    widget.show();
  }
}
