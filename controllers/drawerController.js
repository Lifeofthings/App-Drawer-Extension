//
// ShineUI
//
// drawerController.js
//

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Clutter from 'gi://Clutter';

import { DrawerView } from '../ui/drawerView.js';
import { DebugOverlay } from './debug/debugOverlay.js';

export class DrawerController {

    constructor() {

        this._drawer = null;
        this._view = null;

        this._progress = 0;
        this._open = false;
        this._animating = false;

        this._monitorChangedId = 0;

        this._debug = null;
    }

    enable() {

        const monitor = Main.layoutManager.primaryMonitor;

        const width = monitor.width;
        const height = Math.round(monitor.height * 0.75);

        this._view = new DrawerView(width, height);

        this._view.onCloseRequested = () => {
            this.hide();
        };

        this._drawer = this._view.actor;

        Main.layoutManager.uiGroup.add_child(this._drawer);

        this._updateGeometry();

        this._debug = new DebugOverlay(this);

        this._monitorChangedId =
            Main.layoutManager.connect(
                'monitors-changed',
                () => this._updateGeometry()
            );
    }

    destroy() {

        if (this._monitorChangedId) {
            Main.layoutManager.disconnect(this._monitorChangedId);
            this._monitorChangedId = 0;
        }

        this._debug = null;

        if (this._drawer) {
            this._drawer.destroy();
            this._drawer = null;
        }

        this._view = null;

        this._progress = 0;
        this._open = false;
        this._animating = false;
    }

    _getOpenY() {

        const monitor = Main.layoutManager.primaryMonitor;

        return (
            monitor.y +
            monitor.height -
            this._drawer.height -
            648
        );
    }

    _getClosedY() {

        const monitor = Main.layoutManager.primaryMonitor;

        return (
            monitor.y +
            monitor.height
        );
    }

    _updateGeometry() {

        if (!this._drawer)
            return;

        const monitor = Main.layoutManager.primaryMonitor;

        const width = monitor.width;
        const height = Math.round(monitor.height * 0.75);

        this._drawer.set_size(width, height);

        const y =
            this._open
                ? this._getOpenY()
                : this._getClosedY();

        this._drawer.set_position(
            monitor.x,
            y
        );

        log(
            `[ShineUI] Monitor ${monitor.width}x${monitor.height} ` +
            `Drawer ${width}x${height} ` +
            `Scale ${global.stage.scale_factor}`
        );
    }

    show() {

        if (!this._drawer)
            return;

        this._updateGeometry();

        if (this._debug)
            this._debug.logGeometry();

        this._drawer.remove_all_transitions();

        this._animating = true;

        this._drawer.ease({

            y: this._getOpenY(),

            duration: 350,

            mode: Clutter.AnimationMode.EASE_OUT_QUAD,

            onComplete: () => {

                this._progress = 1;
                this._open = true;
                this._animating = false;

            }

        });

    }

    hide() {

        if (!this._drawer)
            return;

        this._updateGeometry();

        this._drawer.remove_all_transitions();

        this._animating = true;

        this._drawer.ease({

            y: this._getClosedY(),

            duration: 300,

            mode: Clutter.AnimationMode.EASE_OUT_QUAD,

            onComplete: () => {

                this._progress = 0;
                this._open = false;
                this._animating = false;

            }

        });

    }

    toggle() {

        if (this._open)
            this.hide();
        else
            this.show();

    }

    setProgress(progress) {

        if (!this._drawer)
            return;

        progress = Math.max(0, Math.min(1, progress));

        this._drawer.remove_all_transitions();

        const closedY = this._getClosedY();
        const openY = this._getOpenY();

        this._drawer.y =
            closedY -
            (closedY - openY) * progress;

        this._progress = progress;

        if (progress <= 0)
            this._open = false;
        else if (progress >= 1)
            this._open = true;
    }

    getDrawerHeight() {

        if (!this._drawer)
            return 1;

        return this._drawer.height;
    }

    getProgress() {
        return this._progress;
    }

    isOpen() {
        return this._open;
    }

    isAnimating() {
        return this._animating;
    }

}
