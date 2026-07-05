//
// ShineUI
//
// debugButton.js
//

import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class DebugButton {

    constructor(drawer) {

        this._drawer = drawer;
        this._button = null;
    }

    enable() {

        this._button = new St.Button({
            style: `
                background: #3b82f6;
                border-radius: 32px;
                min-width: 64px;
                min-height: 64px;
            `,
            reactive: true,
            can_focus: true,
            track_hover: true,
        });

        this._button.set_position(
            global.stage.width - 90,
            global.stage.height - 90
        );

        this._button.connect('clicked', () => {

            log('[Drawer] Debug button');

            this._drawer.toggle();
        });

        Main.layoutManager.uiGroup.add_child(this._button);
    }

    destroy() {

        if (this._button) {
            this._button.destroy();
            this._button = null;
        }
    }
}
