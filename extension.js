//
// ShineUI
//
// extension.js
//

import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { DrawerController } from './controllers/drawerController.js';
import { GestureController } from './controllers/gestureController.js';

const DEBUG_MODE = true;

export default class AndroidAppDrawerExtension extends Extension {

    constructor(metadata) {
        super(metadata);

        this._drawerController = null;
        this._gestureController = null;
        this._button = null;
    }

    enable() {

        log('[ShineUI] Extension enabled');

        this._drawerController = new DrawerController();
        this._drawerController.enable();

        this._gestureController =
            new GestureController(this._drawerController);

        this._gestureController.enable();

        if (DEBUG_MODE)
            log('[ShineUI] Developer Mode Enabled');

        this._button = new St.Button({
            style_class: 'panel-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            label: 'Drawer',
        });

        this._button.connect('clicked', () => {

            if (this._drawerController)
                this._drawerController.toggle();

        });

        Main.panel._rightBox.insert_child_at_index(
            this._button,
            0
        );

        log('[ShineUI] Top Bar Button Added');
    }

    disable() {

        log('[ShineUI] Extension disabled');

        if (this._button) {
            this._button.destroy();
            this._button = null;
        }

        if (this._gestureController) {
            this._gestureController.destroy();
            this._gestureController = null;
        }

        if (this._drawerController) {
            this._drawerController.destroy();
            this._drawerController = null;
        }

        log('[ShineUI] Cleanup Complete');
    }
}
