# ⭐ The Star Jar

A whimsical, interactive web application that lets you shake your phone (or click a button) to draw a random activity star out of a glass jar — like a digital version of an origami wish jar.

---

## ✨ Features

- **Multi-Jar Management & Switching** — Create multiple custom Star Jars for distinct purposes (e.g. *Focus & Productivity*, *Creative Sparks*, *Quick Wins*, *Fun & Games*, or *Custom Blank*). Switch between jars seamlessly anytime.
- **Isolated History & Prompt Sets** — Each jar maintains its own separate pool of folded stars, completed history, and drawer archives.
- **Shake to Draw** — Shake your iPhone or Android phone naturally to rattle the stars and pop open an activity prompt instantly.
- **Calibrated Motion Sensitivity** — Tuned for natural 1–2 second wrist shakes with intelligent touch suppression so tapping buttons, tabs, or menus never triggers accidental shakes.
- **Real-Time 2D Physics & Particle Engine** — Stars drop through the neck with realistic gravity, bounce off glass boundaries, and stack naturally at the bottom.
- **Custom Star Creation** — Fold new stars into any active jar with title, time duration, mood/category (Creative, Productive, Fun, Both), star color, and optional link.
- **Offline & Cloud Sync Resilient** — Works seamlessly offline, as an installed PWA, via local files, or synced in the cloud with user account persistence.
- **Glassmorphism UI** — Rich dark-mode aesthetics featuring frosted glass cards, dynamic lighting, glowing star animations, and a real-time starfield background.
- **PWA & Mobile Ready** — Responsive layout with bottom navigation tabs, drawer menus, and iOS home screen installation support.

---

## 📱 Mobile Shake Sensor

On visiting from a mobile device:
1. Tap **Enable Motion** when prompted to grant iOS / Android accelerometer permissions.
2. Shake your phone naturally with a wrist motion — the jar rattles and your activity star is drawn instantly.
3. Tapping any buttons, modals, or drawers automatically locks the motion sensor for 2.5 seconds to prevent false triggers from screen taps.

---

## 🛠 Local Development

```bash
# Serve with the included Python server (supports SQLite & Cloud Run API)
python3 server.py

# Or open index.html directly in any browser
open index.html
```

For mobile testing over local network:
```bash
# Using localtunnel
npx -y localtunnel --port 8080
```

---

## 🚀 Deploying to Google Cloud Run

The app is containerized with Python 3.11 and Google Cloud Storage persistence. Continuous Deployment is configured via **GitHub Actions** (`.github/workflows/deploy.yml`) on every push to `main`.

### Continuous Deployment (GitHub Actions)

When code is pushed to `main`, GitHub Actions automatically:
1. Authenticates to Google Cloud via Keyless OIDC (Workload Identity).
2. Builds and pushes the Docker container to Google Container Registry (`gcr.io/star-jar-505202/star-jar`).
3. Deploys the service to **Cloud Run** in `us-central1` with unauthenticated access enabled.

### Manual gcloud Deployment (Alternative)

```bash
gcloud run deploy star-jar \
  --source . \
  --platform managed \
  --region us-central1 \
  --project star-jar-505202 \
  --allow-unauthenticated
```

---

## 📁 Project Structure

```
star-jar/
├── index.html          # Main app shell, glassmorphic UI, drawers, modals
├── css/
│   └── style.css       # Design system tokens, glassmorphism, responsive styles
├── js/
│   ├── app.js          # Standalone unified production bundle
│   ├── main.js         # Core application lifecycle & event handlers
│   ├── jar.js          # JarEngine — Canvas 2D physics & particle simulation
│   └── storage.js      # Multi-jar state management, auth & sync engine
├── assets/
│   ├── stars/          # Origami star PNG assets (pink, blue, yellow, etc.)
│   ├── icon-180.png    # iOS home screen icon
│   ├── icon-192.png    # PWA icon
│   └── icon-512.png    # PWA splash icon
├── manifest.json       # Progressive Web App manifest
├── server.py           # Python HTTP server with CORS, SQLite & GCS persistence
├── Dockerfile          # Cloud Run container definition
└── .github/
    └── workflows/
        └── deploy.yml  # Automated CI/CD deployment to Google Cloud Run
```

---

## 📄 License

MIT © 2026 Makaela Harrell
