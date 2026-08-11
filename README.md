# Star Jar

A whimsical web app that lets you draw origami‑style stars inside a glass jar.

## Features
- Real‑time physics animation of stars falling into the jar.
- Mobile shake sensor (iOS) to trigger a star draw.
- Fun category with customizable star colors.

## Local Development
```bash
# Install dependencies (only for bundling)
npm install
# Run a dev server
npm run dev   # or open index.html directly
```

## Deploying to Google Cloud Run
The app is containerised with **nginx**. The repository contains a Dockerfile and a GitHub Actions workflow that builds the container and deploys it to Cloud Run whenever you push to the `main` branch.

1. Set the required GitHub secrets (`GCLOUD_PROJECT`, `GCLOUD_SA_KEY`, `CLOUD_RUN_SERVICE`, `CLOUD_RUN_REGION`).
2. Push to the `main` branch – the workflow will automatically deploy.

## License
MIT © 2026 Makaelaharrell
