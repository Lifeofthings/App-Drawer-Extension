//
// ShineUI
//
// drawerView.js
//

import Gio from 'gi://Gio';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class DrawerView {

    constructor(width, height) {

        this._width = width;
        this._height = height;

        this._isOpen = false;
        this._animating = false;

        this._scrollOffset = 0;

        this._appSystem = Shell.AppSystem.get_default();

        // -------------------------
        // Categories (NEW)
        // -------------------------
        this._categories = ["All", "Internet", "Media", "System", "Utilities", "Games", "Office"];
        this._activeCategory = "All";

        this.background = new St.Widget({
            reactive: true,
            x_expand: true,
            y_expand: true,
            visible: false,
            opacity: 0,
            style: `
                background-color: rgba(0,0,0,0.75);
            `,
        });

        this.background.connect('button-press-event', () => {
            this.close();
            return Clutter.EVENT_STOP;
        });

        Main.layoutManager.addChrome(this.background);

        this.actor = new St.BoxLayout({
            vertical: true,
            reactive: true,
            can_focus: true,
            width,
            height,
            x_expand: true,
            y_expand: false,
            clip_to_allocation: true,
            style: `
                background-color: #303030;
            `,
        });

        this.actor.translation_y = height;

        this._build();
    }

    _build() {

        const handleContainer = new St.BoxLayout({
            x_expand: true,
            x_align: Clutter.ActorAlign.CENTER,
            style: `
                padding-top: 16px;
                padding-bottom: 8px;
            `,
        });

        const handle = new St.Widget({
            width: 64,
            height: 6,
            style: `
                background-color: rgba(255,255,255,0.65);
                border-radius: 999px;
            `,
        });

        handleContainer.add_child(handle);
        this.actor.add_child(handleContainer);

        // -------------------------
        // CATEGORY BAR (NEW)
        // -------------------------
        this._categoryBar = new St.BoxLayout({
            x_expand: true,
            style: `
                spacing: 10px;
                padding: 8px;
            `,
        });

        this.actor.add_child(this._categoryBar);
        this._buildCategories();

        this.content = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            y_expand: true,
            clip_to_allocation: true,
            style: `
                padding: 24px;
            `,
        });

        this.actor.add_child(this.content);

        this._buildAppGrid();
    }

    // -------------------------
    // CATEGORY UI
    // -------------------------
    _buildCategories() {

        this._categoryBar.destroy_all_children();

        for (let cat of this._categories) {

            const btn = new St.Button({
                style_class: 'category-button',
                reactive: true,
            });

            const label = new St.Label({
                text: cat,
            });

            btn.set_child(label);

            btn.connect('clicked', () => {
                this._activeCategory = cat;
                this._rebuildApps();
            });

            this._categoryBar.add_child(btn);
        }
    }

    // -------------------------
    // APP GRID
    // -------------------------
    _buildAppGrid() {

        const grid = new St.Widget({
            layout_manager: new Clutter.GridLayout({
                orientation: Clutter.Orientation.HORIZONTAL,
            }),
            x_expand: true,
            y_expand: true,
            reactive: false,
        });

        this._grid = grid;

        this._grid.connect('scroll-event', (_actor, event) => {

            const direction = event.get_scroll_direction();

            if (direction === Clutter.ScrollDirection.DOWN)
                this._scrollOffset -= 60;
            else if (direction === Clutter.ScrollDirection.UP)
                this._scrollOffset += 60;

            if (this._scrollOffset > 0)
                this._scrollOffset = 0;

            const gridHeight =
                this._grid.get_preferred_height(-1)[1];

            const visibleHeight =
                this.content.get_allocation_box().get_height();

            const maxScroll =
                Math.max(0, gridHeight - visibleHeight);

            if (this._scrollOffset < -maxScroll)
                this._scrollOffset = -maxScroll;

            this._grid.translation_y =
                this._scrollOffset;

            return Clutter.EVENT_STOP;
        });

        this.content.add_child(this._grid);

        this._rebuildApps();
    }

    // -------------------------
    // FILTER + BUILD APPS
    // -------------------------
    _rebuildApps() {

        this._grid.destroy_all_children();

        let apps = this._appSystem.get_installed();

        apps.sort((a, b) =>
            a.get_name().localeCompare(b.get_name())
        );

        // -------------------------
        // FILTER LOGIC
        // -------------------------
        if (this._activeCategory !== "All") {

            apps = apps.filter(app => {

                const id = app.get_id().toLowerCase();

                if (this._activeCategory === "Internet")
                    return id.includes("firefox") || id.includes("chrome");

                if (this._activeCategory === "Media")
                    return id.includes("music") || id.includes("video") || id.includes("vlc");

                if (this._activeCategory === "System")
                    return id.includes("settings") || id.includes("gnome");

                if (this._activeCategory === "Utilities")
                    return id.includes("calc") || id.includes("terminal");

                return true;
            });
        }

        const COLS = 4;
        let row = 0;
        let col = 0;

        for (let app of apps) {

            const icon = new St.Icon({
                gicon: app.get_icon(),
                icon_size: 64,
            });

            const button = new St.Button({
                style_class: 'android-app-icon',
                reactive: true,
                can_focus: true,
            });

            const box = new St.BoxLayout({
                vertical: true,
                x_align: Clutter.ActorAlign.CENTER,
                style: `spacing: 6px;`,
            });

            const label = new St.Label({
                text: app.get_name(),
                x_align: Clutter.ActorAlign.CENTER,
            });

            box.add_child(icon);
            box.add_child(label);
            button.set_child(box);

            button.connect('clicked', () => {

                app.launch(
                    [],
                    global.create_app_launch_context(0, -1)
                );

                this.close();
            });

            this._grid.layout_manager.attach(
                button,
                col,
                row,
                1,
                1
            );

            col++;

            if (col >= COLS) {
                col = 0;
                row++;
            }
        }

        this._grid.queue_relayout();
    }

    open() {

        if (this._isOpen || this._animating)
            return;

        this._animating = true;

        this.background.visible = true;

        this.background.ease({
            opacity: 255,
            duration: 250,
        });

        this.actor.ease({
            translation_y: 0,
            duration: 250,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                this._animating = false;
                this._isOpen = true;
            },
        });
    }

    close() {

        if (!this._isOpen || this._animating)
            return;

        this._animating = true;

        this.background.ease({
            opacity: 0,
            duration: 250,
            onComplete: () => {
                this.background.visible = false;
            },
        });

        this.actor.ease({
            translation_y: this._height,
            duration: 250,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                this._animating = false;
                this._isOpen = false;
            },
        });
    }

    toggle() {
        this._isOpen ? this.close() : this.open();
    }

    isOpen() {
        return this._isOpen;
    }
}
