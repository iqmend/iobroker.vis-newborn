# Newborn Camera Tile — Implementation Plan

**Datum:** 2026-05-07
**Spec-Referenz:** [2026-05-07-newborn-camera-tile-design.md](2026-05-07-newborn-camera-tile-design.md)
**Ziel-Version:** `iobroker.vis-newborn` 0.2.0
**Branch:** `main` (kleiner Scope, ein Commit pro Phase)

Vier Phasen. Nach jeder Phase ist ein sichtbares, testbares Zwischenergebnis im VIS-Editor erreichbar — das hilft Probleme früh zu erkennen.

---

## Phase 1 — Skeleton (Widget existiert, leer)

**Ziel:** Widget erscheint in der VIS-Palette unter „newborn" als „Camera Tile". Beim Drop auf eine View entsteht eine leere Glas-Karte mit korrekten Dimensionen. Keine Funktionalität.

### Schritte

1. **systemDictionary-Erweiterung** in [widgets/newborn.html](../../widgets/newborn.html) (ca. Zeile 23-71):
   - Neue Block-Sektion `// ---- Camera Tile ----` direkt unter `// ---- Schalter ----`.
   - Pro Attribut aus Spec §4 ein DE/EN-Eintrag: `camera_url`, `refresh_seconds`, `slot1_oid` … `slot4_invert_state`.
   - Wiederverwenden was möglich: `name`, `width`, `height` sind schon registriert.

2. **CSS-Block** im `<style>` (am Ende, hinter Schalter/Taster/Time-Setter):
   - `.vis-newborn-camera` Wrapper (Card-Hülle, Border-Radius, Overflow-Hidden, Background-Fallback).
   - `.vis-newborn-camera__img` (Camera-Layer).
   - `.vis-newborn-camera__title` (Titel oben links).
   - `.vis-newborn-camera__max` (Maximize-Button oben links nach Titel).
   - `.vis-newborn-camera__slots` (rechte Spalte, flex-column, gap, vertikal zentriert).
   - `.vis-newborn-camera__slot` (Glas-Button-Basis).
   - `.vis-newborn-camera__slot.is-active` (Glow-Zustand).
   - `.vis-newborn-camera__slot.is-pulsing` (Action-Tap-Feedback).
   - `.vis-newborn-camera__slot--hidden` (`display: none`).
   - `.vis-newborn-camera__placeholder` (Empty-Camera-Fallback, graues Icon).
   - `.vis-newborn-camera-lightbox` + `.vis-newborn-camera-lightbox__inner` + `.vis-newborn-camera-lightbox__close` (Overlay-Stile, `position: fixed`, z-index hoch).

3. **Template-Block** als neuer `<script class="vis-tpl">` direkt vor dem IIFE-`<script type="text/javascript">`:
   ```ejs
   <script id="tplNewbornCamera" type="text/ejs"
           class="vis-tpl"
           data-vis-set="newborn"
           data-vis-name="Camera Tile"
           data-vis-attrs="name;camera_url;refresh_seconds[0]/number;
                           slot1_oid/id;slot1_state_oid/id;slot1_type[toggle]/select,toggle,action;slot1_pulse_ms[500]/number;slot1_label;slot1_icon;slot1_active_color[#ffc857]/color;slot1_invert_state/checkbox;
                           slot2_oid/id;slot2_state_oid/id;slot2_type[toggle]/select,toggle,action;slot2_pulse_ms[500]/number;slot2_label;slot2_icon;slot2_active_color[#ffc857]/color;slot2_invert_state/checkbox;
                           slot3_oid/id;slot3_state_oid/id;slot3_type[toggle]/select,toggle,action;slot3_pulse_ms[500]/number;slot3_label;slot3_icon;slot3_active_color[#ffc857]/color;slot3_invert_state/checkbox;
                           slot4_oid/id;slot4_state_oid/id;slot4_type[toggle]/select,toggle,action;slot4_pulse_ms[500]/number;slot4_label;slot4_icon;slot4_active_color[#ffc857]/color;slot4_invert_state/checkbox"
           data-vis-prev='<div style="width:64px;height:40px;border-radius:6px;background:linear-gradient(135deg,#3a4a5a,#2a3340);position:relative;"><div style="position:absolute;right:4px;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:#ffc857;box-shadow:0 0 0 3px rgba(255,200,87,0.25);"></div></div>'>
     <div class="vis-widget {style.css-class}" data-vis-name="Camera Tile" data-vis-set="newborn"
          style="width: <%= data.attr('width') %>; height: <%= data.attr('height') %>"
          id="<%= this.data.wid %>">
       <div class="vis-newborn-camera">
         <!-- camera image -->
         <img class="vis-newborn-camera__img" alt="" />
         <!-- placeholder shown when no camera_url -->
         <div class="vis-newborn-camera__placeholder">📷 Keine Kamera</div>
         <!-- top-left controls: max + title -->
         <div class="vis-newborn-camera__topbar">
           <button class="vis-newborn-camera__max" type="button" aria-label="Vergrößern">⛶</button>
           <span class="vis-newborn-camera__title"><%= data.attr('name') %></span>
         </div>
         <!-- right column: 4 slots, hidden by default until JS reveals them -->
         <div class="vis-newborn-camera__slots">
           <% for (var i = 1; i <= 4; i++) { %>
             <button class="vis-newborn-camera__slot vis-newborn-camera__slot--hidden"
                     type="button" data-slot="<%= i %>"></button>
           <% } %>
         </div>
       </div>
     </div>
   </script>
   ```

4. **Namespace-Stub** im IIFE:
   ```js
   ns.camera = function (el) {
     // TODO Phase 2+3
   };
   ```

5. **Lokal testen** (`npm install` in einer ioBroker-Dev-VM oder via `iob upload vis-newborn`):
   - Adapter-Restart, VIS-Editor öffnen.
   - „newborn" Palette aufklappen → „Camera Tile" sichtbar mit Vorschau.
   - Drag auf View → leere Glas-Karte erscheint, lässt sich resizen.
   - Editor-Attribute zeigen DE-Labels (kein `slot1_oid:` Roh-String).

**Commit:** `feat(camera): scaffold Newborn Camera Tile widget skeleton`

---

## Phase 2 — Camera + Maximize

**Ziel:** Karte zeigt Live-Kamerabild. Maximize öffnet Lightbox.

### Schritte

1. **`ns.camera` ausbauen** für Camera-Layer:
   ```js
   ns.camera = function (el) {
     var $el = $(el);
     var data = $el.data('vis-data') || {}; // VIS gibt attrs hier rein
     // Robuster: data direkt aus dataset lesen falls vis-data leer
     var url = el.querySelector ? null : null; // siehe basic.html für Pattern
     var url = $el.find('[data-attr]').length ? ... : data.camera_url;
     // Pragmatisch: data-Attribute via $el.data() — wie in den existierenden Widgets
     ...
   };
   ```
   *Hinweis: das exakte VIS-Data-Access-Pattern aus den existierenden Widgets `ns.toggle` / `ns.dimmer` übernehmen — die haben das bereits korrekt.*

2. **Camera-URL applizieren:**
   - Wenn `camera_url` leer → Placeholder zeigen, Image-Tag verstecken, kein Refresh-Setup, return.
   - Sonst: Placeholder verstecken, `img.src = camera_url`.
   - Wenn `refresh_seconds > 0`: `setInterval(() => { img.src = camera_url + (camera_url.indexOf('?') >= 0 ? '&' : '?') + '_t=' + Date.now(); }, refresh_seconds * 1000)`. Interval-ID in `el._newbornCameraInterval` speichern.

3. **Cleanup-Hook:** VIS-Widgets werden beim View-Wechsel re-rendered. Sicherheitshalber bei Re-Init das alte Interval clearen wenn `el._newbornCameraInterval` schon existiert.

4. **Maximize-Button:**
   - Click-Listener auf `.vis-newborn-camera__max`.
   - Funktion `openLightbox(url, title)`:
     - Abbruch wenn `document.querySelector('.vis-newborn-camera-lightbox')` schon existiert.
     - Erzeuge Overlay-DOM: Backdrop + Inner-Container + Close-Button + zweites `<img>` mit `url`.
     - Wenn `title` non-empty: `<div class="vis-newborn-camera-lightbox__title">{title}</div>` davor.
     - Listener: Click auf Backdrop / Close-Button / ESC-Key → `closeLightbox()`.
   - `closeLightbox()`: ESC-Listener entfernen, Overlay aus DOM entfernen.

5. **Test:**
   - Doorbird-MJPEG-URL eintragen → Stream sichtbar in Karte.
   - Statischen JPEG-Snapshot eintragen + `refresh_seconds=3` → Network-Tab zeigt 3-Sekunden-Reloads.
   - URL leer lassen → Placeholder „📷 Keine Kamera".
   - Maximize-Klick → Lightbox öffnet, Stream läuft auch im Overlay.
   - Close-Pfade: X, Backdrop-Click, ESC — alle drei funktionieren.
   - Mehrfaches Öffnen → kein Doppel-DOM (zweiter Klick wird ignoriert).

**Commit:** `feat(camera): wire camera image + maximize lightbox`

---

## Phase 3 — Slots, State-Glow, Actions

**Ziel:** Bis zu 4 Aktor-Buttons sind funktional. Toggle zeigt Live-State, Action pulst.

### Schritte

1. **Slot-Loop in `ns.camera`** (nach Camera-Setup):
   ```js
   for (var i = 1; i <= 4; i++) {
     setupSlot(el, data, i);
   }
   ```

2. **`setupSlot(el, data, n)`:**
   - `oid = data['slot' + n + '_oid']`. Wenn leer → return (Slot bleibt `--hidden`).
   - Slot-Element via `el.querySelector('[data-slot="' + n + '"]')`.
   - `--hidden`-Klasse entfernen.
   - Active-Color als CSS-Custom-Property setzen: `slot.style.setProperty('--slot-color', data['slot' + n + '_active_color'] || '#ffc857')`.
   - Icon rendern: wenn `slot{n}_icon` mit `http`/`/`/`./` beginnt → `<img>`, sonst `<span>` mit Text/Emoji. Innerhalb `slot.innerHTML`.
   - `aria-label` aus `slot{n}_label` setzen, sonst aus `slot{n}_oid`.
   - Wenn `type === 'toggle'`: State-Subscription (siehe 3) + Click-Handler (Toggle-Tap, Spec §5.1).
   - Wenn `type === 'action'`: kein Subscribe, Click-Handler = Action-Tap (Spec §5.2).

3. **State-Subscription für Toggle:**
   ```js
   var stateOid = data['slot' + n + '_state_oid'] || oid;
   var invert = !!data['slot' + n + '_invert_state'];
   var apply = function (val) {
     var on = invert ? !val : !!val;
     slot.classList.toggle('is-active', on);
   };
   apply(vis.states[stateOid + '.val']); // initial
   vis.states.bind(stateOid + '.val', function (e, newVal) { apply(newVal); });
   ```
   *Cleanup-Hinweis:* `vis.states.bind` registriert Listener — VIS räumt diese typischerweise mit dem Widget auf, aber zur Sicherheit Pattern aus existierenden Widgets übernehmen.

4. **Click-Handler Toggle-Tap:**
   ```js
   slot.addEventListener('click', function () {
     var cur = !!vis.states[stateOid + '.val'];
     vis.setValue(oid, !cur);
   });
   ```

5. **Click-Handler Action-Tap:**
   ```js
   slot.addEventListener('click', function () {
     var ms = parseInt(data['slot' + n + '_pulse_ms'], 10) || 500;
     slot.classList.add('is-pulsing');
     vis.setValue(oid, true);
     setTimeout(function () {
       vis.setValue(oid, false);
       slot.classList.remove('is-pulsing');
     }, ms);
   });
   ```

6. **Test:**
   - Karte mit 0 Slots: Spalte unsichtbar, kein Loch.
   - Karte mit 1 Slot: einzelner Button vertikal zentriert.
   - Karte mit 4 Slots: alle 4 sichtbar, gleichmäßig verteilt.
   - Toggle-Slot mit Lichts-DP: Tap schaltet, Glow synchronisiert mit anderem Client.
   - Toggle mit `invert_state=true`: Glow-Logik invertiert, Tap schreibt trotzdem korrekt.
   - Action-Slot: Tap → DP `true`, nach 500ms `false` (im Adapter-Log prüfbar). Pulse-Animation sichtbar.
   - Action mit `pulse_ms=1500`: Pulse länger.
   - Slot mit URL-Icon: Bild lädt. Slot mit Emoji: Emoji rendert.
   - Active-Color rot bei Alarm-Slot: Glow ist rot.

**Commit:** `feat(camera): implement slots with toggle/action behavior + live glow`

---

## Phase 4 — Release

**Ziel:** v0.2.0 ist verfügbar, dokumentiert, manuell durchgetestet.

### Schritte

1. **Version-Bump:**
   - [package.json](../../package.json) `version: "0.2.0"`.
   - [io-package.json](../../io-package.json) `common.version: "0.2.0"`.

2. **News-Entry** in [io-package.json](../../io-package.json) `common.news`:
   ```json
   "0.2.0": {
     "en": "new widget Newborn Camera Tile (camera + up to 4 toggle/action slots, lightbox maximize)",
     "de": "neues Widget Newborn Camera Tile (Kamera + bis zu 4 Toggle/Action-Slots, Lightbox-Maximize)"
   }
   ```

3. **Memory-Log** in [memory/PROJECT_MEMORY.md](../../memory/PROJECT_MEMORY.md):
   - Step-Eintrag mit Datum, Version, Kurz-Beschreibung, evtl. Lessons-Learned (z.B. „MJPEG `multipart/x-mixed-replace` läuft im Img-Tag ohne JS-Refresh").

4. **Manuelle Test-Matrix** aus Spec §8 komplett durchgehen. Bei Fehlern → Phase 2/3 Commits ggf. ergänzen.

5. **Adapter-Restart-Sicherheit prüfen:**
   - Adapter neustarten, sicherstellen dass `widgets/newborn.html` **nicht** gelöscht wird (Filename-Stem-Match — sollte safe sein da Datei unverändert).
   - Bestehende Toggle/Dimmer/Schalter/Taster/Time-Setter-Widgets funktionieren weiter (Regressionscheck).

6. **Commit:** `release: v0.2.0 — Newborn Camera Tile widget`

7. **Optional:** Git-Tag `v0.2.0` und GitHub-Release. Vor `git push` Rückfrage an User (per Konvention werden Pushes nicht autonom gemacht).

---

## Risiken & Unbekannte

| Risiko | Mitigation |
|---|---|
| `data`-Access-Pattern in VIS-Widgets ist nicht 100% einheitlich (basic.html nutzt teils `el.attr('data-...')`, teils `data.attr('...')` im Template). | Pattern strikt aus existierenden `ns.toggle`/`ns.dimmer` in derselben Datei kopieren — die laufen bereits. |
| `vis.states.bind` Cleanup bei Widget-Re-Render unklar dokumentiert. | Pattern aus existierenden Widgets übernehmen. Falls Memory-Leak im 20×-Test sichtbar → manuelles Unbind via gespeicherter Listener-Referenz. |
| Doorbird MJPEG mit Concurrent-Connection-Limit. | Spec §5.3 dokumentiert das als bekannte Einschränkung. Bei Bedarf später auf Snapshot-Modus ausweichen. |
| EJS-Loop in `data-vis-attrs` ist String, kein Code. Lange Attr-Liste muss exakt `;`-getrennt sein. | Kompakt halten, manuell einmal durchklicken im Editor um sicherzustellen dass alle Felder erscheinen. |
| `data-vis-prev` muss valides HTML in einem Attribut sein (Quote-Hölle). | Single-Quote-Wrapping verwenden, Inline-Styles statt Klassen. Beispiel im Spec funktioniert. |

---

## Rollback-Plan

Falls Phase 2 oder 3 unerwartet bestehende Widgets bricht:
- `git revert` der jeweiligen Phase-Commits — Camera-Tile-Code ist additiv (eigener `ns.camera`, eigene CSS-Klassen, eigener Template-Block), Risiko für Toggle/Dimmer/Schalter ist gering, aber Revert ist trivial.
- Spec + Plan-Dokumente bleiben für späteren zweiten Versuch.
