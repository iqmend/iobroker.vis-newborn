# Rules: ioBroker VIS 1.x Widget-Set Adapter

Regeln für die Entwicklung eigener VIS-Widget-Set-Adapter (`type: visualization-widgets`). Empirisch bestätigt im Adapter [iobroker.vis-newborn](https://github.com/iqmend/iobroker.vis-newborn) (Toggle + Dimmer unter einer gemeinsamen Palette-Sektion), validiert gegen die Quellen von `iobroker.vis/www/widgets/basic.html` und `iobroker.vis/www/js/vis.js`.

## EJS-Template — Pflichtstruktur des äußeren Containers

```html
<div class="vis-widget <%== this.data.attr('class') %>"
     style="width: 150px; height: 72px;"
     id="<%= this.data.attr('wid') %>">
  ...
</div>
```

**Hart erforderlich:**
- `class="vis-widget …"` — sonst kein Drag/Drop, keine Selektion, keine Resize-Handles
- `id="<%= this.data.attr('wid') %>"` — **NICHT** `<%- this.id %>` (das ist die Template-ID, nicht die Widget-Instanz-ID); ohne korrekte Instanz-ID greift kein Editor-Select
- Inline `style="width: …px; height: …px;"` mit literalen Defaults — das ist die Drop-Größe; ohne diese rendert das Widget 0×0
- EJS-Delimiter sind `<%= %>` (HTML-escaped) und `<%== %>` (raw HTML). **Nicht** `<%- %>`

## State-Subscription — vollautomatisch durch Attribut-Naming

VIS abonniert States serverseitig via `getUsedObjectIDs` in `visUtils.js:269` und Regex-Match an `widget.data`-Attributnamen:

```
attr.match(/oid\d{0,2}$/) || attr.match(/^oid/) || attr.match(/^signals-oid-/) || attr === 'lc-oid'
```

→ **Jedes Attribut, dessen Name mit `oid` beginnt oder auf `oidN` endet, wird automatisch abonniert**, sobald der User im Editor einen Wert auswählt. Beispiele für gültige Namen: `oid`, `oid_status`, `oid_command`, `oid2`, `lc-oid`.

**Was NICHT subscribed:**
- `data-oid="…"`-HTML-Attribute am gerenderten Element (HTML wird nicht gescannt)
- `vis.states.bind(…)`-Aufrufe alleine (die hängen sich an die can.Map, abonnieren aber nichts)

**Hidden-Binding-Span (`<span style="display:none">{stateID}</span>`)** ist nur nötig, wenn du States lesen willst, deren Name **nicht** dem `oid`-Regex folgt — selten in Widget-Sets.

## State→UI Live-Update

```js
vis.binds["my-set"].toggle = function (el) {
  var $this = $(el);
  var oid = $this.data("oid");
  if (!oid || vis.editMode) return;

  function applyState(rawVal) {
    // DOM aktualisieren
  }
  function onStateChange(e, val) { applyState(val); }

  applyState(vis.states[oid + ".val"]);          // initial
  vis.states.bind(oid + ".val", onStateChange);  // live

  $this.data("destroy", function () {
    vis.states.unbind(oid + ".val", onStateChange);
  });
};
```

`vis.states.bind` feuert über CanJS-Observable, weil `updateState` in `vis.js:3068` die can.Map mit `states.attr(o)` schreibt. Funktioniert nur, **wenn die State subscribed ist** (siehe Attribut-Naming oben).

**`<% var x = vis.states.attr(...) %>`-Blöcke oben im Template** funktionieren NICHT für Live-Updates: CanJS verdrahtet Observable-Tracking nur in `<%= %>`-Magic-Tags, nicht in opaken `<% %>`-Script-Blöcken. Der Wert wird einmal berechnet und ins HTML eingebacken — danach nie wieder.

## Click→State Schreibpfad

Klick-Handler wird per CanJS-Arrow-Syntax direkt im opening `<div>` registriert:

```html
<div class="vis-widget …" id="…" data-oid="<%= this.data.attr('oid') %>"
     <%= (el) -> vis.binds['my-set'].toggle(el) %>>
```

Im Handler: `$(this).data('oid')` holt die OID, `vis.states[oid + '.val']` liest den aktuellen Wert, `vis.setValue(oid, neuerWert)` schreibt zurück.

**Cleanup-Pflicht:** `$this.data('destroy', fn)` setzen, damit beim `destroyWidget`/`reRenderWidget` (z. B. bei Property-Änderungen im Editor) Click-Handler und State-Bind sauber entfernt werden — sonst Memory-Leaks und doppelt feuernde Callbacks.

## Edit-Mode-Schutz

Im Editor (`vis.editMode === true`) **keine Click-Handler binden** — sonst kann der User das Widget nicht selektieren oder verschieben. CSS-Trick als Fallback: `pointer-events: none` auf alle Inhalte, wenn Editor aktiv:

```css
body.vis-edit-active .my-widget * { pointer-events: none !important; }
```

## CSS — Scoping & Sizing

- **Alle Selektoren mit Widget-Set-Prefix** (`.my-widget-…`), niemals `*` oder `body` oder generische Klassen wie `.card` — das bleeded auf andere Sets.
- `@keyframes`-Stops mehrzeilig, keine einzeiligen `{…}`-Blöcke (siehe [docs/rules/frontend.md](frontend.md) zur VIS-Template-Substitution).
- Größenklassen am `.vis-widget`-Root mit `!important` setzen, sonst überstimmt der Editor-Inline-Style:
  ```css
  .vis-widget.my-size-small { width: 110px !important; height: 56px !important; }
  ```

## Re-Render-Mechanik

| Auslöser | Was passiert | Quelle |
|---|---|---|
| State-Update mit `{stateID}`-Textbinding im HTML | `destroyWidget` + `renderWidget` (voller Re-Render) | vis.js:3138-3151 |
| State-Update mit `vis.states.attr(...)` in `<%= %>`-Tag | Live-Binding via CanJS, kein Re-Render nötig | vis.js:1716 (`can.view`) |
| State-Update mit `vis.states.bind(cb)` | Callback-Aufruf, DOM manuell pflegen | vis.js:3068 |
| Property-Änderung im Editor | (zu klären, siehe Forschung Größe-Issue) | — |

## CanJS-Falle: `.attr(key, defaultValue)` ist ein SETTER

```html
<!-- FALSCH: setzt size auf 'medium' und gibt die can.Map zurück (renders als '[object Object]') -->
<%= this.data.attr('size', 'medium') %>

<!-- RICHTIG: Ternary-Fallback wie im kanonischen tplBulbOnOffCtrl -->
<%= this.data.attr('size') || 'medium' %>
<%== this.data.attr('icon_off') ? this.data.attr('icon_off') : 'img/bulb_off.png' %>
```

CanJS `can.Map.prototype.attr` hat zwei Signaturen:
- `.attr(key)` → Getter, gibt den Wert zurück
- `.attr(key, value)` → **Setter**, setzt den Wert UND überschreibt damit User-Auswahl bei jedem Render. Gibt die Map zurück → stringifiziert zu `[object Object]`.

Symptom: Im DOM erscheint eine Klasse wie `vis-newborn-size-[object Object]`, und Dropdown-Selektionen werden bei jedem Re-Render auf den "Default" zurückgesetzt. Quelle: belegt in `iobroker.vis-newborn-toggle` v0.1.6 → v0.1.7-Fix.

## Adapter-Metadaten — Pflichtfelder in `io-package.json`

```json
{
  "common": {
    "name": "vis-<setname>",
    "type": "visualization-widgets",
    "mode": "once",
    "onlyWWW": true,
    "noConfig": true,
    "singleton": true,
    "restartAdapters": ["vis", "vis-2"],
    "visWidgets": {
      "<key>": {
        "name": "<setname>",
        "url": "vis-<setname>/widgets/<setname>.html"
      }
    }
  }
}
```

`onlyWWW: true` + `mode: "once"` → Adapter-Prozess terminiert nach Start; nur die Dateien aus `widgets/` werden ausgeliefert.

## Multi-Widget-Adapter — mehrere Widgets unter einer Palette-Sektion

Sollen mehrere Widgets unter einer gemeinsamen Sektion in der VIS-Editor-Palette erscheinen (wie `iobroker.vis-newborn`), gilt:

1. **Pro Widget eine eigene HTML-Datei** in `widgets/`. Trennt CSS, EJS-Template und JS-Handler je Widget — Erweiterbarkeit, kein Merge-Konflikt-Risiko.
2. **Alle HTML-Dateien deklarieren denselben `data-vis-set`-Wert** im `<script class="vis-tpl">`-Tag. VIS gruppiert in der Palette nach `data-vis-set` — gleicher Wert → gleiche Sektion.
3. **`io-package.json` `common.visWidgets` listet jede Datei separat** unter einem eigenen Key:
   ```json
   "visWidgets": {
     "newbornToggle": {
       "name": "newborn-toggle",
       "url": "vis-newborn/widgets/newborn-toggle.html"
     },
     "newbornDimmer": {
       "name": "newborn-dimmer",
       "url": "vis-newborn/widgets/newborn-dimmer.html"
     }
   }
   ```
4. **Gemeinsamer JS-Namespace `vis.binds["<set>"]` mit idempotentem Init**, sonst überschreibt die zweite Datei die erste:
   ```js
   (function () {
     vis.binds["newborn"] = vis.binds["newborn"] || {};
     var ns = vis.binds["newborn"];

     // closure-private Helper (kein Konflikt mit anderen Widget-Dateien)
     function isOn(val) { /* ... */ }

     // nur die eigene Methode an den Namespace anhängen
     ns.toggle = function (el) { /* ... */ };
   })();
   ```
   Jede Widget-Datei kapselt ihre Helper in einer eigenen IIFE-Closure und hängt nur ihre Public-Methode an `ns` an. Reihenfolge des Datei-Loads ist dadurch egal.
5. **Klassennamen pro Widget eindeutig prefixen** (`vis-<set>-<widget>-…`), damit CSS sich nicht beißt — auch zwischen Widgets desselben Sets (siehe `vis-newborn-toggle-*` vs. `vis-newborn-dimmer-*`).
6. **Template-IDs (`<script id="tpl…">`) und `data-vis-name`-Werte über alle Widget-HTMLs hinweg eindeutig** — `tpl`-IDs sind globaler VIS-Namespace.

Neue Widgets ergänzt man, indem man eine weitere `widgets/<name>.html` ablegt und in `visWidgets` einen neuen Eintrag erzeugt — bestehende Dateien bleiben unangetastet.

## Installation

Privates Repo schlägt fehl, weil ioBroker `npm install` mit GitHub-Shortcut auf SSH (`ssh://git@github.com/...`) clont und der Host meist keinen GitHub-SSH-Key hat → **Repo muss public sein** für `iobroker url <github-url>`-Installation. Alternativ: Tarball-URL mit eingebettetem PAT (taucht in Logs auf, nicht empfohlen).
