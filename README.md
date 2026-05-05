# ioBroker.vis-newborn

Eine wachsende Sammlung moderner, minimalistischer Smart-Home-Widgets für **ioBroker VIS** und **VIS-2**.

Alle Widgets erscheinen im VIS-Editor unter einer gemeinsamen Palette-Sektion **„newborn"**.

## Enthaltene Widgets

### Newborn Toggle (Slide)
- Slide-Toggle im iOS-Stil
- 1 Datenpunkt für Schalt + Status (Standard) **oder** 2 Datenpunkte (KNX-Modus) mit optionalem Status-Invert
- 3 Größen: small, medium, large
- Status wird live nachgezogen — externe Änderungen am DP aktualisieren das Widget automatisch

### Newborn Dimmer (Tile)
- HomeKit-Style quadratische Kachel
- Kurzer Tap → An/Aus (Toggle)
- Langes Drücken (≥500 ms) → Overlay-Popup mit großem vertikalen Slider (0–100 %)
- 4 Datenpunkte (KNX-tauglich): Schalt-Command, Schalt-Status, Dimm-Command, Dimm-Status
- Slider-Drag mit ~100 ms Throttling, damit der KNX-Bus nicht überrannt wird
- 3 Größen: small, medium, large

## Installation

ioBroker-Admin → **Adapter** → Stiftsymbol (oben rechts) → **Aus eigener URL installieren** → URL eingeben:

```
https://github.com/iqmend/iobroker.vis-newborn
```

Nach der Installation läuft die Adapter-Instanz `vis-newborn.0` *nicht dauerhaft* (das ist korrekt — es ist ein reines Widget-Set ohne Hintergrundprozess).

> Hinweis: Das Adapter-Icon `admin/vis-newborn.png` (128×128) ist optional — solange keines vorhanden ist, zeigt der Admin einen Default-Platzhalter.

## Widgets einfügen

1. VIS-Editor öffnen
2. Linke Seitenleiste → Set-Sektion **„newborn"** öffnen
3. Gewünschtes Widget auf eine View ziehen
4. Rechts in den Eigenschaften die Datenpunkte und Optionen setzen

## Eigenschaften

### Newborn Toggle (Slide)

| Feld | Typ | Wirkung |
|------|-----|---------|
| `oid` | Object-ID | **Schalt-Datenpunkt.** Bei `knx = false` zugleich der Status-Datenpunkt. |
| `size` | small / medium / large | Skaliert Widget-Container und Toggle. Default: `medium`. |
| `knx` | Checkbox | Aktiviert KNX-Modus (zwei Datenpunkte). |
| `oid_status` | Object-ID | **Nur bei `knx = true`:** Datenpunkt für die Statusrückmeldung. |
| `invert_status` | Checkbox | **Nur bei `knx = true`:** Invertiert die Statusanzeige (für Aktoren mit invertierter Rückmeldung). Beim Schreiben wird der Wert ebenfalls gespiegelt. |

### Newborn Dimmer (Tile)

| Feld | Typ | Wirkung |
|------|-----|---------|
| `oid_switch_cmd` | Object-ID | **Schalt-Command.** Tap toggelt — empfängt `true`/`false`. |
| `oid_switch_state` | Object-ID | **Schalt-Status.** An/Aus-Rückmeldung (z. B. KNX-GA für „Status An/Aus"). |
| `oid_dim_cmd` | Object-ID | **Dimm-Command (0–100).** Slider-Drag schreibt absoluten Helligkeitswert. |
| `oid_dim_state` | Object-ID | **Dimm-Status (0–100).** Aktueller Helligkeitswert (live nachgezogen). |
| `name` | Text | Anzeigename der Lampe. Default: `Lampe`. |
| `size` | small / medium / large | Skaliert die Kachel. Default: `medium`. |

## Beispiele

### Toggle — Standard (1 DP)

`oid = 0_userdata.0.lampe`, `size = medium`

### Toggle — KNX (2 DP)

```
knx           = ✓
oid           = knx.0.0.lampe.schalten      (DPT 1.001 — schreiben)
oid_status    = knx.0.0.lampe.status        (DPT 1.001 — Statusrückmeldung)
invert_status = ☐
size          = medium
```

### Dimmer — KNX (4 DP)

```
oid_switch_cmd   = knx.0.0.licht_wz.schalten        (DPT 1.001 — Schalten)
oid_switch_state = knx.0.0.licht_wz.status          (DPT 1.001 — Statusrückmeldung)
oid_dim_cmd      = knx.0.0.licht_wz.dimm_absolut    (DPT 5.001 — 0..100 schreiben)
oid_dim_state    = knx.0.0.licht_wz.dimm_status     (DPT 5.001 — 0..100 lesen)
name             = Wohnzimmer
size             = medium
```

## Architektur

Alle Widgets liegen in **einer** Datei `widgets/newborn.html` als separate `<script class="vis-tpl">`-Templates (kanonisches VIS-Pattern, vgl. `iobroker.vis/www/widgets/basic.html`). Diese Datei muss exakt `newborn.html` heißen — VIS löscht andernfalls beim Start jede `widgets/*.html`, deren Stem nicht zum Adapter-Suffix passt (Quelle: `iobroker.vis/lib/install.js`, Funktion `syncWidgetSets`).

Alle Templates deklarieren `data-vis-set="newborn"` und erscheinen dadurch unter einer gemeinsamen Palette-Sektion „newborn". `vis.binds["newborn"]` ist der gemeinsame JS-Namespace aller Handler (`toggle`, `dimmer`, …).

**Neues Widget hinzufügen:**
1. Neuen `<script class="vis-tpl">`-Block in `widgets/newborn.html` einfügen (mit eindeutiger `id="tpl…"`, `data-vis-set="newborn"`, eigenem `data-vis-name`, eigenen `data-vis-attrs`)
2. Neue Methode auf `vis.binds["newborn"]` im IIFE-Block am Ende der Datei
3. CSS-Klassen mit eigenem Prefix (`vis-newborn-<widget>-…`) in den `<style>`-Block

**Niemals** eine zweite HTML-Datei in `widgets/` ablegen — die würde gelöscht.

## Lizenz

[MIT](LICENSE) © Armend Aliu
