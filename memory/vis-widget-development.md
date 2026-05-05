# VIS Widget-Set Entwicklung — Lessons Learned

Erkenntnisse aus der Entwicklung des Adapters `iobroker.vis-newborn` (Vorläufer-Repos: `iobroker.vis-newborn-toggle` v0.1.0 → v0.1.7, dann Konsolidierung mit `Newborn Dimmer`-Widget zu `iobroker.vis-newborn` v0.1.0). Speziell die Pitfalls, die nicht offensichtlich aus der Online-Doku abzuleiten waren.

## Kanonische Patterns (kurz)

| Aufgabe | Was funktioniert |
|---|---|
| Widget-Container im EJS | `<div class="vis-widget" id="<%= this.data.attr('wid') %>" style="width:Xpx; height:Ypx;">` |
| Click-Handler registrieren | `<%= (el) -> vis.binds['set'].toggle(el) %>` als Attribut im opening `<div>` |
| State→UI Live-Update | `vis.states.bind(oid + '.val', cb)` + `.toggleClass(...)` in `cb` |
| State subscription | Automatisch via Attributname-Regex `^oid` an `widget.data` |

## 8 Fehler, die ich gemacht habe — und woran man sie erkennt

1. **`<%- this.id %>` für die Widget-ID** — `this.id` ist die Template-ID, nicht die Instanz-ID `wXXXXX`. Symptom: Widget wird nicht angezeigt nach Drop, `$('#' + widgetID)`-Lookups schlagen fehl. **Fix:** `<%= this.data.attr('wid') %>`.

2. **`style="<%- this.style %>"`** — `this.style` ist ein Objekt. Symptom: 0×0-Widget unsichtbar. **Fix:** Literale `style="width: 150px; height: 72px;"`.

3. **`<%- %>` als EJS-Delimiter** — VIS' CanJS-EJS verwendet `<%= %>` (escaped) und `<%== %>` (raw). `<%- %>` produziert inkonsistente Ergebnisse. **Fix:** Konsequent `<%= %>` oder `<%== %>`.

4. **Klick-Handler im Edit-Mode** — Editor kann das Widget nicht selektieren. **Fix:** `if (vis.editMode) return;` als erste Zeile im Handler.

5. **`<% var x = vis.states.attr(...) %>`-Block oben im Template** — opaker Script-Block, CanJS verdrahtet keine Observable-Tracking. Wert wird einmal berechnet, ist statisch. **Fix:** State→UI über `vis.states.bind` im `toggle(el)`-Helper, nicht im Template.

6. **`data-oid`-HTML-Attribut für Subscription** — wird ignoriert; HTML wird nicht gescannt. Subscription kommt nur aus `widget.data`-Attributnamen mit `oid`-Präfix. `data-oid` taugt aber als Carrier für `$this.data('oid')` im Click-Handler.

7. **Klick-Handler nur am inneren Toggle** — User klickt oft auf den Container-Rand außerhalb der visuellen Pille → kein Effekt. **Fix:** Click-Handler am `.vis-widget`-Root.

8. **Privates GitHub-Repo** — `iobroker url <github>` versucht `npm install via SSH-Shortcut` → Permission denied (publickey). **Fix:** Repo public machen, Widget-Code hat keine Geheimnisse.

9. **`this.data.attr('key', 'default')` als Default-Getter** — ist in CanJS ein **Setter**: setzt `key = 'default'` (überschreibt User-Auswahl bei jedem Render!) und gibt die can.Map zurück, die als `[object Object]` stringifiziert. Symptom: Klasse wird zu `vis-foo-[object Object]`, Dropdown-Werte werden bei jedem Re-Render zurückgesetzt. **Fix:** `this.data.attr('key') || 'default'` oder Ternary `attr('key') ? attr('key') : 'default'` (kanonisch in tplBulbOnOffCtrl).

## Setup-Tricks für Windows-Entwicklung

- **GitHub-Token aus Credential Manager extrahieren** (kein `gh` CLI nötig):
  ```powershell
  $tmp = [IO.Path]::GetTempFileName()
  [IO.File]::WriteAllText($tmp, "protocol=https`nhost=github.com`n`n")
  $creds = cmd /c "git credential fill < `"$tmp`" 2>&1"
  Remove-Item $tmp
  $token = (($creds | Where-Object { $_ -like "password=*" }) -replace "^password=", "")
  ```
- Damit private Repos via API anlegen oder API-Calls absetzen.

## Workflow

1. Widget-Set lokal in `widgets/vis-<setname>/` entwickeln
2. Eigenes GitHub-Repo `iobroker.vis-<setname>` (public)
3. `iobroker url https://github.com/<user>/iobroker.vis-<setname>` zur Installation
4. Bei Updates: Repo pushen → `iobroker url ...` erneut, oder Adapter-Updates über Admin-UI

## Konsolidierung zu Multi-Widget-Adapter `iobroker.vis-newborn` — und der Filename-Stem-Trap

Die ehemals zwei getrennten Adapter (`iobroker.vis-newborn-toggle`, `iobroker.vis-newborn-dimmer`) wurden in **einen** Adapter `iobroker.vis-newborn` zusammengeführt. Im **ersten Anlauf (v0.1.0)** habe ich das falsch gebaut: zwei separate `widgets/newborn-toggle.html` + `widgets/newborn-dimmer.html`, jeweils ein eigener `visWidgets`-Eintrag. Resultat: `<host>:8082/vis-newborn/widgets/*.html` lieferte 404, VIS-Palette blieb leer — auch nach Anlegen der Adapter-Instanz.

### Smoking Gun (v0.1.1-Fix)

`iobroker.vis/lib/install.js` Funktion `syncWidgetSets` löscht beim VIS-Start jede `widgets/*.html` aus `iobroker.vis/www/widgets/`, deren Stem nicht zu einem installierten Adapter passt. Match-Regel:
```js
ssName === `iobroker.vis-${name}` || ssName === `iobroker.${name}`
```
wobei `name = filename.replace('.html','')`. Stems `newborn-toggle` und `newborn-dimmer` matchen weder `iobroker.vis-newborn` noch `iobroker.newborn` → beide gelöscht → 404.

**Fix:** beide Templates in **einer** `widgets/newborn.html` (Stem `newborn` matcht `iobroker.vis-newborn`), kanonisches VIS-Pattern wie `iobroker.vis/www/widgets/basic.html` — dutzende Widgets in einer Datei. Der `visWidgets`-Eintrag in `io-package.json` ist genau einer, auch wenn die Datei mehrere `<script class="vis-tpl">`-Templates enthält.

### Aktuelles Pattern (v0.1.1+)

- **Eine** `widgets/<stem>.html` für ALLE Widgets eines Adapters; Stem matcht Adapter-Suffix nach `iobroker.vis-` (oder `iobroker.`).
- Pro Widget ein `<script class="vis-tpl">`-Block mit eindeutiger `id="tpl…"`, eigenem `data-vis-name`, allen mit demselben `data-vis-set` (= Palette-Gruppe).
- Genau **ein** `<script type="text/javascript">`-IIFE-Block, in dem `vis.binds["<set>"]` einmalig befüllt wird:
  ```js
  (function () {
    vis.binds["newborn"] = vis.binds["newborn"] || {};
    var ns = vis.binds["newborn"];
    function isOn(val) { /* closure-private */ }
    ns.toggle = function (el) { /* widget 1 */ };
    ns.dimmer = function (el) { /* widget 2 */ };
  })();
  ```
- **CSS-Klassen pro Widget eindeutig prefixen** (`.vis-newborn-toggle-*` vs. `.vis-newborn-dimmer-*`).
- **Template-IDs (`tpl…`) global eindeutig** — VIS verwendet sie als Schlüssel.

### Sonstige Lessons aus dem Dimmer

- **jQuery proxiet `e.touches` NICHT.** Bei `$el.on("touchstart", h)` ist `e` ein jQuery-Wrapper, der die Touch-Felder (`touches`, `changedTouches`, `targetTouches`) **nicht** durchreicht. Direktes Lesen von `e.touches[0].clientX` → `undefined` → Handler returned still und kein Touch funktioniert. Symptom in v0.1.1: Dimmer reagierte auf Desktop-Klick, aber **gar nicht** auf Mobile-Touch (Toggle hingegen funktionierte, weil dessen Handler keine Koordinaten brauchte). **Fix:** Helper `getXY(e)` mit `e.originalEvent || e` für Native-Felder, Fallback auf `e.clientX/Y` für Mouse-Events.
- **Synthesisierte Mouse-Events nach Touch.** Mobile-Browser feuern nach `touchend` ~300 ms später einen synth. `mousedown` → `mouseup` → `click`. Bei Long-Press-Logik kommt das nach Popup-Öffnung an: synth. `mousedown` → `startPress` re-enter → `longPressed=false` zurückgesetzt → synth. `mouseup` → `onRelease` → Toggle FIRES. Symptom in v0.1.2: 1-von-10-Race „Toggle UND Popup gleichzeitig". **Doppel-Fix:** (a) CSS `touch-action: manipulation` auf dem Wrap-Element — moderne Browser unterdrücken die Mouse-Synthesis; (b) JS-Guard `lastTouchEndAt = Date.now()` in `onRelease` für `touchend/touchcancel`, in `onPressStart` synth. mousedown verwerfen wenn `Date.now() - lastTouchEndAt < 700`.
- **iOS Long-Press-Selection-Callout.** Beim Halten eines Elements zeigt iOS Safari/Chrome standardmäßig einen Selection-Highlight oder ein Action-Sheet (Loupe). Sichtbar als „kurzes Markieren" des Widgets. **Fix:** `-webkit-touch-callout: none` + `user-select: none` + `-webkit-user-select: none` + `-webkit-tap-highlight-color: transparent` + `touch-action: manipulation`. **Wichtig:** **nur am Wrap** (`.vis-widget.vis-newborn-dimmer-wrap`), **nicht zusätzlich** am inneren Tile — das doppelte Setzen am Tile + Wrap hat in v0.1.3 den Klick auf PC und Mobile komplett zerschossen.

- **Long-Press + Tap auf demselben Element → Pointer Events API benutzen.** Touch und Mouse parallel zu binden (mousedown+touchstart, mouseup+touchend, …) führt **immer** zu Edge-Cases mit synthesisierten Mouse-Events nach Touch (~300 ms Delay) — die landen im selben Handler und kollidieren mit Long-Press-State. **Robuste Lösung:** `pointerdown`/`pointermove`/`pointerup`/`pointercancel` direkt am DOM-Element registrieren (nicht via jQuery — wegen `setPointerCapture`). Pointer Events sind ein unifizierter Stream über Maus/Touch/Pen; Browser feuern keine synth. Mouse-Events nach pointerdown. `el.setPointerCapture(e.pointerId)` in `pointerdown` garantiert, dass move/up auch dann am Element ankommen, wenn der Finger das Element verlässt — ersetzt das brüchige `mouseleave`-Handling. Compat: iOS Safari ≥13, alle aktuellen Android-Browser. Belegt: in `iobroker.vis-newborn` v0.1.5-Migration nach drei gescheiterten Touch+Mouse-Hybrid-Anläufen (v0.1.1, 0.1.2, 0.1.3). Kein Vorbild in `iobroker.vis/www/widgets/basic.html` — VIS hat selbst kein Long-Press-Pattern, daher direkt nach W3C-Spec gehen.
- **Long-Press + Click sauber trennen:** mousedown/touchstart starten Timer (≥500 ms = long-press, sonst short-tap), `touchmove`/`mousemove` über Toleranz (~12 px) cancelt Press → kein versehentliches Toggling beim Scrollen. 8 px war zu strikt für Finger-Wackeln.
- **Touch + Mouse in einem Handler:** `$el.on("mousedown.ns touchstart.ns", h)` mit Type-Check `if (e.type === "mousedown" && e.button !== 0) return;` ist robuster als zwei separate Handler — vermeidet Logik-Drift zwischen Mouse- und Touch-Pfad.
- **KNX-Bus-Throttling beim Slider-Drag:** Setter mit ~100 ms Throttle (setTimeout-Coalesce + final flush bei Release), sonst überrennt der Drag-Stream den Bus.
- **Ein gemeinsamer Popup-DOM-Knoten** (lazy-erstellt + an `document.body` angehängt + zwischen allen Dimmer-Instanzen geteilt) ist ressourcenschonender als ein Popup pro Widget.

## Workflow

1. Adapter lokal entwickeln (`D:\Claude\Projekte\iobroker-vis-newborn\`)
2. Public GitHub-Repo `iobroker.vis-<setname>` (hier: `iqmend/iobroker.vis-newborn`)
3. **Neues Widget = neuer `<script class="vis-tpl">`-Block in der bestehenden `widgets/<stem>.html`** + neue Methode auf `vis.binds["<set>"]`. **Keine** neue HTML-Datei — die würde gelöscht.
4. Installation in ioBroker: Admin → Adapter → Stiftsymbol → „Aus eigener URL installieren" → Repo-URL
5. Updates: Repo pushen → `iobroker url ...` erneut oder Adapter-Update über Admin-UI

## Quellen

- `docs/rules/vis-widget-sets.md` — Pattern-Regeln (inkl. Multi-Widget-Adapter-Abschnitt)
- `docs/vis/canonical-toggle-pattern.md` — verbatim Source-Snippets aus basic.html
- `docs/vis/state-subscription.md` — Subscription-Mechanik aus visUtils.js + vis.js
- `docs/vis/widget-set-spec.md` — Adapter-Spec-Übersicht
- `widgets/newborn-toggle.html` — Live-Beispiel: idempotenter Namespace + Toggle-Pattern
- `widgets/newborn-dimmer.html` — Live-Beispiel: Long-Press, Slider-Popup, KNX-Throttling
