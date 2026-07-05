//
// ShineUI
//
// debugOverlay.js
//

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class DebugOverlay {

    constructor(drawerController) {

        this._drawerController = drawerController;

    }

    logGeometry() {

        const monitor = Main.layoutManager.primaryMonitor;

        const drawer = this._drawerController._drawer;

        if (!drawer)
            return;

        log("================================");
        log(" ShineUI Debug");
        log("================================");

        log(`Monitor`);
        log(`  x: ${monitor.x}`);
        log(`  y: ${monitor.y}`);
        log(`  width: ${monitor.width}`);
        log(`  height: ${monitor.height}`);

        log("");

        log(`Drawer`);
        log(`  x: ${drawer.x}`);
        log(`  y: ${drawer.y}`);
        log(`  width: ${drawer.width}`);
        log(`  height: ${drawer.height}`);

        log("");

        log(`Stage`);
        log(`  scale: ${global.stage.scale_factor}`);

        log("");

        const fitsHorizontally =
            drawer.x >= monitor.x &&
            drawer.x + drawer.width <= monitor.x + monitor.width;

        const fitsVertically =
            drawer.y >= monitor.y &&
            drawer.y + drawer.height <= monitor.y + monitor.height;

        log(`Fits Horizontally: ${fitsHorizontally}`);
        log(`Fits Vertically:   ${fitsVertically}`);

        log("================================");

    }

}
