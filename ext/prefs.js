
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk'; 


export default class Preferences {
    constructor() {
        this.settings = new Gio.Settings({ schema: 'org.gnome.shell.extensions.focus-burst' });
        console.log("Preferences initialized");
    }

    buildPrefsWidget() {
        let widget = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10, border_width: 10 });

        let workDurationAdjustment = new Gtk.Adjustment({ lower: 1, upper: 120, step_increment: 1 });
        let workDurationSpin = new Gtk.SpinButton({ adjustment: workDurationAdjustment });
        workDurationSpin.set_value(this.settings.get_int('work-duration'));
        workDurationSpin.connect('value-changed', (spin) => {
            this.settings.set_int('work-duration', spin.get_value_as_int());
        });

        let shortBreakDurationAdjustment = new Gtk.Adjustment({ lower: 1, upper: 60, step_increment: 1 });
        let shortBreakDurationSpin = new Gtk.SpinButton({ adjustment: shortBreakDurationAdjustment });
        shortBreakDurationSpin.set_value(this.settings.get_int('short-break-duration'));
        shortBreakDurationSpin.connect('value-changed', (spin) => {
            this.settings.set_int('short-break-duration', spin.get_value_as_int());
        });

        let longBreakDurationAdjustment = new Gtk.Adjustment({ lower: 1, upper: 60, step_increment: 1 });
        let longBreakDurationSpin = new Gtk.SpinButton({ adjustment: longBreakDurationAdjustment });
        longBreakDurationSpin.set_value(this.settings.get_int('long-break-duration'));
        longBreakDurationSpin.connect('value-changed', (spin) => {
            this.settings.set_int('long-break-duration', spin.get_value_as_int());
        });

        let intervalsBeforeLongBreakAdjustment = new Gtk.Adjustment({ lower: 1, upper: 10, step_increment: 1 });
        let intervalsBeforeLongBreakSpin = new Gtk.SpinButton({ adjustment: intervalsBeforeLongBreakAdjustment });
        intervalsBeforeLongBreakSpin.set_value(this.settings.get_int('intervals-before-long-break'));
        intervalsBeforeLongBreakSpin.connect('value-changed', (spin) => {
            this.settings.set_int('intervals-before-long-break', spin.get_value_as_int());
        });

        widget.add(new Gtk.Label({ label: 'Work Duration (minutes)' }));
        widget.add(workDurationSpin);
        widget.add(new Gtk.Label({ label: 'Short Break Duration (minutes)' }));
        widget.add(shortBreakDurationSpin);
        widget.add(new Gtk.Label({ label: 'Long Break Duration (minutes)' }));
        widget.add(longBreakDurationSpin);
        widget.add(new Gtk.Label({ label: 'Intervals Before Long Break' }));
        widget.add(intervalsBeforeLongBreakSpin);

        widget.show_all();

        return widget;
    }

    getSettings() {
        return {
            workDuration: this.settings.get_int('work-duration'),
            shortBreakDuration: this.settings.get_int('short-break-duration'),
            longBreakDuration: this.settings.get_int('long-break-duration'),
            intervalsBeforeLongBreak: this.settings.get_int('intervals-before-long-break')
        };
    }
}

export function init() {
    console.log("Initializing preferences module...");
}
