# ⭐ The Star Jar

A whimsical, interactive web app that lets you shake your phone (or click a button) to draw a random activity star out of a glass jar — like a digital version of a jar full of wishes.

---

## ✨ Features

- **Shake to Draw** — Shake your iPhone in any direction (up/down, side-to-side, diagonal, circular) and a star pops out of the jar with an activity suggestion.
- **Instant Popup** — The activity modal appears the moment a shake is detected with zero delay.
- **Omnidirectional Motion Sensor** — High-sensitivity energy accumulator tracks 3D phone movement across all axes so even gentle motion triggers a draw.
- **iOS Shake Permission Pill** — A floating pill prompts iOS users to enable the motion sensor via the native Safari permission dialog.
- **Star Filter Controls** — Filter draws by available time (5–60 min) and mood (creative, productive, or any).
- **Add Your Own Stars** — A full form to add custom activities with title, time, type, color, and optional link.
- **Resolve Stars** — Mark drawn activities as done or skip back to the jar.
- **Glassmorphism UI** — Dark-mode design with frosted-glass cards, smooth animations, and a real-time starfield background.
- **PWA Ready** — Installable to the iOS home screen with a custom app icon.
- **Real-time Physics** — Stars settle into the jar with gravity and turbulence when shaken.

---

## 📱 Mobile Shake Sensor (iOS)

On first visit from an iPhone:
1. A **motion sensor pill** appears at the top of the screen.
2. Tap it to trigger the iOS native permission dialog.
3. Once granted, shake your phone **in any direction** — the jar rattles and your activity pops up instantly.

The shake detection uses a **cumulative motion energy accumulator** with exponential decay:
- Threshold: `1.4` energy units (sensitive to gentle motion)
- Decay rate: `0.94` per frame (energy builds quickly across frames)
- Vertical boost: `×1.25` on the Y-axis for up/down motion
- 2-second cooldown between draws to prevent rapid-fire triggers

---

## 🛠 Local Development

```bash
# Serve with the included no-cache Python server
python3 server.py

# Or open index.html directly in a browser
open index.html
```

For mobile testing over local network or tunnel:
```bash
# Using localtunnel
npx -y localtunnel --port 8000
```

---

## 🚀 Deploying to Google Cloud Run

The app is containerised with **nginx**. The repository has a GitHub Actions workflow that automatically builds and deploys to Cloud Run on every push to `main`.

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `GCLOUD_PROJECT` | Your Google Cloud project ID |
| `GCLOUD_SA_KEY` | Service account JSON key (base64 or raw) |
| `CLOUD_RUN_SERVICE` | Name of your Cloud Run service |
| `CLOUD_RUN_REGION` | Cloud Run region (e.g. `us-central1`) |

### Deploy Steps

1. Set all four secrets in your GitHub repo → **Settings → Secrets → Actions**.
2. Push to `main` — the workflow builds the Docker image, pushes it to Container Registry, and deploys to Cloud Run automatically.

---

## 📁 Project Structure

```
star-jar/
├── index.html          # Main app shell
├── css/
│   └── style.css       # All styles (glassmorphism, animations, responsive)
├── js/
│   ├── app.js          # Main app logic (modals, shake sensor, draw engine)
│   ├── main.js         # Alternate entry point (mirrors app.js)
│   ├── jar.js          # JarEngine — physics, star rendering, shake animation
│   └── storage.js      # LocalStorage CRUD for activities
├── assets/
│   ├── stars/          # Colored star PNG assets
│   ├── icon-180.png    # iOS home screen icon
│   ├── icon-192.png    # PWA icon
│   └── icon-512.png    # PWA splash icon
├── manifest.json       # PWA manifest
├── server.py           # Local dev server with strict no-cache headers
├── Dockerfile          # nginx container for Cloud Run
└── .github/
    └── workflows/
        └── deploy.yml  # Auto-deploy to Cloud Run on push to main
```

---

## License

MIT © 2026 Makaela Harrell
