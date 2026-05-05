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

### Newborn Licht (Tile)
- HomeKit-Style quadratische Kachel — wie Dimmer-Kachel, nur ohne Helligkeit
- Klick/Tap → An/Aus (Toggle)
- 1 Datenpunkt (Standard): `oid` ist bidirektional (Schalten und Status)
- 2 Datenpunkte (KNX): zusätzlich `oid_status` ausfüllen — wird automatisch als 2-DP-Modus erkannt
- Optional `invert_status` (im 2-DP-Modus spiegelt es beide Richtungen)
- 3 Größen: small, medium, large

### Newborn Jalousie (Tile)
- Hochformat-Kachel im **hellen Cream/Weiß-Theme** mit weißen Outline-Tasten
- Icon + Status-Badge in einer Zeile, Lampenname auf eigener Zeile darunter (bricht auf 2 Zeilen um)
- Zwei Reihen mit Auf/Ab-Tasten (Jalousie + Lamellen) und Stop-Button (so breit wie die Auf/Ab-Tasten zusammen)
- Klick/Tap auf eine Taste → entsprechende Aktion (Jalousie auf/ab, Lamellen auf/ab, Stop)
- Langes Drücken (≥500 ms) irgendwo auf der Kachel → Popup mit **zwei** vertikalen Slidern (Jalousie %, Lamellen %)
- **Slider schreibt erst beim Loslassen** — nicht während des Ziehens (genau ein KNX-Telegramm pro Geste)
- 7 Datenpunkte: Jalousie-Schalt + Position-Cmd/Status, Lamellen-Schalt + Position-Cmd/Status, optional Fenster-Status
- KNX-Konvention: Jalousie/Lamellen `true/1` = ab, `false/0` = auf. Stop-Button schreibt `true` auf den Lamellen-Schalt-DP (KNX: stoppt die Bewegung, bewegt Lamellen einen Schritt)
- **Optional Fenster-Badge** oben rechts: `oid_window_state` ausfüllen → solides rotes „offen" wenn `true`, solides grünes „zu" wenn `false`. Leer lassen = kein Badge.
- Live-Prozente unten auf der Kachel sichtbar
- 3 Größen: small (140×220), medium (170×260), large (210×320)

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

## Eigene Größen (alle Widgets)

Jedes Widget hat zusätzlich zu `size` (small/medium/large) zwei Felder `width` und `height`:

- **Beide Felder leer** → das `size`-Dropdown bestimmt Außenmaße.
- **Eines oder beide gefüllt** → die Custom-Werte gewinnen, das fehlende Feld wird auf den `size`-Default gesetzt.
- **Untergrenze** = jeweilige `small`-Größe (Toggle 110×56, Light/Dimmer 100×100, Jalousie 130×190). Kleinere Werte werden hochgeklemmt.
- Das `size`-Dropdown bestimmt weiterhin die Skalierung der **inneren** Elemente (Icon, Schriftgrößen), damit z. B. `size=medium` mit größeren Außenmaßen sinnvoll kombiniert werden kann.

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

### Newborn Licht (Tile)

| Feld | Typ | Wirkung |
|------|-----|---------|
| `oid` | Object-ID | **Schalt-Datenpunkt.** Bei leerem `oid_status` zugleich der Status-Datenpunkt (1-DP-Modus). |
| `oid_status` | Object-ID | **Optional.** Sobald gesetzt, schaltet das Widget in den **2-DP-/KNX-Modus** um: `oid` wird geschrieben, `oid_status` wird gelesen. Leer lassen für 1-DP-Modus. |
| `invert_status` | Checkbox | **Nur im 2-DP-Modus aktiv.** Spiegelt sowohl Status-Lesen als auch Schalt-Schreiben. |
| `name` | Text | Anzeigename der Lampe. Default: `Licht`. |
| `size` | small / medium / large | Skaliert die Kachel. Default: `medium`. |

### Newborn Jalousie (Tile)

| Feld | Typ | Wirkung |
|------|-----|---------|
| `oid_blinds_cmd` | Object-ID | **Jalousie Schalt-DP** (boolean). `true/1` = ab, `false/0` = auf. Wird beim Klick auf Jalousie ▲/▼ beschrieben. |
| `oid_blinds_pos_cmd` | Object-ID | **Jalousie Position-Cmd** (0–100). Vom Slider beschrieben für absolute Positionierung — nur **bei Slider-Release**, nicht während des Ziehens. |
| `oid_blinds_pos_state` | Object-ID | **Jalousie Position-Status** (0–100). Wird gelesen und live unten links auf der Kachel angezeigt. |
| `oid_slats_cmd` | Object-ID | **Lamellen Schalt-DP** (boolean). `true/1` = ab + Jalousie stop, `false/0` = auf + Jalousie stop. Wird beim Klick auf Lamellen ▲/▼ und auf Stop ⏹ beschrieben (Stop schreibt `true`). |
| `oid_slats_pos_cmd` | Object-ID | **Lamellen Position-Cmd** (0–100). Vom Slider beschrieben — nur bei Release. |
| `oid_slats_pos_state` | Object-ID | **Lamellen Position-Status** (0–100). Wird live unten rechts auf der Kachel angezeigt. |
| `oid_window_state` | Object-ID | **Optional.** Fenster-Status (boolean). Wenn gesetzt: erscheint oben rechts ein Badge — rot „offen" bei `true`, grün „zu" bei `false`. Leer lassen → kein Badge. |
| `name` | Text | Anzeigename, Default `Jalousie`. |
| `size` | small / medium / large | Skaliert die Kachel. Default `medium`. |

> **Hinweis zur fehlenden KNX-Checkbox:** vis 1.5.x unterstützt keine bedingte Sichtbarkeit von Editor-Feldern (`visEditInspect.js:1964`-Parser kennt keinen Conditional-Slot). Statt einer Checkbox + immer sichtbarem `oid_status`-Feld nutzt dieses Widget das natürlichere Auto-Detect-Pattern: setze `oid_status`, wenn du eine separate Statusrückmeldung hast — das ist alles.

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

### Licht — Standard (1 DP)

`oid = 0_userdata.0.lampe`, `name = Wohnzimmer`, `size = medium`. `oid_status` und `invert_status` leer lassen.

### Licht — KNX (2 DP)

```
oid             = knx.0.0.licht_küche.schalten     (DPT 1.001 — Schalten)
oid_status      = knx.0.0.licht_küche.status       (DPT 1.001 — Statusrückmeldung)
invert_status   = ☐
name            = Küche
size            = medium
```

### Jalousie — KNX (6 DP + optionales Fenster-Badge)

```
oid_blinds_cmd       = knx.0.0.jalousie_wz.auf_ab          (DPT 1.008 — true=ab, false=auf)
oid_blinds_pos_cmd   = knx.0.0.jalousie_wz.position_set    (DPT 5.001 — 0..100 schreiben)
oid_blinds_pos_state = knx.0.0.jalousie_wz.position_status (DPT 5.001 — 0..100 lesen)
oid_slats_cmd        = knx.0.0.jalousie_wz.lamelle         (DPT 1.007 — true=ab, false=auf, Stop = true)
oid_slats_pos_cmd    = knx.0.0.jalousie_wz.lamelle_set     (DPT 5.001 — 0..100 schreiben)
oid_slats_pos_state  = knx.0.0.jalousie_wz.lamelle_status  (DPT 5.001 — 0..100 lesen)
oid_window_state     = knx.0.0.fenster_wz.offen            (optional — DPT 1.001 — true=offen=rot, false=zu=grün)
name                 = Wohnzimmer
size                 = medium
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
