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

## Konsolidierung zu Multi-Widget-Adapter (`iobroker.vis-newborn`)

Die ehemals zwei getrennten Adapter (`iobroker.vis-newborn-toggle`, `iobroker.vis-newborn-dimmer`) wurden in **einen** Adapter `iobroker.vis-newborn` zusammengeführt. Lessons:

- **`data-vis-set` ist der Palette-Gruppierungs-Schlüssel**, nicht der Adaptername. Mehrere Widget-HTML-Dateien mit demselben `data-vis-set="newborn"` erscheinen zusammen unter einer Palette-Sektion „newborn".
- **`io-package.json` `common.visWidgets` listet jede Widget-Datei separat.** Mehrere Einträge sind erlaubt; jeder bekommt einen eigenen Key (`newbornToggle`, `newbornDimmer`, …) und seine eigene `url`.
- **`vis.binds["<set>"]` ist EIN gemeinsames Objekt** — wird die zweite Widget-Datei mit `vis.binds["newborn"] = { ... }` initialisiert, überschreibt sie die erste. Lösung: idempotente Init in IIFE-Closure:
  ```js
  (function () {
    vis.binds["newborn"] = vis.binds["newborn"] || {};
    var ns = vis.binds["newborn"];
    function isOn(val) { /* closure-private */ }
    ns.toggle = function (el) { /* ... */ };
  })();
  ```
- **CSS-Klassen pro Widget eindeutig prefixen** (`.vis-newborn-toggle-*` vs. `.vis-newborn-dimmer-*`) — sonst kommen sich Größen-Klassen wie `.vis-newborn-size-small` zwischen Widgets in die Quere.
- **Template-IDs (`<script id="tpl…">`) sind globaler VIS-Namespace** — über alle Widget-Dateien hinweg eindeutig halten.
- **Long-Press + Click sauber trennen** (siehe `widgets/newborn-dimmer.html`): mousedown/touchstart starten Timer (≥500 ms = long-press, sonst short-tap), `touchmove`/`mousemove` über Toleranz (~8 px) cancelt Press → kein versehentliches Toggling beim Scrollen.
- **KNX-Bus-Throttling beim Slider-Drag**: Setter mit ~100 ms Throttle (setTimeout-Coalesce + final flush bei Release), sonst überrennt der Drag-Stream den Bus.
- **Ein gemeinsamer Popup-DOM-Knoten** (lazy-erstellt + an `document.body` angehängt + zwischen allen Dimmer-Instanzen geteilt) ist ressourcenschonender als ein Popup pro Widget.

## Workflow (Multi-Widget-Adapter)

1. Adapter lokal entwickeln (`D:\Claude\Projekte\iobroker-vis-newborn\`)
2. Public GitHub-Repo `iobroker.vis-<setname>` (hier: `iqmend/iobroker.vis-newborn`)
3. Neues Widget = neue `widgets/<name>.html` + zusätzlicher Eintrag in `io-package.json` `common.visWidgets`. Bestehende Widgets bleiben unangetastet.
4. Installation in ioBroker: Admin → Adapter → Stiftsymbol → „Aus eigener URL installieren" → Repo-URL
5. Updates: Repo pushen → `iobroker url ...` erneut oder Adapter-Update über Admin-UI

## Quellen

- `docs/rules/vis-widget-sets.md` — Pattern-Regeln (inkl. Multi-Widget-Adapter-Abschnitt)
- `docs/vis/canonical-toggle-pattern.md` — verbatim Source-Snippets aus basic.html
- `docs/vis/state-subscription.md` — Subscription-Mechanik aus visUtils.js + vis.js
- `docs/vis/widget-set-spec.md` — Adapter-Spec-Übersicht
- `widgets/newborn-toggle.html` — Live-Beispiel: idempotenter Namespace + Toggle-Pattern
- `widgets/newborn-dimmer.html` — Live-Beispiel: Long-Press, Slider-Popup, KNX-Throttling
