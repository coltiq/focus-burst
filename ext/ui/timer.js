import St from 'gi://St';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

// Function to initialize the timer in the UI
export function initTimer() {
    let timerLabel = new St.Label({
        text: '00:00',  // You might want to format this as needed
        style_class: 'timer-label'
    });

    let timerMenu = new PopupMenu.PopupBaseMenuItem({ reactive: false });
    timerMenu.add_child(timerLabel);

    return { timerMenu, timerLabel };
}
