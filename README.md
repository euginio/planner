# Daymark Planner

A keyboard-first React planner with task sheets stored in browser local storage.

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

## Tests and builds

Run the unit tests once:

```sh
npm test
```

Create the production build in `dist/`:

```sh
npm run build
```

## Backing up plans

Use **Export backup** in the app header to download all plans and task lists as a
versioned JSON file. Keep the file somewhere safe; it contains your plan data.

Use **Import backup** to restore that file. Plans with matching names are
replaced by the backup, while plans not included in the backup are kept. The app
validates the backup before changing saved data.

Run or build the component workbench:

```sh
npm run storybook
npm run build-storybook
```
