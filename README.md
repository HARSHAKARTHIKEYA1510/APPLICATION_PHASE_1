# ♫ Terminal Music Player

A fast, lightweight, terminal-based music player built in Node.js that drives **VLC** as its audio engine. Features an interactive terminal user interface, real-time progress bar, playlist navigation, shuffle, and repeat modes.

Zero external npm dependencies — built entirely with native Node.js standard libraries.

---

## 📸 Interface Preview

```text
♫ Terminal Music Player  (VLC backend)  /Users/you/Music

  ▶   1. sample-one
      2. sample-two
      3. acoustic-breeze
      4. summer-walk
   … 24 tracks total

PLAYING  sample-one
████████████████░░░░░░░░░░░░░░░░░░░░░░░░ 0:34 / 1:45
vol 100%  repeat:all

space/p pause · s stop · n next · b prev · ←/→ seek 10s · +/- volume · r repeat all/one/off · z shuffle · 1-9 jump · q quit
```

---

## ✨ Features

- **Zero NPM Dependencies**: Powered purely by standard Node.js modules (`node:child_process`, `node:readline`, `node:fs`, `node:events`).
- **Interactive TUI**: Real-time rendering with ANSI escape codes, dynamic progress bars, and track status indicators.
- **VLC Audio Engine**: Spawns VLC in headless remote-control (`rc`) mode for robust, low-CPU audio decoding.
- **Broad Audio Format Support**: Automatically plays `.mp3`, `.flac`, `.wav`, `.ogg`, `.m4a`, `.aac`, `.opus`, `.wma`, and `.aiff`.
- **Recursive Library Scanner**: Reads all subfolders in your music directory and sorts tracks alphabetically.
- **Playback Controls**:
  - Play, pause, stop, seek forward/backward by 10 seconds.
  - Step volume up/down by 10%.
  - Repeat modes: **Repeat All** → **Repeat One** → **Repeat Off**.
  - Shuffle mode: random track selection without repeating the active track.
  - Number keys (`1`–`9`) for instant jumping to tracks.
- **Clean Process Lifecycle**: Handles `SIGINT`, `SIGTERM`, and `SIGHUP` cleanly, guaranteeing that child VLC processes are never orphaned in the background.

---

## 📋 Requirements

1. **Node.js**: Version `18.0.0` or higher.
2. **VLC Media Player**:
   - **macOS**: [Download from VideoLAN](https://www.videolan.org) or install via Homebrew:
     ```bash
     brew install --cask vlc
     ```
   - **Ubuntu / Debian**:
     ```bash
     sudo apt update && sudo apt install -y vlc
     ```
   - **Fedora / RHEL**:
     ```bash
     sudo dnf install -y vlc
     ```
   - **Windows**: [Download from VideoLAN](https://www.videolan.org) or install via Winget:
     ```powershell
     winget install VideoLAN.VLC
     ```

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/HARSHAKARTHIKEYA1510/APPLICATION_PHASE_1.git
cd APPLICATION_PHASE_1
```

### 2. Start the player
Run with the built-in sample audio files:
```bash
npm start
```
*(or run `node src/index.js` directly)*

### 3. Play your own music
Point the player to any directory on your computer:
```bash
node src/index.js ~/Music
```
Or set the `MUSIC_DIR` environment variable:
```bash
MUSIC_DIR=~/Music npm start
```

---

## ⌨️ Controls & Keybindings

| Key | Action |
|:---|:---|
| <kbd>Space</kbd> / <kbd>p</kbd> / <kbd>Enter</kbd> | Toggle Play / Pause |
| <kbd>s</kbd> | Stop playback |
| <kbd>n</kbd> | Next track |
| <kbd>b</kbd> | Previous track *(or restarts track if >3s in)* |
| <kbd>→</kbd> | Seek forward 10 seconds |
| <kbd>←</kbd> | Seek backward 10 seconds |
| <kbd>+</kbd> / <kbd>=</kbd> | Increase volume (+10%) |
| <kbd>-</kbd> | Decrease volume (-10%) |
| <kbd>r</kbd> | Cycle repeat mode: `all` → `one` → `off` |
| <kbd>z</kbd> | Toggle shuffle mode |
| <kbd>1</kbd> – <kbd>9</kbd> | Jump directly to track 1 through 9 |
| <kbd>q</kbd> / <kbd>Ctrl+C</kbd> | Quit player cleanly |

---

## 🛠️ CLI Options & Flags

```bash
node src/index.js [options] [music-directory]
```

| Flag | Description |
|:---|:---|
| `-h`, `--help` | Show usage instructions, options, and keybindings |
| `-v`, `--version` | Display current version number |

---

## ⚙️ Environment Variables

Copy `.env.example` or export variables in your shell:

| Variable | Description | Default |
|:---|:---|:---|
| `MUSIC_DIR` | Path to directory scanned for audio files | `./music` |
| `VLC_PATH` | Explicit path to the VLC executable binary | Auto-detected |
| `VLC_DEBUG` | File path to write raw VLC stdin/stdout command logs | *(Disabled)* |

### Example with custom settings:
```bash
VLC_DEBUG=./vlc.log MUSIC_DIR=~/Music node src/index.js
```

---

## 🏗️ Architecture & How It Works

```text
 ┌─────────────────────────────────────────────────────────┐
 │                   Node.js Process                       │
 │                                                         │
 │  ┌─────────────────┐       ┌─────────────────────────┐  │
 │  │   readline TUI  │◄─────►│    Playlist & State     │  │
 │  │ (Raw-mode keys) │       │ (Repeat, Shuffle, Vol)  │  │
 │  └─────────────────┘       └────────────┬────────────┘  │
 │                                         │               │
 │                                         ▼               │
 │                             ┌─────────────────────────┐ │
 │                             │    src/vlc.js Wrapper   │ │
 │                             └───────────┬─────────────┘ │
 └─────────────────────────────────────────┼───────────────┘
                                stdin / stdout IPC
                                           │
                                           ▼
 ┌─────────────────────────────────────────────────────────┐
 │                 VLC Child Process                       │
 │                (vlc --intf rc --no-video)               │
 │                                                         │
 │  • Decodes audio formats (.mp3, .flac, .wav, etc.)      │
 │  • Sends status & timeline updates                      │
 │  • Audio output to system speakers                      │
 └─────────────────────────────────────────────────────────┘
```

1. **Child Process IPC**: Node spawns VLC with `--intf rc --no-video --quiet --rc-fake-tty`. Communication happens over standard `stdin` and `stdout`.
2. **Prompt-delimited Protocol**: VLC's `rc` interface outputs `> ` after executing a command. The `Vlc` wrapper uses this delimiter to resolve promises for commands like `status`, `get_time`, and `get_length`.
3. **Generation Counter Pattern**: Rapid keypresses (such as skipping multiple tracks) increment an internal `gen` counter. Any delayed poll response from an older generation is discarded, preventing asynchronous state collisions.

---

## 📁 Project Structure

```text
├── music/                     # Sample audio files (.aiff)
│   ├── sample-one.aiff
│   └── sample-two.aiff
├── src/
│   ├── index.js               # CLI entrypoint, TUI rendering & keypress handling
│   ├── library.js             # Recursive audio scanner and time formatting utilities
│   └── vlc.js                 # VLC child process spawner and rc interface wrapper
├── tests/
│   ├── library.test.js        # Unit tests for scanner & time formatter
│   └── vlc.test.js            # Unit tests for VLC wrapper & binary detection
├── .env.example               # Template for environment variables
├── .gitignore                 # Ignored files (logs, system files, env files)
├── package.json               # Project manifest, CLI scripts & engine specification
└── README.md                  # Comprehensive project documentation
```

---

## 🧪 Testing

Run the automated test suite using Node's built-in test runner:

```bash
npm test
```

Tests cover:
- Audio time formatting (`fmtTime`) across edge cases.
- Directory scanning (`scanLibrary`) including nested directories, alphabetization, and non-audio filtering.
- VLC process wrapper initialization and binary resolution (`findVlc`).

---

## 📄 License

This project is licensed under the [MIT License](package.json).
