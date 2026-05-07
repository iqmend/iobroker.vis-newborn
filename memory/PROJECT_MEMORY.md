# iobroker.vis-newborn — Project Memory

## Projektübersicht

Adapter `iobroker.vis-newborn` für ioBroker VIS / VIS-2: eine wachsende Sammlung moderner, minimalistischer Smart-Home-Widgets unter einer gemeinsamen Palette-Sektion „newborn".

- Repo: https://github.com/iqmend/iobroker.vis-newborn
- Lokal: `D:\Claude\Projekte\iobroker-vis-newborn`
- Lizenz: MIT

## Enthaltene Widgets

Alle Widgets liegen in **einer** Datei `widgets/newborn.html` (kanonisches VIS-Pattern, Filename-Stem matcht Adapter-Suffix).

| Widget | Template-ID | Beschreibung |
|--------|-------------|--------------|
| Newborn Toggle (Slide) | `tplNewbornToggle` | Slide-Toggle, 1- oder 2-DP-KNX-Modus, optionaler Status-Invert, 3 Größen |
| Newborn Dimmer (Tile) | `tplNewbornDimmer` | HomeKit-Style Kachel, kurzer Tap = Toggle, Long-Press öffnet Vertikal-Slider-Overlay (4 DPs), 3 Größen |
| Newborn Licht (Tile) | `tplNewbornLight` | HomeKit-Style Kachel, Klick = An/Aus, KNX-Modus per Auto-Detect (oid_status gesetzt = 2-DP), 3 Größen |
| Newborn Jalousie (Tile) | `tplNewbornBlinds` | Hochformat-Kachel im Light-Theme (hellgrau, schwarze Schrift) mit Jalousie + Lamellen Auf/Ab, zentralem Stop, Live-Prozenten. Long-Press = Popup mit zwei vertikalen Slidern (Slider schreibt nur bei Release). 7 OIDs (inkl. optionalem Fenster-Status für Badge oben rechts: offen rot / zu grün) |
| Newborn Camera Tile | `tplNewbornCamera` | Floating-Glass-Kamerakachel: Live-Bild als Hintergrund (MJPEG-Stream oder JPEG-Snapshot mit Refresh), Maximize-Button oben links → Lightbox-Vollbild, vertikale Spalte rechts mit bis zu 4 konfigurierbaren Slots (toggle = Glow bei Aktiv-Status, action = Puls mit konfigurierbarer Dauer). Slots werden ausgeblendet wenn `slot{n}_oid` leer ist. RTSP-Quellen müssen über externen Gateway (go2rtc / MediaMTX / iobroker.cameras) zu HTTP transcodiert werden |

## Architektur (Quintessenz)

- Pro Widget eine HTML-Datei in `widgets/`
- Alle Widget-Files deklarieren `data-vis-set="newborn"` → eine gemeinsame Palette-Sektion
- Gemeinsamer JS-Namespace `vis.binds["newborn"]`, idempotent initialisiert in IIFE-Closure
- Closure-private Helper pro Datei (kein Konflikt zwischen Widgets)
- CSS-Klassen pro Widget eindeutig prefixen
- Erweiterung: neue Datei in `widgets/` + Eintrag in `io-package.json` `common.visWidgets`

Detail siehe [vis-widget-development.md](vis-widget-development.md) und [../docs/rules/vis-widget-sets.md](../docs/rules/vis-widget-sets.md).

## Steps-Log

| Datum | Step | Status |
|-------|------|--------|
| 2026-05-04 | Vorgänger `iobroker.vis-newborn-toggle` v0.1.0 → 0.1.7 entwickelt (Slide-Toggle, 1- & 2-DP-KNX-Modus, 3 Größen) | erledigt |
| 2026-05-04 | VIS-Widget-Set-Spec dokumentiert (`docs/rules/vis-widget-sets.md`, `docs/vis/`) | erledigt |
| 2026-05-05 | Vorläufer-Repo `iobroker.vis-newborn-dimmer` lokal aufgebaut (HomeKit-Style Kachel, Long-Press, Vertikal-Slider) | abgelöst |
| 2026-05-05 | Konsolidierung beider Widgets zu `iobroker.vis-newborn` (gemeinsamer Adapter, Palette-Sektion `newborn`, idempotenter JS-Namespace) | erledigt |
| 2026-05-05 | Repo `iobroker.vis-newborn` initialisiert + erster Push auf GitHub | erledigt |
| 2026-05-05 | v0.1.0 → v0.1.1: Filename-Stem-Match-Bug behoben (beide Widgets in einer `widgets/newborn.html`) | erledigt |
| 2026-05-05 | v0.1.2: jQuery `e.touches`-Bug behoben (`getXY(e)` mit `e.originalEvent`) — Mobile-Touch funktioniert | erledigt |
| 2026-05-05 | v0.1.3: spekulativer Synth-Mouse-Guard + doppelte CSS — zerschossen Klick auf PC und Mobile | abgelöst |
| 2026-05-05 | v0.1.4: Revert auf v0.1.2 funktional | erledigt |
| 2026-05-05 | v0.1.5: Pointer-Events-Migration — Widget rendert nicht mehr in Live-View, SyntaxError im VM-Eval-Kontext (Ursache nicht identifiziert) | abgelöst |
| 2026-05-05 | v0.1.6: Revert auf v0.1.4 funktional → bestätigt funktionierend | erledigt |
| 2026-05-05 | v0.1.7: Neues Widget `Newborn Licht (Tile)` ergänzt — reine An/Aus-Kachel, KNX-Modus per Auto-Detect (oid_status gesetzt = 2-DP). Bedingte Editor-Sichtbarkeit ist in vis 1.5.x nicht unterstützt (Quelle: `visEditInspect.js:1964`-Parser ohne Conditional-Slot), daher KNX-Checkbox weggelassen | erledigt |
| 2026-05-05 | v0.1.8: Neues Widget `Newborn Jalousie (Tile)` ergänzt — Hochformat-Kachel mit Jalousie+Lamellen Auf/Ab + zentralem Stop, Long-Press öffnet Popup mit zwei vertikalen Slidern. 6 OIDs (Schalt + Position-Cmd + Position-Status je für Jalousie und Lamellen). Live-Prozente auf der Kachel | erledigt |
| 2026-05-05 | v0.1.9: Jalousie-Politur — Boolean-Richtung invertiert (true=ab, false=auf, KNX-Konvention), Buttons deutlich vergrößert + bessere Platznutzung, Slider schreibt nur bei Release (Dimmer-Slider gleich mit), 7. OID `oid_window_state` für Fenster-Badge (rot offen / grün zu / leer = kein Badge), Light-Theme (hellgrau + schwarze Schrift) statt Dark-Theme | erledigt |
| 2026-05-05 | v0.1.10: Zwei generische Verbesserungen für alle Widgets — (1) Namen brechen automatisch auf zwei Zeilen um (CSS `line-clamp: 2`) statt mit Ellipse abgeschnitten zu werden, (2) Custom Width/Height in jedem Widget als zusätzliche Editor-Felder, mit Min-Clamp auf jeweilige small-Größe. EJS-Templates haben jetzt einen `<% %>`-Block oben, der per `if (cond) lc = lc;` (ohne Klammern, wegen VIS-`{...}`-Substitution-Falle) die Werte vorbereitet | erledigt |
| 2026-05-05 | v0.1.11: Jalousie Visual-Refresh — Cream/Weiß statt totem Grau, gesättigte Badges (solides Grün/Rot), Buttons als weiße Outline-Pillen, Name auf eigener Zeile unter dem Icon+Badge-Header (umbricht jetzt korrekt auf 2 Zeilen), Stop-Button nur über die Auf/Ab-Spalten (nicht volle Breite). Default-Größen leicht vergrößert (small 140×220, medium 170×260, large 210×320) | erledigt |
| 2026-05-07 | v0.2.0: Neues Widget `Newborn Camera Tile` (`tplNewbornCamera`). Floating-Glass-Card mit Kamera-Bild als Hintergrund + bis zu 4 Aktor-Slots als vertikale Spalte rechts + Maximize-Button oben links (Lightbox-Overlay). Pro Slot konfigurierbar: Datenpunkt, optionaler State-Datenpunkt, Typ (`toggle` = flippt + Glow bei aktiv, `action` = Puls true→false mit konfigurierbarer Dauer Default 500ms), Label, Icon (URL oder Emoji/Text), Aktiv-Farbe, State-Invertierung. Slots werden komplett ausgeblendet wenn `slot{n}_oid` leer ist. Lightbox modul-scoped (nur eine offen über alle Tiles), Close via X / Backdrop-Click / ESC. Camera-URL nimmt MJPEG (Doorbird `bha-api/video.cgi` ohne Refresh) oder Snapshots mit Refresh-Intervall (Cache-Bust via `?_t=Timestamp`). Spec + Plan in `docs/specs/2026-05-07-newborn-camera-tile-{design,plan}.md`, brainstorming-driven. Lessons: MJPEG `multipart/x-mixed-replace` läuft im `<img>` ohne JS-Refresh — der Browser hält die Connection. RTSP geht nicht direkt im Browser, immer Gateway. Pro-Slot-data-* auf den Slot-Buttons selbst (nicht alles auf den Wrap) hält den Loop in JS sauber | **aktiv** |

## Bekannte offene Issues (v0.1.6)

- **A. Long-Press-Selection-Callout am Handy** — beim Halten zeigt iOS/Android kurz einen Selection-Highlight, danach öffnet das Popup. Funktion intakt, nur kosmetisch.
- **B. 1-von-10 Toggle+Popup-Race am Handy** — gelegentlich (~10%) wird beim Long-Press zusätzlich zum Popup auch der Toggle ausgelöst. Vermutlich synthesisierte Mouse-Events nach `touchend`.

Diese werden **nicht** angefasst, bevor der VM-Eval-Pfad in vis 1.5.6 verstanden ist (siehe Lessons unten).

## Offene Aufgaben

- [ ] Adapter-Icon `admin/vis-newborn.png` (128×128) ergänzen
- [ ] Erste produktive Installation am Live-System gegen real laufende KNX-Aktoren testen
- [ ] Weitere Widgets (Roller, Thermostat, Sensor-Card, …) bei Bedarf ergänzen — gleiches Pattern

## Wichtige Links

- Adapter (GitHub): https://github.com/iqmend/iobroker.vis-newborn
- ioBroker Doku: https://www.iobroker.net/#de/documentation
- VIS Widget-Source: https://github.com/ioBroker/ioBroker.vis/tree/master/www
- Vorgänger (abgelöst): https://github.com/iqmend/iobroker.vis-newborn-toggle
