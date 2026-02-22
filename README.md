# Minigram

A minimalist Instagram client for iOS that strips away addictive features so you can check in on friends without getting sucked in.

Minigram wraps Instagram's mobile web interface in a native WKWebView and uses a multi-layered blocking system to remove:

- **Reels** — tab, feed items, and all `/reels/` navigation
- **Explore / Discover** — trending grid and discovery content (search for profiles still works)
- **Suggested & Recommended posts** — "Suggested for you", "Based on your activity", etc.
- **Ads** — sponsored posts, ad API calls, and Facebook tracking pixels
- **"Use the App" banners** — app store prompts and deep links

What's left is your feed from accounts you follow, DMs, and your profile.

## How It Works

Blocking happens at four layers to stay resilient against Instagram's frequent DOM changes:

| Layer | Mechanism | Timing |
|-------|-----------|--------|
| Network rules | WebKit Content Rule List (`BlockingRules.json`) | Before request |
| CSS injection | Style sheet hiding elements (`InjectedCSS.css`) | Document start |
| JS injection | MutationObserver + text scanning (`InjectedScript.js`) | Document end |
| Navigation guard | `WKNavigationDelegate` intercepts blocked URLs | On navigate |

## Requirements

- iOS 17.0+
- Xcode 16+

## Setup

1. Clone the repo
2. Open `Minigram.xcodeproj` in Xcode
3. Select your development team under **Signing & Capabilities**
4. Build and run on your device

## Project Structure

```
├── Minigram.xcodeproj
├── Minigram/
│   ├── MinigamApp.swift       # App entry point
│   ├── ContentView.swift      # Root view
│   ├── WebView.swift          # WKWebView setup + navigation blocking
│   ├── ContentBlocker.swift   # Orchestrates CSS/JS/rule injection
│   ├── BlockingRules.json     # WebKit content rules (network-level)
│   ├── InjectedCSS.css        # CSS element hiding
│   ├── InjectedScript.js      # Dynamic DOM blocking via MutationObserver
│   ├── Instagram.icon         # App icon (Icon Composer)
│   └── Assets.xcassets/       # Colors and asset catalog
└── README.md
```

## License

This project is for personal use. It is not affiliated with or endorsed by Instagram or Meta.
