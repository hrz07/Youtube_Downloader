# 🎬 Kookaburra

<div align="center">

![Electron](https://img.shields.io/badge/Electron-34.2.0-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Material UI](https://img.shields.io/badge/MUI_v6-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![yt-dlp](https://img.shields.io/badge/Engine-yt--dlp%20%2B%20FFmpeg-FF0000?style=for-the-badge&logo=youtube&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<p align="center">
  <strong>A high-performance, modern universal desktop video downloader built with Electron, React, and Material-UI.</strong><br>
  Featuring an <em>Internet Download Manager (IDM)</em>-inspired multi-stream queue, in-app media player with HTTP Range streaming, resume support, and up to 4K Ultra HD & 320kbps audio extraction.
</p>

<p align="center">
  <a href="#-features">Key Features</a> •
  <a href="#-tech-stack--architecture">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-supported-formats--resolutions">Formats & Quality</a> •
  <a href="#-in-app-media-player">Media Player</a> •
  <a href="#-internationalization-i18n">Languages</a> •
  <a href="#-developer">Developer</a>
</p>

---

</div>

## 🌟 Overview

**Kookaburra** bridges the gap between raw CLI power and sleek, intuitive user experience. Unlike web-based downloaders filled with intrusive ads and bitrate caps, this app runs locally on your machine, leveraging the battle-tested **`yt-dlp`** core and **`FFmpeg`** engine to deliver maximum download speeds, pristine quality up to 4K UHD, and granular download control across thousands of websites.

Designed with **Google Material Design (MUI v6)** and enhanced with smooth glassmorphic elements, dynamic dark/light theme switching, and multi-language support, it provides a desktop downloading experience reminiscent of classic power tools like Internet Download Manager (IDM).

---

## ✨ Features

### 🚀 High-Speed & Resumable Downloads
- **IDM-Style Queue Manager**: Track live speeds (MB/s, KB/s), remaining ETA, downloaded/total file size, and percentage progress in real time.
- **Pause & Resume**: Stop downloads at any time and resume right where you left off via native `--continue` chunk resumption.
- **Cancel & Auto-Cleanup**: Cancel active downloads with instant subprocess termination and removal of incomplete `.part` temporary files.
- **Concurrent Transfers**: Queue multiple downloads simultaneously with organized filtering tabs (**All**, **Active**, **Completed**, **Failed / Cancelled**).

### 🎯 Video & Audio Capabilities
- **Resolutions up to 4K**: Download in **4K (2160p)**, **2K (1440p)**, **1080p Full HD**, **720p HD**, **480p**, and **360p**.
- **High-Bitrate Audio Extraction**: Extract clean, high-fidelity MP3/M4A audio tracks (up to **320 kbps VBR**) directly from any video or music track.
- **Universal Support**: Downloads videos from YouTube, Twitter, Vimeo, Reddit, and thousands of other platforms, as well as direct `.mp4`, `.zip`, `.pdf` and other generic file links via a native high-speed Node.js stream.
- **Automatic Stream Merging**: Automatically combines adaptive high-res video streams (DASH) with separate high-quality audio streams into single, universally compatible `.mp4` containers via bundled FFmpeg.
- **URL Sanitization & Clean-up**: Automatically strips unnecessary tracker tags, playlists, and radio mix parameters. Seamlessly handles `youtube.com/watch?v=...`, `youtu.be/...`, and `youtube.com/shorts/...` links.

### 🎥 Built-in Streaming Media Player
- **In-App Playback**: Watch downloaded videos or listen to audio tracks immediately without leaving the application or needing external players.
- **Local Media Player**: Play **ANY** video or audio file on your computer (`.mp4`, `.mkv`, `.webm`, `.avi`, `.mov`, `.flv`, `.mp3`, `.m4a`, `.wav`, `.flac`) using the native OS file picker.
- **Local HTTP 206 Streaming Server**: Powered by an internal micro-server with HTTP Range header support, enabling smooth seeking, timeline scrubbing, and instant buffer playback without loading massive files into RAM.
- **Player Controls**: Includes timeline scrub bar, play/pause, ±10s quick skip, volume boost/mute, variable playback speed (`0.25x` to `2.0x`), Picture-in-Picture (PiP), and fullscreen toggle.

### 🎨 Modern UI & Customization
- **Theme Modes**: One-click toggle between Dark Mode and Light Mode with persistent local storage.
- **Dynamic Favicon**: Adapts its color profile to match your browser and OS theme for high visibility.
- **Audio Completion Chimes**: Subtle, pleasant audio notification chime whenever a download completes (can be tested or toggled in Settings).
- **Desktop System Integration**: Quick-access buttons to "Open Downloads Folder" or reveal specific files in Windows Explorer / macOS Finder.
- **Dynamic File Icons**: Shows customized UI icons for different downloaded file types (MP4, MP3, PDF, ZIP, Images, etc.) natively in the download queue.

### 🌐 Multi-Language Support (i18n)
Full localization support with one-click dynamic language switcher:
- 🇬🇧 **English**
- 🇧🇩 **Bangla (বাংলা)**
- 🇩🇪 **German (Deutsch)**
- 🇪🇸 **Spanish (Español)**

---

## 🛠 Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Desktop Shell** | [Electron 34](https://www.electronjs.org/) | Cross-platform desktop runtime with secure IPC context isolation |
| **Frontend UI** | [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) | Ultra-fast HMR, component-driven UI, and reactive state management |
| **Design System** | [Material-UI (MUI v6)](https://mui.com/) + [Emotion](https://emotion.sh/) | Modern Google Material Design with custom glassmorphic modals |
| **Download Engine** | [yt-dlp-exec](https://github.com/microlinkhq/yt-dlp-exec) | Direct programmatic wrapper around the powerful `yt-dlp` executable |
| **Media Processing** | [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) | Self-contained static FFmpeg binary for zero-configuration stream muxing |
| **Streaming Player** | [Shaka Player](https://github.com/shaka-project/shaka-player) + HTML5 Media | Resilient playback engine backed by an internal local streaming server |

### Architecture Overview

```mermaid
flowchart TD
    subgraph Frontend [React 18 + MUI v6 (Renderer Process)]
        UI[App UI: Input, Queue, Player, Settings]
        Bridge[Preload Bridge: window.electronAPI]
    end

    subgraph Backend [Electron 34 (Main Process)]
        IPC[IPC Handlers]
        StreamServer[Internal HTTP Streaming Server (Port 0 / Dynamic)]
        ProcessMgr[Subprocess & PID Tree Manager]
    end

    subgraph Engines [Core CLI Engines]
        YTDLP[yt-dlp Engine]
        FFMPEG[FFmpeg Static Muxer]
    end

    subgraph Storage [Local Disk]
        Dest[Downloads Directory]
    end

    UI -->|Invoke analyze / download| Bridge
    Bridge -->|IPC Send / Receive| IPC
    IPC -->|Spawn download subprocess| YTDLP
    YTDLP -->|Pipe adaptive streams| FFMPEG
    FFMPEG -->|Save combined file| Dest
    IPC -->|Progress / Speed / ETA stdout| Bridge
    Dest -->|Serve partial byte ranges| StreamServer
    StreamServer -->|Stream to in-app player| UI
```

---

## 📥 Supported Formats & Resolutions

| Format / Tier | Resolution | Container | Notes |
| :--- | :--- | :--- | :--- |
| **4K Ultra HD** | 3840 × 2160 (2160p) | `.mp4` | Muxed with best available audio stream |
| **2K Quad HD** | 2560 × 1440 (1440p) | `.mp4` | High-definition crisp video |
| **1080p Full HD** | 1920 × 1080 (1080p) | `.mp4` | Standard high-definition standard |
| **720p HD** | 1280 × 720 (720p) | `.mp4` | Balanced file size and quality |
| **480p / 360p** | 854 × 480 / 640 × 360 | `.mp4` | Lightweight, compact formats |
| **Audio Only** | N/A | `.mp3` / `.m4a` | 320 kbps high-bitrate VBR audio extraction |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm** (bundled with Node.js) or **yarn** / **pnpm**
- **Git** ([Download Git](https://git-scm.com/))

> [!NOTE]
> **No external yt-dlp or FFmpeg installation is required!** The application manages its own bundled `yt-dlp` executable and `ffmpeg-static` binaries automatically.

### 1. Clone the Repository
```bash
git clone https://github.com/hrz07/Youtube_Downloader.git
cd Youtube_Downloader
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
Launch both the Vite development server and Electron with live reload:
```bash
npm run dev
```

### 4. Build for Production
To bundle the frontend assets and prepare for distribution:
```bash
npm run build
npm start
```

---

## 📖 How It Works

1. **Paste Link**: Copy any video URL (YouTube, Twitter, Vimeo, etc.) or a direct file URL (e.g. `.mp4`, `.zip`) and paste it into the search bar (or use the convenient 📋 clipboard paste button).
2. **Analyze**: Click **Analyze**. The app parses the metadata, extracts available video heights and formats, and displays the video title, channel name, duration, and thumbnail preview.
3. **Select Quality**: Pick your desired resolution from the dropdown menu (from 360p up to 4K Ultra HD, or Audio Only).
4. **Download**: Hit **Download Now**. The job is added to the IDM queue with real-time transfer telemetry.
5. **Manage & Play**:
   - Pause or resume the transfer at will.
   - Once completed, click the **Play** button to watch it immediately in the built-in media player.
   - Click the **Folder** icon to open the downloaded file directly in your system file manager.

---

## 📂 Project Structure

```
Youtube_Downloader/
├── electron/
│   ├── main.cjs            # Electron main process (IPC handlers, download worker, streaming server)
│   └── preload.cjs         # Context bridge exposing secure electronAPI to renderer
├── public/
│   ├── favicon.png         # High-res application icon
│   ├── favicon-dark.svg    # Optimized SVG icon for dark themes
│   └── favicon-light.svg   # Optimized SVG icon for light themes
├── src/
│   ├── components/
│   │   ├── AboutModal.jsx          # Glassmorphic modal with developer info & tech stack
│   │   ├── DownloadQueue.jsx       # IDM-style queue table with status filters & progress bars
│   │   ├── FlagIcon.jsx            # Dynamic SVG country flags for language selection
│   │   ├── HrzLogo.jsx             # Branding logo with animated hover glow
│   │   ├── LanguageSwitcher.jsx    # Quick language dropdown menu
│   │   ├── MediaPlayerModal.jsx    # Advanced in-app video & audio player with HTTP Range seeking
│   │   ├── SettingsModal.jsx       # User preferences (Theme, Sound, Language)
│   │   ├── UrlInputBar.jsx         # Input field with paste/clear actions and analyze triggers
│   │   └── VideoPreviewCard.jsx    # Thumbnail, metadata card, and quality tier selector
│   ├── i18n/
│   │   └── translations.js         # Multilingual dictionaries (EN, BN, DE, ES)
│   ├── utils/
│   │   └── sound.js                # Web Audio API completion chime generator
│   ├── App.jsx                     # Root React container & IPC state coordinator
│   ├── main.jsx                    # React DOM entrypoint
│   ├── index.css                   # Global styles, fonts, and scrollbars
│   └── theme.js                    # Material-UI dynamic light/dark theme definitions
├── index.html                      # Single-page HTML template
├── package.json                    # Dependencies & build scripts
├── vite.config.js                  # Vite configuration & dev media streaming plugin
└── README.md                       # Documentation
```

---

## ⚙️ Configuration & Settings

| Setting | Options | Description |
| :--- | :--- | :--- |
| **Appearance** | Dark / Light | Switches the Material-UI theme palette and window background |
| **Completion Sound** | Enabled / Disabled | Plays a pleasant synthesizer chime when a download finishes |
| **Language** | English, বাংলা, Deutsch, Español | Translates all UI elements, tooltips, dialogs, and status alerts |
| **Default Download Path** | OS Downloads Directory | Files are organized in `~/Downloads` as `[Title] [Quality].mp4` |

---

## 🛡️ Process Safety & Clean Exits

To avoid orphaned background processes commonly found in CLI wrapper tools:
- **Process Tree Killing**: When pausing, cancelling, or exiting the application, child processes are cleanly terminated across Windows (`taskkill /pid <PID> /T /F`) and POSIX (`SIGKILL`).
- **Temporary File Purging**: Partial `.part` files are automatically cleaned up upon user cancellation to save disk space.
- **Window Close Listener**: Quitting the application gracefully cancels active child streams before shutting down the Electron runtime.

---

## 👨‍💻 Developer

Developed with passion by **Rashedul Islam Hridoy (Hrz07)**.

- **GitHub**: [@hrz07](https://github.com/hrz07)
- **LinkedIn**: [linkedin.com/in/hridoooy](https://www.linkedin.com/in/hridoooy/)
- **Repository**: [hrz07/Youtube_Downloader](https://github.com/hrz07/Youtube_Downloader)

If you find this project useful, don't forget to give it a ⭐ on GitHub!

---

## ⚖️ Disclaimer & License

### Disclaimer
This software is intended for personal and educational use only. Please respect the copyright and Intellectual Property rights of content creators and comply with the [YouTube Terms of Service](https://www.youtube.com/t/terms). The author does not condone or support the unauthorized downloading or distribution of copyrighted material.

### License
This project is open-source and licensed under the **[MIT License](LICENSE)**.