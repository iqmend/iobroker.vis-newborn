# Claude Projektreferenz — iobroker.vis-newborn

Adapter `iobroker.vis-newborn`: ein wachsendes Widget-Set für ioBroker VIS / VIS-2. Aktuell zwei Widgets (`Newborn Toggle (Slide)`, `Newborn Dimmer (Tile)`), erweiterbar.

## Struktur

| Pfad | Zweck |
|------|-------|
| `widgets/newborn.html` | **Eine** HTML-Datei mit allen Widgets als `<script class="vis-tpl">`-Blöcken. Filename-Stem `newborn` muss zum Adapter-Suffix `iobroker.vis-newborn` passen — sonst löscht VIS die Datei (siehe Pflichtregel unten). |
| `admin/` | Adapter-Admin-Page (leer; reines Widget-Set hat keine Konfiguration). |
| `main.js` | Adapter-Stub, terminiert sofort nach Start (`onlyWWW: true` + `mode: "once"`). |
| `io-package.json` | `common.visWidgets` enthält **EINEN** Eintrag mit URL auf `widgets/newborn.html`. Neue Widgets werden in dieselbe Datei geschrieben, nicht als neue Datei angelegt. |
| `docs/rules/` | Geltende Projektregeln. |
| `docs/vis/` | Kanonische Source-Auszüge aus iobroker.vis (Subscription-Mechanik, Toggle-Pattern, Spec). |
| `memory/` | Langfristiges Projektwissen (Lessons Learned, Projektkontext). |

## Wichtige Regeln (Kurzreferenz)

- **VIS-Widget-HTML:** [docs/rules/frontend.md](docs/rules/frontend.md) — `vis.states[id + '.val']`, `vis.states.bind(id + '.val', cb)`, mehrzeilige `{…}`-Blöcke (Template-Substitution!), kein `eval`.
- **Widget-Set-Adapter:** [docs/rules/vis-widget-sets.md](docs/rules/vis-widget-sets.md) — EJS-Pflichtstruktur, `<%= %>`-Delimiter, `class="vis-widget"` am Root, literale `style="width;height"`, `class-binding` und `data-oid`-Carrier-Pattern, **Multi-Widget-Adapter-Abschnitt** (idempotenter Namespace).
- **Sicherheit:** [docs/rules/security.md](docs/rules/security.md) — kein `eval`, keine Secrets im HTML.

## ⚠️ KRITISCH: Filename-Stem-Match

`iobroker.vis/lib/install.js` (Funktion `syncWidgetSets`) **löscht** beim VIS-Start jede `widgets/*.html` aus `iobroker.vis/www/widgets/`, deren Stem nicht exakt zu einem installierten Adapter passt:
```js
const ssName = s.name.toLowerCase();
return ssName === `iobroker.vis-${name}` || ssName === `iobroker.${name}`;
```

Für diesen Adapter `iobroker.vis-newborn` heißt das: **die Widget-Datei MUSS `widgets/newborn.html` heißen** (oder `widgets/vis-newborn.html`). Andere Stems → Datei wird gelöscht → 404 + leere Palette.

Konsequenz: **alle Widgets dieses Adapters wohnen in der einen Datei `widgets/newborn.html`**, jeweils als eigener `<script class="vis-tpl">`-Block. Vorbild: `iobroker.vis/www/widgets/basic.html` (dutzende Widgets in einer Datei).

## Architektur des Multi-Widget-Files

`widgets/newborn.html` enthält:

1. Einen `<style>`-Block mit allen Widget-CSS (pro-Widget-Klassen-Prefixe `vis-newborn-toggle-*`, `vis-newborn-dimmer-*` zur Konfliktvermeidung)
2. Pro Widget einen `<script id="tplNewborn<Widget>" type="text/ejs" class="vis-tpl" data-vis-set="newborn" data-vis-name="..." data-vis-attrs="...">`-Block
3. **Einen** `<script type="text/javascript">`-IIFE-Block mit dem gemeinsamen JS-Namespace:
   ```js
   (function () {
     vis.binds["newborn"] = vis.binds["newborn"] || {};
     var ns = vis.binds["newborn"];
     // closure-private Helpers (isOn, toPct, ...)
     ns.toggle = function (el) { /* widget 1 */ };
     ns.dimmer = function (el) { /* widget 2 */ };
   })();
   ```

`io-package.json` listet einen einzigen `visWidgets`-Eintrag, der auf diese Datei zeigt:
```json
"visWidgets": {
  "newborn": { "name": "newborn", "url": "vis-newborn/widgets/newborn.html" }
}
```

**Neues Widget hinzufügen:** neuen `<script class="vis-tpl">`-Block in `widgets/newborn.html` einfügen + neue Methode auf `vis.binds["newborn"]` im IIFE-Block. **NICHT** eine neue HTML-Datei anlegen — die würde gelöscht.

## Quellen & Lessons Learned
- [memory/vis-widget-development.md](memory/vis-widget-development.md) — Lessons aus zwei Vorgänger-Adaptern + Konsolidierung
- [memory/PROJECT_MEMORY.md](memory/PROJECT_MEMORY.md) — Projekt-Status, Steps-Log

## Installation (Endnutzer)

ioBroker-Admin → Adapter → Stiftsymbol → „Aus eigener URL installieren" → `https://github.com/iqmend/iobroker.vis-newborn`
