//
// ShineUI
//
// appGrid.js
//

import St from 'gi://St';
import Shell from 'gi://Shell';
import Clutter from 'gi://Clutter';

export class AppGrid {

    constructor() {

        const appSystem = Shell.AppSystem.get_default();

        this.actor = new St.ScrollView({
            x_expand: true,
            y_expand: true,

            overlay_scrollbars: true,
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,

            reactive: true,
        });

        this.container = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            y_expand: true,
            style: `padding: 24px; spacing: 18px;`,
        });

        this.actor.set_child(this.container);

        this._appSystem = appSystem;

        this._populate();
    }

    refresh() {
        this.container.destroy_all_children();
        this._populate();
    }

    _populate() {

        let apps = this._appSystem.get_installed()
            .filter(a => a && a.should_show());

        apps.sort((a, b) =>
            a.get_name().localeCompare(b.get_name(), undefined, {
                sensitivity: 'base',
            })
        );

        log(`[AppGrid] apps found: ${apps.length}`);

        const COLS = 4;

        let row = null;
        let col = 0;

        for (const app of apps) {

            if (col === 0) {
                row = new St.BoxLayout({
                    x_expand: true,
                    style: `spacing: 18px;`,
                });

                this.container.add_child(row);
            }

            // 🔥 SAFE ICON PATH (IMPORTANT FIX)
            const icon = new St.Icon({
                gicon: app.get_icon(),
                icon_size: 64,
            });

            const button = new St.Button({
                style_class: 'android-app-tile',
                reactive: true,
                can_focus: true,
                track_hover: true,
                width: 96,
                height: 110,
            });

            const label = new St.Label({
                text: app.get_name(),
                style_class: 'android-app-label',
                x_align: Clutter.ActorAlign.CENTER,
            });

            const box = new St.BoxLayout({
                vertical: true,
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER,
                style: `spacing: 6px;`,
            });

            box.add_child(icon);
            box.add_child(label);
            button.set_child(box);

            button.connect('clicked', () => {
                log(`[AppGrid] launching: ${app.get_name()}`);
                app.activate();
            });

            row.add_child(button);

            col++;
            if (col >= COLS)
                col = 0;
        }

        log(`[AppGrid] first app: ${apps[0]?.get_name()}`);
    }
}
