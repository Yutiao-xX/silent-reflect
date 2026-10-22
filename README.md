# Silent Reflect

### Passive writing trace & reflection for Obsidian

> Silently records how you write, then hands you back what you couldn't see yourself.
> Read-only, non-intrusive, no note is ever modified.

---

![Silent Reflect sidebar panel](docs/screenshot.png)

## Why Silent Reflect?

You write thousands of words in your vault, but you rarely look back at how your ideas actually evolved.
You want a reflection habit, but it takes too much effort to keep up.
You've tried AI note tools, but you're afraid they'll restructure your folders or rewrite your notes without asking.

**Silent Reflect solves this by watching, not editing.** It reads what you write, records how each note changes over time, and generates a structured daily or weekly reflection. Your original notes are never touched — the guarantee is enforced in code, not just in the docs.

---

## What makes it different

Most AI note tools summarize what you wrote. That's an echo — you already knew it.
Silent Reflect looks at **behaviour**: which section you kept rewriting, which task stayed unchecked for eleven days, which conclusion silently flipped.

| | Typical AI note plugin | Silent Reflect |
| :-- | :-- | :-- |
| Input | You feed it material | Your writing behaviour |
| Your action required | Write a prompt, run a command | None |
| Original notes | Re-tagged, restructured | Read-only, guaranteed |
| Output | A summary of content | Behavioural insight, may be empty |

**An empty result is a valid result.** If nothing is worth saying, the insight layer stays empty instead of padding.

---

## Features

| Feature | Details |
| :-- | :-- |
| 🤫 **Fully passive capture** | File events only. No popups, no notifications, no interruption to your writing flow. |
| 🔒 **Strictly read-only** | Writes are hard-blocked to `_Reflection/`. A runtime path assertion throws before any write outside it. |
| 🧩 **Section-level change tracking** | Records which heading section changed, not just that the file changed. This is what makes real insight possible. |
| 📅 **Daily & weekly reflections** | 4 dimensions daily, 6 weekly (adds *thinking trajectory* and *open loops*). |
| 🧠 **Self-vetoing insight layer** | Each candidate is judged; unsupported claims are dropped with a stated reason. |
| 👁️ **Sidebar panel** | Three tabs (Today / Week / Insights), clickable `[[wikilinks]]` back to the source note, one-click regenerate. |
| 🤖 **Optional AI** | Works without a model for capture and screening. Model use is opt-in with your own API key. |
| 🎨 **Native theming** | Uses Obsidian CSS variables only — follows light/dark and custom themes. |

---

## How it works

Silent Reflect is built around one rule: **observe, don't interfere.**

1. **Capture** — records file events and section-level diffs into `_Reflection/_events/YYYY-MM-DD.jsonl`. Append-only, never rewrites.
2. **Screen** — deterministic rules (no model) surface candidates: stalled notes, repeated restarts, churn without closure, contradictions across time.
3. **Reflect** — a model judges each candidate against your own evidence and may reject it.
4. **Read** — the sidebar panel renders the results; links jump back to the original note.

The engine lives outside Obsidian (a Node CLI). The plugin is a thin shell that reads and displays.

**Why the split:** a plugin only exists while Obsidian is open. Passive capture has to keep working when you're away, so generation runs on a system scheduler.

---

## Getting started

### 1. The engine

The plugin displays results; it does not generate them. Point it at an engine directory containing `run.mjs`, then run once:

```powershell
node C:\path\to\engine\run.mjs --vault "C:\path\to\your\vault"
```

Output goes to `<vault>/_Reflection/`.

### 2. The plugin

Copy `main.js`, `manifest.json` and `styles.css` into:

```
<vault>/.obsidian/plugins/silent-reflect/
```

Then enable **Silent Reflect** in Settings → Community plugins.

### 3. Configure

Settings → Silent Reflect:

| Setting | Notes |
| :-- | :-- |
| Engine directory | Where `run.mjs` lives |
| Node path | Obsidian launched from the GUI usually has no `node` on PATH — use an absolute path |
| Regenerate scope | Daily or weekly |

---

## Privacy

- The plugin makes no network requests. It does not upload anything.
- The engine reads `.md` files only; the sole writable directory is `_Reflection/` (asserted at runtime).
- When a model is used, only the candidate entry and its source excerpt are sent — never the whole vault.
- No telemetry, no analytics, no hidden collection.

---

## Platform support

| Component | Windows | macOS / Linux |
| :-- | :-- | :-- |
| Plugin | ✅ | ✅ (desktop only) |
| Engine (Node scripts) | ✅ | ✅ |
| Scheduled generation | ✅ (Task Scheduler) | ⚠️ not packaged yet — use cron/launchd manually |

Mobile is not supported: it has no `adapter.basePath` and cannot spawn a process.

---

## Known limitations

- Chinese UI only at the moment; reflection text follows your notes' language.
- "Regenerate" blocks until finished (up to 5 minutes) and disables the button meanwhile.
- No automatic catch-up: if the machine is off at 22:00, that day is not regenerated later.
- One vault per engine instance.

---

## Contributing

- Bug reports: open an [Issue](https://github.com/Yutiao-xX/silent-reflect/issues).
- Ideas: start a [Discussion](https://github.com/Yutiao-xX/silent-reflect/discussions).

## License

MIT
