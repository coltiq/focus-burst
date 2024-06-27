import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

// Function to create and return input fields along with their menu items
export function createInputFields(labelText, defaultValue, increment) {
    let menu = new PopupMenu.PopupBaseMenuItem({ reactive: false });
    let label = new St.Label({
        text: labelText,
        y_align: Clutter.ActorAlign.CENTER
    });

    let leftButton = new St.Button({ label: '-', style_class: 'input-button' });
    let rightButton = new St.Button({ label: '+', style_class: 'input-button' });

    let input = new St.Entry({
        style_class: `${labelText.toLowerCase().replace(' ', '-')}-input-box`,
        can_focus: true
    });
    input.clutter_text.set_text(defaultValue); // Set Default Value

    leftButton.connect('clicked', () => {
        let currentValue = parseInt(input.clutter_text.get_text(), 10);
        input.clutter_text.set_text(String(Math.max(0, currentValue - increment)));
    });

    rightButton.connect('clicked', () => {
        let currentValue = parseInt(input.clutter_text.get_text(), 10);
        input.clutter_text.set_text(String(Math.min(999, currentValue + increment)));
    });

    let hbox = new St.BoxLayout({ style_class: 'input-container' });
    hbox.add_child(leftButton);
    hbox.add_child(input);
    hbox.add_child(rightButton);

    menu.add_child(label);
    menu.add_child(hbox);

    return { menu, input };
}