# Daymark Planner

Daymark is a keyboard-first planner for organizing tasks into named plans and
task lists. Plan data is stored in the current browser's local storage.

## Requirements

- Node.js 22.12 or newer
- npm

## Development

Install dependencies and start the app:

```sh
npm install
npm start
```

Vite serves the app at [http://localhost:4006](http://localhost:4006).

## Using Daymark

### Plans

- Type a plan name in **+ New plan** and press Enter to create it.
- Select a plan name to open it. Use **All plans** to return to the plan
  overview.
- From the overview, use the **×** button beside a plan to delete it. Deleting
  the plan also removes its task lists from browser storage. If storage fails
  during deletion, Daymark attempts to restore the original saved data.
- Plans are local to this browser profile and device. They are not synchronized
  to an account or another browser. Export backups regularly if the data matters.

### Task lists

Each plan has these lists:

| List | Purpose and available actions |
| --- | --- |
| **todos** | Current tasks. Completed tasks can be archived to **done** under a dated heading. Postpone tasks to **backlog**. |
| **backlog** | Deferred tasks. Promote tasks to **todos** or postpone them to **someday**. |
| **fixed** | Reference tasks. **Copy All** copies completed tasks to **todos** and resets their completion state. |
| **microHabits** | Habit tasks. **Reset Completed** marks all tasks in this list as not completed. |
| **someday** | Tasks without a current schedule. Promote them to **backlog**. |
| **done** | Completed tasks and archived task groups. Tasks are read-only here, but can be reordered and marked incomplete. |
| **deleted** | Tasks moved to the deleted list. This list is read-only. |

Some lists start collapsed. Use **show** or **hide** to change their visibility.
The currently active list stays visible. Click a task to focus it and activate
its list. Lists that do not allow adding tasks, such as **done** and **deleted**,
cannot create new tasks with Enter.
On narrow screens, use the grip beside a task to drag it to another position in
the same list. **fixed** and **microHabits** do not support dragging or
Alt+Right task moves.
Cross-list drag-and-drop is not supported; move tasks between lists with the
keyboard shortcuts below.

### Keyboard shortcuts

Shortcuts apply to the focused task unless noted otherwise.

| Key | Action |
| --- | --- |
| Enter | Add a task after the focused task when adding is allowed. If the text cursor is at the very start, add before it. |
| Up / Down | Focus the previous / next task. |
| Ctrl+Home / Ctrl+End | Focus the first / last task in the current list. |
| Alt+Up / Alt+Down | Move the task up / down. At the first or last position, move it to the adjacent configured list when available. |
| Alt+Enter | Toggle task completion when the list allows completion. |
| Tab / Shift+Tab | Indent / unindent. Indentation cannot go below zero. |
| Ctrl+Up / Ctrl+Down | Increase / decrease task size when supported. Size cannot go below one. |
| Shift+Up / Shift+Down | Change task text to uppercase / lowercase. |
| Alt+Right / Alt+Left | Postpone / promote the task when the current list has that destination. In **todos**, Alt+Right moves to **backlog**; in **backlog**, Alt+Left moves to **todos** and Alt+Right moves to **someday**; in **someday**, Alt+Left moves to **backlog**. |
| Backspace / Delete | In lists that allow removal, remove the focused task if it is empty. Add Alt to remove a non-empty task; it is sent to the configured destination, or permanently removed when that destination is `null`. |
| Ctrl+PageUp / Ctrl+PageDown | Move to the previous / next plan. At either end of the plan sequence, this returns to **All plans**. |
| Alt+PageUp / Alt+PageDown | Activate the previous / next task list in the plan. |

### Saving and backups

Changes are saved automatically in the browser's local storage. Clearing browser
site data, changing browser profiles, or using another device can make these
plans unavailable.
Daymark validates saved plans and tasks when loading them. The original
unversioned storage layout is validated and marked as schema version 1 without
rewriting task data. Future schema versions are not opened by older app versions.
If saved data is malformed or the browser cannot read or save it, the app
displays an error. Malformed data is left untouched rather than replaced with
an empty list; import a valid backup to recover plans. A storage write error
means recent changes may not have been saved.

Once per local calendar day, when Daymark has plans available, it automatically
starts a backup download. The app must be open for the download to start; it
cannot run in the background while closed. Your browser may block or prompt for
automatic downloads. Check your Downloads folder, and use the manual export
button if the automatic download was blocked or if you want another backup.

Use **Export backup** in the app header to download all plans and task lists as
a versioned JSON file. Keep the file somewhere safe; it contains your plan data.

Use **Import backup** to restore that file. The app validates the backup version
and contents before changing saved data. Backups from a newer format are
rejected without changing saved data. Plans with matching names are replaced by the backup;
plans not included in the backup are kept. If the file is invalid, the app
reports an error and leaves existing plans unchanged.

## Tests and builds

Run the unit tests once:

```sh
npm test
```

Create the production build in `dist/`:

```sh
npm run build
```

Run or build the component workbench:

```sh
npm run storybook
npm run build-storybook
```
