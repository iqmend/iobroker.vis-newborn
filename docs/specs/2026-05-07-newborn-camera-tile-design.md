# Newborn Camera Tile — Design Spec

**Datum:** 2026-05-07
**Autor:** Claude (brainstorming session) + iqmend
**Status:** Approved (pre-implementation)
**Zielversion:** `iobroker.vis-newborn` 0.2.0

---

## 1. Motivation

Die VIS-View „Sicherheit" stapelt heute mehrere Kameras (Doorbird, Außenkameras) untereinander, jeweils mit einem `basic.image`-Widget plus separat positionierten `Newborn Schalter`-Pills daneben (Haustür, Garage, Licht, Alarm). Das Layout zeigt drei Probleme:

1. **Visuelle Inkonsistenz** — riesige farbige Pill-Buttons rechts neben jeder Kamera dominieren die Optik mehr als die Kamerabilder selbst.
2. **Doppelt-Beschriftung** — wenn drei Kameras dasselbe „Licht Aus"-Pattern zeigen, liest das Auge dreimal denselben Text.
3. **Keine Abhängigkeit zwischen Kamera und Aktoren** — Kamera-Image und zugehörige Tür-/Licht-Buttons sind aktuell unabhängige Widgets, leicht verschiebbar, kein semantisches Cluster.

Ziel: **ein wiederverwendbares Widget**, das eine Kamera + bis zu 4 räumlich zugeordnete Aktoren als visuell zusammengehöriges Tile darstellt.

## 2. Architektur

Eingehalten wird die kanonische „Multi-Widget-in-einer-HTML-Datei"-Konvention dieses Adapters (siehe [CLAUDE.md](../../CLAUDE.md) und [docs/rules/vis-widget-sets.md](../rules/vis-widget-sets.md)):

- **Eine** zusätzliche `<script class="vis-tpl">`-Sektion in [widgets/newborn.html](../../widgets/newborn.html), Template-ID `tplNewbornCamera`, `data-vis-set="newborn"`, `data-vis-name="Camera Tile"`.
- Eine zusätzliche Methode `ns.camera = function(el) { ... }` im bestehenden IIFE-Namespace `vis.binds["newborn"]`. Closure-private Helper bleiben in derselben IIFE.
- CSS-Prefix `vis-newborn-camera-*` zur Konfliktvermeidung mit `toggle`/`dimmer`/`schalter`/`taster`/`time-setter`.
- Editor-Labels (deutsch + englisch) in `systemDictionary` am Datei-Anfang.
- **Keine** neue HTML-Datei (würde von `iobroker.vis/lib/install.js syncWidgetSets` gelöscht).
- **Keine** Änderung an [io-package.json](../../io-package.json) `common.visWidgets` — der einzige Eintrag zeigt bereits auf `widgets/newborn.html`.

## 3. Visuelles Layout

Floating-Glass über dem Kamerabild. Maximize getrennt links, Aktoren als vertikale Spalte rechts, vertikal zentriert.

```
┌──────────────────────────────────┐
│ ⛶  Eingang                       │
│                          ╭─────╮ │
│                          │ 🚪  │ │  Slot 1
│                          ╰─────╯ │
│                          ╭─────╮ │
│       Kamera-Bild        │ 🚗  │ │  Slot 2
│       (object-fit:cover) ╰─────╯ │
│                          ╭─────╮ │
│                          │ 💡 ●│ │  Slot 3 (Toggle aktiv = Glow)
│                          ╰─────╯ │
│                          ╭─────╮ │
│                          │ 🔔  │ │  Slot 4
│                          ╰─────╯ │
└──────────────────────────────────┘
```

**Stil-Vorgaben:**
- Card mit `border-radius: 16px`, `overflow: hidden`.
- Kamera-Layer: `<img>` mit `object-fit: cover`, `width: 100%`, `height: 100%`, `position: absolute; inset: 0`.
- Buttons: Glass-Morphism — `background: rgba(255,255,255,0.18)`, `backdrop-filter: blur(8px) saturate(140%)`, `border: 1px solid rgba(255,255,255,0.32)`, weiße Icons.
- Aktiver Toggle-Zustand: `background: var(--slot-color)` (Default `#ffc857` warm-gelb), `box-shadow: 0 0 16px var(--slot-color)`, dunkles Icon für Kontrast.
- Action-Tap-Feedback: 150ms Scale-Down (`transform: scale(0.94)`) + kurzer Color-Flash zur `slot{n}_active_color`, danach zurück zu Default.
- Karten-Größe: per VIS-Editor (`width`/`height` Attribute, VIS-Standard). Default `data-vis-prev` = `380×260`. Kein erzwungenes Aspect-Ratio — User passt Karten-Größe an Kamera-Aspect-Ratio an.
- Buttons skalieren mit Karten-Höhe (CSS `aspect-ratio: 1`, `flex` mit `gap`), bleiben mindestens 44×44px (Touch-Target-Minimum).

## 4. Editor-Attribute

Pflicht- und Optional-Attribute, kommunziert über `data-vis-attrs` im Template und gelabelt in `systemDictionary`.

### Karten-Ebene

| Attribut | Typ | Default | Zweck |
|---|---|---|---|
| `name` | string | "" | Titel oben links (neben Maximize). Leer = kein Titel-Text, Maximize bleibt sichtbar. |
| `camera_url` | string | "" | HTTP-URL: MJPEG-Stream (`multipart/x-mixed-replace`) oder JPEG-Snapshot. Leer = Placeholder-Anzeige. |
| `refresh_seconds` | number | 0 | Refresh-Intervall für Snapshot-URLs (Cache-Bust per `?_t=` Timestamp). `0` = kein JS-Refresh (für MJPEG-Streams, die der Browser nativ rendert — Default). |

### Pro Slot (1..4 — identische Attribute mit Index-Suffix)

| Attribut | Typ | Default | Zweck |
|---|---|---|---|
| `slot{n}_oid` | id | "" | Schreib-Datenpunkt. **Leer = kompletter Slot ausgeblendet** (kein DOM, kein Listener). |
| `slot{n}_state_oid` | id | "" | Lese-Datenpunkt für Live-State (treibt Glow). Leer + `type=toggle` → Fallback auf `slot{n}_oid`. |
| `slot{n}_type` | enum (`toggle`\|`action`) | `toggle` | Toggle: flippt State. Action: Puls. |
| `slot{n}_pulse_ms` | number | 500 | Nur bei `type=action`: Auto-Reset-Verzögerung in ms. Schreibt `true` → wartet → schreibt `false`. |
| `slot{n}_label` | string | "" | A11y `aria-label` + Browser-Tooltip. Empfohlen aber optional. |
| `slot{n}_icon` | string | "" | URL ODER Emoji/Zeichen. Auto-Detect: beginnt mit `http`/`https`/`/`/`./` → `<img src>`; sonst Text-Node. |
| `slot{n}_active_color` | color | `#ffc857` | Glow-Farbe für aktiven Toggle-Zustand. Pro Slot anpassbar (z.B. rot für Alarm, blau für AC). |
| `slot{n}_invert_state` | bool | false | State-Logik invertieren (z.B. wenn DP `true` = aus). |

**Begründung der „leerer oid = ausgeblendet"-Regel:** Direkter User-Wunsch („wenn die Datenpunkte gefüllt sind sollen die buttons angezeigt werden und wenn nicht dann nicht"). Implementierung: in `ns.camera`, vor State-Bind prüfen `if (!data['slot' + n + '_oid']) { slotEl.style.display = 'none'; return; }`.

### Maximize

Kein eigenes Attribut nötig — Maximize ist immer aktiv (Lightbox-Verhalten ist Bestandteil des Widgets, nicht konfigurierbar).

## 5. Datenfluss

### Initialisierung (`ns.camera(el)`)

1. Lese `data-*` Attribute via VIS-Standard `el.data` Object.
2. Wenn `camera_url` leer → graue Placeholder-Karte (siehe §6 Error-Handling), keine weitere Logik.
3. Setze `<img>`-Quelle auf `camera_url`. Bei `refresh_seconds > 0`: `setInterval` der `?_t=Date.now()` an die URL anhängt und `img.src` neu setzt. `clearInterval` an `el` speichern für Cleanup.
4. Pro Slot 1..4:
   - Wenn `slot{n}_oid` leer → Slot-DOM-Element auf `display: none`, return (keine Subscription).
   - Wenn `type=toggle`: `vis.states.bind((slot{n}_state_oid || slot{n}_oid) + '.val', cb)` für Glow-Sync. `cb` toggelt CSS-Klasse `is-active` basierend auf `Boolean(val) XOR invert_state`.
   - Wenn `type=action`: keine Subscription. Click-Handler schreibt `vis.setValue(slot{n}_oid, true)`, dann `setTimeout(() => vis.setValue(slot{n}_oid, false), pulse_ms)`.
5. Click-Handler auf Maximize-Button → ruft `openLightbox()` (siehe §5.2).

### 5.1 Toggle-Tap

```js
const oid = data['slot' + n + '_oid'];
const stateOid = data['slot' + n + '_state_oid'] || oid;
const cur = !!vis.states[stateOid + '.val'];
vis.setValue(oid, !cur);
```

Invert betrifft ausschließlich die *Anzeige* (Glow-Logik in der State-Subscription), nicht die Tap-Aktion. Tap = einfaches Flippen des physischen DP-Werts.

### 5.2 Action-Tap (Puls)

```js
const oid = data['slot' + n + '_oid'];
const ms = parseInt(data['slot' + n + '_pulse_ms'], 10) || 500;
vis.setValue(oid, true);
setTimeout(() => vis.setValue(oid, false), ms);
```

Visuelles Tap-Feedback (CSS-Klasse `is-pulsing`) für `ms` Millisekunden parallel.

### 5.3 Maximize-Lightbox

`openLightbox()`:
1. Erzeuge `<div class="vis-newborn-camera-lightbox">` und hänge an `document.body` an. Position `fixed; inset: 0; z-index: 9999`.
2. Backdrop: `background: rgba(0,0,0,0.92)`, `backdrop-filter: blur(8px)`.
3. Inhalt: zweites `<img>`-Element mit derselben `camera_url`. Bei MJPEG-Streams öffnet das in der Regel eine zweite HTTP-Connection — Doorbird & vergleichbare Embedded-Cams erlauben mehrere parallele Streams; bei Quellen mit harter 1-Connection-Grenze müsste der User auf Snapshot-URL ausweichen.
4. Close-Button (X) oben rechts. Click auf Backdrop → close. ESC-Key (window-Listener, einmalig) → close.
5. `closeLightbox()` entfernt das DOM-Element und den ESC-Listener (Memory-Leak-Vermeidung).

## 6. Error-Handling & Edge Cases

| Fall | Verhalten |
|---|---|
| `camera_url` leer | Graue Karte (`background: #2a2a30`), zentrales Icon „📷" + Text „Keine Kamera". Slots/Max werden nicht gerendert. |
| `camera_url` HTTP-Fehler / unreachable | Browser zeigt Standard-Broken-Image. **Kein** zusätzlicher Retry-Logic im Widget (overengineering — `iobroker.cameras` Adapter ist die Quelle der Wahrheit). |
| Alle 4 Slots leer | Kamera + Maximize, keine Aktoren-Spalte. Korrekt — Karte funktioniert als reiner Viewer. |
| `slot{n}_oid` ungültig (DP existiert nicht) | VIS standardmäßig `vis.states[id + '.val'] === undefined`. Glow bleibt aus, Tap schreibt trotzdem (VIS-Verhalten — User-Fehler erkennbar im Adapter-Log). Kein zusätzliches Validation-UI. |
| `pulse_ms` negativ / nicht-numerisch | Fallback auf 500ms (siehe `parseInt(...) \|\| 500`). |
| Mehrfaches Öffnen der Lightbox | Vor `openLightbox()` prüfen ob bereits ein Lightbox-DOM existiert; wenn ja, ignorieren. Verhindert Doppel-DOM. |
| `el` wird aus DOM entfernt (View-Wechsel) | `setInterval` für Refresh muss aufgeräumt werden. Speichern als `el._newbornCameraInterval`, cleanup über VIS-Lifecycle-Hook (`destroyHandler`) wenn vorhanden. Sonst Worst-Case: Interval läuft weiter aber `img.src`-Set auf detached Element ist no-op. |

## 7. Versionierung & Release

- **Version-Bump:** `0.1.22 → 0.2.0` (neues Widget = Minor nach SemVer; kein Breaking-Change an bestehenden Widgets).
- **Files mit Bump:** [package.json](../../package.json), [io-package.json](../../io-package.json) (`common.version`).
- **News-Entry** in `io-package.json` `common.news["0.2.0"]`:
  - DE: `"v0.2.0: neues Widget Newborn Camera Tile (Kamera + bis zu 4 Toggle/Action-Slots, Lightbox-Maximize)"`
  - EN: `"v0.2.0: new widget Newborn Camera Tile (camera + up to 4 toggle/action slots, lightbox maximize)"`
- **Memory-Update:** [memory/PROJECT_MEMORY.md](../../memory/PROJECT_MEMORY.md) Step-Log fortschreiben.
- **Git-Tag** + GitHub-Release optional (User-Entscheidung).

## 8. Testing (manuell)

VIS-Widgets sind nicht automatisiert testbar (kein Headless-Renderer für VIS-Engine). Manuelle Test-Matrix:

| Test | Erwartung |
|---|---|
| Widget erscheint in VIS-Editor-Palette unter „newborn" | ✅ Sichtbar mit Vorschau-Bild |
| Konfiguration mit 0/1/2/3/4 Slots | Layout stabil, ausgeblendete Slots erzeugen kein Loch (Spalte zentriert) |
| Doorbird MJPEG-URL `http://192.168.222.12/bha-api/video.cgi?http-user=...` | Live-Stream läuft ohne Flicker, `refresh_seconds=0` |
| Statischer JPEG-Snapshot mit `refresh_seconds=5` | Bild wird alle 5s neu geladen (im Network-Tab erkennbar) |
| Toggle-Slot mit Lichts-DP — anderer Client schaltet Licht | Glow synchronisiert sich live |
| Action-Slot — Tap | DP `true` → 500ms später `false` (im ioBroker-Objekt-Log oder JS-Adapter-Log prüfbar) |
| Action-Slot mit `pulse_ms=1500` | Pulse-Dauer entsprechend angepasst |
| `invert_state=true` auf Toggle | Glow-Logik invertiert |
| Maximize öffnet Lightbox, X schließt, Backdrop-Klick schließt, ESC schließt | Alle drei Close-Pfade funktionieren, kein Doppel-DOM bei Mehrfach-Open |
| Memory-Leak: Lightbox 20× öffnen+schließen, Browser-DevTools Memory | Keine wachsende Listener-/DOM-Anzahl |
| `camera_url` leer | Placeholder „📷 Keine Kamera" sichtbar, Slots/Max nicht gerendert |
| Mehrere Camera-Tiles auf einer View (3 Kameras = aktueller Use-Case) | Jede Karte unabhängig, Glow-Updates pro Karte korrekt |
| VIS-Editor: Attribut-Labels korrekt deutsch/englisch | Keine `slot1_oid:` Roh-Strings sichtbar |

## 9. Out-of-Scope (explizit nicht enthalten)

Diese Punkte wurden während des Brainstormings diskutiert und bewusst **nicht** Teil dieses Specs:

- **HLS / WebRTC / RTSP-Direktwiedergabe** im Widget. RTSP-User müssen einen externen Gateway (`go2rtc`, `MediaMTX`, `iobroker.cameras` RTSP→Snapshot) betreiben und die HTTP-URL ins Widget eintragen.
- **Untertitel / Subtext-Feld** im Header (User wählte „nur Titel — minimal").
- **Status-Zeile** unten links (z.B. „Bewegung 14:32"). State entsteht ausschließlich über Button-Glow.
- **Mehr als 4 Slots** oder **dynamisches Wrap**. Fester Slot-Count = stabileres Layout, einfachere Editor-UX.
- **Per-Slot-Maximize-Override** (z.B. „Slot 3 zeigt Lightbox mit anderer URL"). Maximize zeigt immer `camera_url`.
- **`oid_camera_url`** (datenpunkt-getriebene Kamera-URL). User wählte „nur statische URL" für minimale Editor-Felder.
- **Kein** Rückwärtskompatibilitäts-Hack zu existierenden `Newborn Schalter`-Widgets — dieses Widget ist additiv und ersetzt nichts.

## 10. Implementations-Reihenfolge (für nachfolgenden Plan)

1. `systemDictionary` in [widgets/newborn.html](../../widgets/newborn.html) um neue Attribut-Labels (DE/EN) erweitern.
2. `<style>`-Block um `.vis-newborn-camera-*` Regeln erweitern (Card, Image-Layer, Maximize-Button, Slot-Column, Slot-Button + States, Lightbox-Overlay, Placeholder-Empty).
3. Neuen `<script class="vis-tpl" id="tplNewbornCamera">` Block einfügen mit EJS-Template (Pflicht: `class="vis-widget"` Root, literales `style="width:<%= data.attr('width') %>; height:<%= data.attr('height') %>"`, `data-oid` Carrier-Pattern wo passend, vier Slot-Blöcke per EJS-Loop oder hartkodiert).
4. `data-vis-attrs` Liste erweitern um alle in §4 definierten Attribute.
5. `data-vis-prev` mit Mini-Vorschau setzen (z.B. ein 64×40 SVG mit Mini-Kamera-Symbol + 4 Punkten).
6. `ns.camera = function(el) { ... }` im IIFE-Block ergänzen, mit closure-private `openLightbox`/`closeLightbox` Helpers (oder als ns-private-Funktionen falls von mehreren Widgets nutzbar — aktuell nicht).
7. Version in [io-package.json](../../io-package.json) und [package.json](../../package.json) auf `0.2.0` heben + News-Entry.
8. [memory/PROJECT_MEMORY.md](../../memory/PROJECT_MEMORY.md) Step-Log aktualisieren.
9. Manuelle Test-Matrix aus §8 durchgehen (im laufenden VIS-Editor).
10. Commit + Push.
