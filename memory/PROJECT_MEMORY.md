# iobroker.vis-newborn — Project Memory

## Projektübersicht

Adapter `iobroker.vis-newborn` für ioBroker VIS / VIS-2: eine wachsende Sammlung moderner, minimalistischer Smart-Home-Widgets unter einer gemeinsamen Palette-Sektion „newborn".

- Repo: https://github.com/iqmend/iobroker.vis-newborn
- Lokal: `D:\Claude\Projekte\iobroker-vis-newborn`
- Lizenz: MIT

## Enthaltene Widgets

| Widget | Datei | Beschreibung |
|--------|-------|--------------|
| Newborn Toggle (Slide) | `widgets/newborn-toggle.html` | Slide-Toggle, 1- oder 2-DP-KNX-Modus, optionaler Status-Invert, 3 Größen |
| Newborn Dimmer (Tile) | `widgets/newborn-dimmer.html` | HomeKit-Style Kachel, kurzer Tap = Toggle, Long-Press öffnet Vertikal-Slider-Overlay (4 DPs: switch_cmd/state, dim_cmd/state), 3 Größen |

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
| 2026-05-05 | v0.1.6: Revert auf v0.1.4 funktional → bestätigt funktionierend | **aktiv** |

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
