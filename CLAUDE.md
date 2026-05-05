# Claude Projektreferenz — iobroker.vis-newborn

Adapter `iobroker.vis-newborn`: ein wachsendes Widget-Set für ioBroker VIS / VIS-2. Aktuell zwei Widgets (`Newborn Toggle (Slide)`, `Newborn Dimmer (Tile)`), erweiterbar.

## Struktur

| Pfad | Zweck |
|------|-------|
| `widgets/` | Widget-HTML-Dateien (eine pro Widget). Alle deklarieren `data-vis-set="newborn"` → erscheinen unter gemeinsamer Palette-Sektion. |
| `admin/` | Adapter-Admin-Page (leer; reines Widget-Set hat keine Konfiguration). |
| `main.js` | Adapter-Stub, terminiert sofort nach Start (`onlyWWW: true` + `mode: "once"`). |
| `io-package.json` | `common.visWidgets` listet jede Widget-Datei. Neuer Eintrag pro neuem Widget. |
| `docs/rules/` | Geltende Projektregeln. |
| `docs/vis/` | Kanonische Source-Auszüge aus iobroker.vis (Subscription-Mechanik, Toggle-Pattern, Spec). |
| `memory/` | Langfristiges Projektwissen (Lessons Learned, Projektkontext). |

## Wichtige Regeln (Kurzreferenz)

- **VIS-Widget-HTML:** [docs/rules/frontend.md](docs/rules/frontend.md) — `vis.states[id + '.val']`, `vis.states.bind(id + '.val', cb)`, mehrzeilige `{…}`-Blöcke (Template-Substitution!), kein `eval`.
- **Widget-Set-Adapter:** [docs/rules/vis-widget-sets.md](docs/rules/vis-widget-sets.md) — EJS-Pflichtstruktur, `<%= %>`-Delimiter, `class="vis-widget"` am Root, literale `style="width;height"`, `class-binding` und `data-oid`-Carrier-Pattern, **Multi-Widget-Adapter-Abschnitt** (idempotenter Namespace).
- **Sicherheit:** [docs/rules/security.md](docs/rules/security.md) — kein `eval`, keine Secrets im HTML.

## Multi-Widget-Architektur (Kernpunkt)

Der Adapter folgt dem Multi-Widget-Pattern:

1. Eine HTML-Datei pro Widget in `widgets/`
2. Alle deklarieren `data-vis-set="newborn"` → eine Palette-Sektion
3. Gemeinsamer JS-Namespace `vis.binds["newborn"]`, idempotent initialisiert in IIFE-Closure pro Datei:
   ```js
   (function () {
     vis.binds["newborn"] = vis.binds["newborn"] || {};
     var ns = vis.binds["newborn"];
     // closure-private Helpers ...
     ns.<widgetName> = function (el) { /* ... */ };
   })();
   ```
4. CSS-Klassen pro Widget eindeutig prefixen (`vis-newborn-toggle-*` / `vis-newborn-dimmer-*`)
5. Template-IDs (`tpl…`) global eindeutig

Neues Widget hinzufügen: neue `widgets/<name>.html` ablegen + zusätzlichen Eintrag in `io-package.json` `common.visWidgets`. Bestehende Dateien bleiben unangetastet.

## Quellen & Lessons Learned
- [memory/vis-widget-development.md](memory/vis-widget-development.md) — Lessons aus zwei Vorgänger-Adaptern + Konsolidierung
- [memory/PROJECT_MEMORY.md](memory/PROJECT_MEMORY.md) — Projekt-Status, Steps-Log

## Installation (Endnutzer)

ioBroker-Admin → Adapter → Stiftsymbol → „Aus eigener URL installieren" → `https://github.com/iqmend/iobroker.vis-newborn`
