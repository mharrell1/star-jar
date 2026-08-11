# Product Requirement Document: The Activity Jar (StarJar)

## 1. Executive Summary
**StarJar** (working title: *Activity Jar*) is a personal productivity and mindfulness application designed to help users track, organize, and randomly select creative and productive tasks. The core visual metaphor centers around a physical glass jar that fills up with colorful folded origami paper stars as the user inputs tasks. 

When users seek inspiration, they shake the jar, which displays a beautiful popup modal featuring a randomly selected task matching their current time constraints and mental focus (creative, productive, or both).

To enable long-term tracking and multi-device access, the application supports user account creation and cloud database syncing to secure activities and progress across sessions.

---

## 2. Core User Workflows

### 2.1 Task Input (Creating Stars)
*   **Workflow:**
    1.  User clicks the "+" button to add a new activity.
    2.  User enters:
        *   **Title/Description** (e.g., "Sketch a house", "Organize desk drawer").
        *   **Link/Reference** (Optional, e.g., YouTube tutorial, reference blog).
        *   **Time Required** (in minutes, slider or quick-select values: 5m, 15m, 30m, 60m, 120m+).
        *   **Activity Type Category:** `Creative`, `Productive`, `Fun`, or `Both`.
    3.  On save, a mini-animation triggers: a paper star is folded and drops into the virtual jar with a pleasant audio-visual feedback sound and motion.

### 2.2 Task Retrieval (Shaking the Jar & Popup Reveal)
*   **Workflow:**
    1.  User specifies their current availability:
        *   **Time Available** (e.g., "I have 30 minutes").
        *   **Intent/Mode:** `Creative`, `Productive`, `Fun`, or `Both`.
    2.  User shakes the jar. This can be triggered in two ways:
        *   *Desktop/Web:* Clicking and holding to drag/shake the jar on screen.
        *   *Mobile:* Physically shaking the mobile device (utilizing the device's accelerometer).
    3.  The stars inside shake and swirl dynamically.
    4.  A single star is drawn, fading out as a clean, premium popup modal expands onto the screen.
    5.  The popup displays the selected task, time needed, type, and clickable reference links.

### 2.3 Post-Task Resolution (Complete, Return, or Re-draw)
*   **Workflow:**
    1.  On the task popup modal, the user is presented with the following actions:
        *   **Mark as Completed:** Logs the activity in the user's completion history/archive with the exact date and timestamp. The user is then asked:
            *   *Keep in Jar:* Retain the activity star inside the jar for future selections.
            *   *Remove from Jar:* Discard the star from the jar.
        *   **Draw Another (Re-draw):** If the user does not wish to do the suggested task, they can trigger a re-draw. The popup closes, the jar shakes again (which can also be triggered by a physical device shake), and a new matching star is drawn.
        *   **Return to Jar (Close):** Closes the popup and returns the star to the jar without logging completion.

### 2.4 User Accounts & Cloud Syncing
*   **Workflow:**
    1.  **Guest Mode:** By default, new users can start using the jar immediately using local-first storage.
    2.  **Account Registration/Login:** Users can create an account using Email/Password or Third-party OAuth (e.g., Google).
    3.  **Data Synchronization:** Once signed in, any existing local storage data is merged with the cloud database. Any future additions, draws, completions, or deletions sync in real-time across all logged-in devices.

---

## 3. UI/UX & Visual Design System
To create a premium, "wow" factor, the UI should use rich visuals, modern typography, and fluid micro-interactions.

### 3.1 Color Palette & Theme
*   **Background:** Deep night-sky gradients (deep blues, purples, and indigos) to make the glowing stars stand out.
*   **Glass Jar:** Translucent frosted-glass appearance (CSS `backdrop-filter: blur()`) with realistic glossy reflections.
*   **Paper Stars:** Derived directly from the user's reference image `basic paper stars.png`. The app will slice individual 3D origami folded paper stars from the 3x3 grid:
    *   `Creative` / `Productive` / `Both` categories will map to the different color profiles within the grid (e.g. pink/red/yellow for creative, blue/teal/green for productive, purple/lavender/white for both).
    *   Rendered dynamically using CSS sprite backgrounds or HTML5 Canvas coordinates.

### 3.2 Key Animations
*   **Star Drop:** A physics-based drop animation where the star falls from the input area, bounces slightly on the bottom of the jar or other stars, and settles.
*   **Jar Shake:** The jar tilts left and right, and stars inside swirl using CSS keyframes or canvas physics.
*   **Popup Entry:** A smooth scale-in and fade-in animation (glassmorphism look) centered on the screen, presenting the details beautifully.

### 3.3 Typography
*   **Main Display Font (Headers, Popup Text, Input fields):** Olivia Rodrigo's **Just Like Heaven** font. The app will search for a local font file at `assets/fonts/just-like-heaven.woff2` (or `.ttf`/`.otf`).
*   **Vibe Fallback:** A Google Font with a matching whimsical, curly, handwritten aesthetic (such as **Princess Sofia** or **Spirax**) will be used as a web fallback so it functions instantly before a user provides their font file.
*   **Body Text:** A clean, legible modern font (e.g. **Outfit** or **Inter**) to ensure smaller metadata (time tags, links) are easily readable.

---

## 4. Feature Requirements & Technical Specifications

| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | Visual Jar Engine | Render a realistic HTML/CSS or Canvas-based jar that visually fills up with stars as the database grows. | High |
| **FR-02** | Activity Form | Input fields for Name, Link, Time (Slider/Select), and Type Toggle buttons. | High |
| **FR-03** | Filter and Query | Match user criteria (Time Available $\le$ Activity Time, matching Type Category) and randomly pick one. | High |
| **FR-04** | Task Popup | The interactive modal details the activity name, time required, category tag, links, and buttons for Mark Completed, Draw Another, and Close. | High |
| **FR-05** | Persistent Storage | Local storage (`localStorage` or IndexedDB) fallback for non-authenticated users. | High |
| **FR-06** | Star Management | View and edit/delete existing tasks in a "List View" drawer for easy jar maintenance. | Medium |
| **FR-07** | Activity History / Archive | A dedicated drawer or tab to view completed activities sorted by date, details of completion, and category stats. | Medium |
| **FR-08** | Device Shake Detection | Integration of `DeviceMotionEvent` / accelerometer API to detect shake gestures on mobile devices to trigger the draw. Includes permission-request flow for modern iOS/Android browsers. | Medium |
| **FR-09** | User Authentication | Account sign-up, sign-in, password reset, and sign-out interfaces with support for cross-device authentication. | High |
| **FR-10** | Cloud Sync Engine | Backend server or cloud database connection (e.g., Firebase, Supabase, or custom REST/Websocket API) to sync active jar configuration, tasks, and completion history. | High |

---

## 5. Next Steps
1.  **Backend Stack Selection:** Confirm database and auth provider (e.g., Firebase, Supabase, or custom Node/Express backend).
2.  **Implementation Plan:** Define the file structure, database schema, HTML canvas vs CSS-based star rendering, and transition workflows.
