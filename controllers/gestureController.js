//
// ShineUI
//
// gestureController.js
//

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Clutter from 'gi://Clutter';

export class GestureController {

    constructor(drawerController) {

        this._drawer = drawerController;

        this._dragging = false;
        this._startY = 0;

        this._capturedEventId = 0;
        this._touchpadEventId = 0;
    }

    enable() {

        //
        // Touchscreen + mouse gestures
        //
        this._capturedEventId =
            global.stage.connect(
                'captured-event',
                (_actor, event) => {

                    const type = event.type();

                    //
                    // When drawer is open,
                    // let the drawer receive input.
                    //
                    if (this._drawer.isOpen())
                        return Clutter.EVENT_PROPAGATE;

                    //
                    // Gesture start
                    //
                    if (
                        type === Clutter.EventType.TOUCH_BEGIN ||
                        type === Clutter.EventType.BUTTON_PRESS
                    ) {

                        const [, y] = event.get_coords();

                        const monitor =
                            global.display.get_monitor_geometry(
                                global.display.get_primary_monitor()
                            );

                        //
                        // Only allow swipe-open when
                        // no application window has focus.
                        //
                        const inOverview =
                            Main.overview.visible;

                        if (
                            !this._drawer.isOpen() &&
                            inOverview &&
                            y >= monitor.height - 80
                        ) {

                            this._dragging = true;
                            this._startY = y;

                        }

                    }

                    //
                    // Drag update
                    //
                    else if (
                        this._dragging &&
                        (
                            type === Clutter.EventType.TOUCH_UPDATE ||
                            type === Clutter.EventType.MOTION
                        )
                    ) {

                        const [, y] = event.get_coords();

                        const delta =
                            this._startY - y;

                        const drawerHeight =
                            this._drawer.getDrawerHeight();

                        const progress =
                            Math.max(
                                0,
                                Math.min(
                                    1,
                                    delta / drawerHeight
                                )
                            );

                        this._drawer.setProgress(
                            progress
                        );

                        return Clutter.EVENT_STOP;
                    }

                    //
                    // Gesture end
                    //
                    else if (
                        this._dragging &&
                        (
                            type === Clutter.EventType.TOUCH_END ||
                            type === Clutter.EventType.BUTTON_RELEASE
                        )
                    ) {

                        const progress =
                            this._drawer.getProgress();

                        this._dragging = false;

                        if (progress > 0.35)
                            this._drawer.show();
                        else
                            this._drawer.hide();

                        return Clutter.EVENT_STOP;
                    }

                    return Clutter.EVENT_PROPAGATE;
                }
            );

        //
        // Future GNOME 48/49 touchpad support
        //
        this._touchpadEventId =
            global.stage.connect(
                'captured-event::touchpad',
                (_actor, event) => {

                    if (
                        event.type() !==
                        Clutter.EventType.TOUCHPAD_SWIPE
                    )
                        return Clutter.EVENT_PROPAGATE;

                    return Clutter.EVENT_PROPAGATE;
                }
            );

        log('[Drawer] GestureController enabled');
    }

    destroy() {

        if (this._capturedEventId) {

            global.stage.disconnect(
                this._capturedEventId
            );

            this._capturedEventId = 0;

        }

        if (this._touchpadEventId) {

            global.stage.disconnect(
                this._touchpadEventId
            );

            this._touchpadEventId = 0;

        }

        this._dragging = false;
    }
}
