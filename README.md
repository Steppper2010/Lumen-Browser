<div align="center">
  <img src="build/icon.png" width="120" alt="Lumen Browser logo" />
  <h1>Lumen Browser</h1>
  <p><strong>A focused Chromium browser with a clean monochrome interface.</strong></p>

  [![CI](https://github.com/Steppper2010/Lumen-Browser/actions/workflows/ci.yml/badge.svg)](https://github.com/Steppper2010/Lumen-Browser/actions/workflows/ci.yml)
  [![Latest release](https://img.shields.io/github/v/release/Steppper2010/Lumen-Browser?display_name=tag)](https://github.com/Steppper2010/Lumen-Browser/releases/latest)
  [![License: MIT](https://img.shields.io/badge/License-MIT-111111.svg)](LICENSE)
  [![Electron](https://img.shields.io/badge/Electron-37-47848F?logo=electron)](https://www.electronjs.org/)

  [Website](https://steppper2010.github.io/Lumen-Browser/) · [Download](https://github.com/Steppper2010/Lumen-Browser/releases/latest) · [Report a bug](https://github.com/Steppper2010/Lumen-Browser/issues/new?template=bug_report.yml)
</div>

---

Lumen is a lightweight desktop browser built with Electron and Chromium. It combines everyday browsing tools with a distinctive, distraction-free interface.

## Highlights

- Chromium-powered browsing with multiple windows and draggable tabs
- Built-in ad blocking, bookmarks, history and download management
- Password storage protected by Electron `safeStorage`
- Proxy configuration and customizable browser settings
- Native Windows builds with a simple installation flow

## Install

Download the latest Windows package from [GitHub Releases](https://github.com/Steppper2010/Lumen-Browser/releases/latest), extract it, and launch `Lumen.exe`.

> Lumen is currently an early-stage project. Review the release notes before upgrading and keep a backup of important browser data.

## Run from source

Requirements: [Node.js 22+](https://nodejs.org/) and [pnpm 10+](https://pnpm.io/).

```bash
git clone https://github.com/Steppper2010/Lumen-Browser.git
cd Lumen-Browser
pnpm install --frozen-lockfile
pnpm start
```

Useful commands:

```bash
pnpm check                 # syntax checks
pnpm pack:win              # unpacked Windows build
pnpm dist:win              # distributable Windows ZIP
pnpm dist:win:installer    # NSIS installer
```

## Project layout

```text
build/                 Application icons
scripts/               Validation and packaging helpers
src/
├── main.js            Electron main process
├── preload.js         Safe renderer bridge
├── adblocker.js       Request filtering
├── password-store.js  Encrypted credential storage
├── settings.js        Persistent preferences
└── renderer/          Browser interface
```

## Roadmap

- Extension support
- Themes and vertical tabs
- Built-in translation
- Optional synchronization
- Performance and privacy improvements

## Contributing

Issues and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a change. For security reports, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## License

Source code is available under the [MIT License](LICENSE). Electron and Chromium notices included in release packages remain subject to their respective licenses.

<div align="center">
  <sub>Built by <a href="https://github.com/Steppper2010">Steppper2010</a>.</sub>
</div>
