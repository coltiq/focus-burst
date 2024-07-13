import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

// Function to initialize the state in the UI
export function initStateDisplay() {
    let stateLabel = new St.Label({
        text: 'Get Shit Done!', // Initial state
        style_class: 'state-label'
    });

    let box = new St.BoxLayout({
        vertical: false,
        x_expand: true,
        y_expand: true,
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER
    });
    box.add_child(stateLabel);

    let stateMenu = new PopupMenu.PopupBaseMenuItem({ reactive: false });
    stateMenu.add_child(box);

    return { stateMenu, stateLabel };
}
