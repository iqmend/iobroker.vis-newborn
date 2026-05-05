# VIS 1.x Widget-Set Adapter — Spec

Übersicht der Konventionen für eigene Widget-Set-Adapter. Validiert durch Source-Lesen + Live-Test am [iobroker.vis-newborn-toggle](https://github.com/iqmend/iobroker.vis-newborn-toggle)-Adapter.

## Adapter-Layout

```
iobroker.vis-<setname>/
├── package.json              npm-Metadaten
├── io-package.json           type: visualization-widgets, visWidgets
├── main.js                   Minimal-Stub (terminiert sofort)
├── README.md
├── LICENSE
├── admin/
│   ├── index_m.html          leere Konfig-Seite (Pflicht)
│   └── vis-<setname>.png     128×128 Adapter-Icon
└── widgets/
    └── <setname>.html        EJS-Templates + vis.binds-Stub
```

## io-package.json — Pflichtfelder

```json
{
  "common": {
    "name": "vis-<setname>",
    "version": "0.1.0",
    "title": "...",
    "type": "visualization-widgets",
    "mode": "once",
    "onlyWWW": true,
    "noConfig": true,
    "singleton": true,
    "main": "main.js",
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

`onlyWWW: true` + `mode: "once"`: Adapter-Prozess startet nur kurz, terminiert sofort, liefert dann nur die `widgets/`-Dateien aus.

## Widget-HTML — Minimal-Beispiel

```html
<style>
  .my-widget-toggle {
    /* Alle Selektoren scoped auf widget-eigenes Prefix */
  }
</style>

<script id="tplMyToggle"
        type="text/ejs"
        class="vis-tpl"
        data-vis-prev='<div class="vis-widget-prev">...</div>'
        data-vis-set="my-set"
        data-vis-name="My Toggle"
        data-vis-attrs="oid/id;size/select,small,medium,large">
<div class="vis-widget my-widget-toggle <%== this.data.attr('class') %>"
     style="width: 150px; height: 72px;"
     id="<%= this.data.attr('wid') %>"
     data-oid="<%= this.data.attr('oid') %>"
     <%= (el) -> vis.binds['my-set'].toggle(el) %>>
  <!-- Inhalt -->
</div>
</script>

<script type="text/javascript">
  vis.binds["my-set"] = {
    version: "0.1.0",
    toggle: function (el) {
      var $this = $(el);
      var oid = $this.data("oid");
      if (!oid || vis.editMode) return;

      function applyState(rawVal) {
        // DOM aktualisieren
      }
      function onStateChange(e, val) { applyState(val); }

      applyState(vis.states[oid + ".val"]);
      vis.states.bind(oid + ".val", onStateChange);

      $this.on("click touchend", function () {
        if (vis.detectBounce && vis.detectBounce(this)) return;
        var current = vis.states[oid + ".val"];
        vis.setValue(oid, !current);
      });

      $this.data("destroy", function (id, $widget) {
        ($widget || $this).off("click touchend");
        if (vis.states.unbind) vis.states.unbind(oid + ".val", onStateChange);
      });
    }
  };
</script>
```

## data-vis-attrs Syntax

```
attr_name/type[,options][;next_attr/type...]
```

**Typen:**
- `id` — Object-ID-Picker
- `checkbox` — Boolean
- `select,opt1,opt2,opt3` — Dropdown
- `image` — Bild-Picker
- `number`, `text` — sonst freie Werte

Mehrere Gruppen: `data-vis-attrs="..."`, `data-vis-attrs0="..."`, `data-vis-attrs1="..."` (keine Lücken in der Numerierung).

## Hidden-Bindings (selten nötig)

Nur erforderlich, wenn man States lesen will, deren Attributname **nicht** dem `oid`-Regex (`^oid`, `oid\d{0,2}$`, `^signals-oid-`, `lc-oid`) folgt:

```html
<span style="display:none" aria-hidden="true">{<%= this.data.attr('mystate') %>}</span>
```

In Widget-Sets fast nie nötig — einfach Attribute mit `oid`-Präfix benennen.

## Edit-Mode-Verhalten

- `vis.editMode === true` ist der zuverlässige Check
- Im Edit-Mode **keine** Click-Handler binden — sonst kann der User nicht selektieren/verschieben
- Optional: CSS `pointer-events: none` für alle Inhalte, wenn Editor-Body eine bestimmte Klasse trägt

## Cleanup

`$this.data('destroy', fn)` ist Pflicht für jegliche Bindings/Subscriptions. Der Callback wird bei `destroyWidget` aufgerufen (Property-Änderung, View-Wechsel, View-Reload).

## Installation des Adapters

```
iobroker url https://github.com/<user>/iobroker.vis-<setname>
```

Repo **muss public** sein (npm clont via SSH-Shortcut → keine Auth).

## Re-Render — Trigger-Übersicht

| Trigger | Mechanik | VIS-Source |
|---|---|---|
| State-Change auf `{stateID}`-Textbinding | `destroyWidget` + `renderWidget` (voller Re-Render) | vis.js:3138-3151 |
| State-Change auf `vis.states.attr(...)` in `<%= %>` | CanJS Live-Binding (kein Re-Render) | vis.js:1716 (`can.view`) |
| State-Change mit `vis.states.bind(cb)` | Callback-Aufruf, DOM manuell pflegen | vis.js:3068 |
| Property-Änderung im Editor | (in Klärung — siehe vis-newborn-toggle Größe-Issue) | — |

## Häufige Fallstricke

1. **`<%- %>`-Delimiter** — VIS verwendet CanJS-EJS, dort ist `<%- %>` nicht verlässlich. **`<%= %>` (escaped) und `<%== %>` (raw)** verwenden.
2. **`<%- this.id %>` für die ID** — falsch; ist die Template-ID. **`<%= this.data.attr('wid') %>`** ist die Widget-Instanz-ID.
3. **`style="<%- this.style %>"`** — `this.style` ist ein Objekt, kein String. Liefert `[object Object]` oder leer. **Literale `style="width: …px; height: …px;"`** im Template.
4. **`<% var x = vis.states.attr(...) %>`-Block oben** — opaker Script-Block, CanJS verdrahtet keine Live-Binding. **`vis.states.bind(...)`** im JS verwenden, nicht im EJS-Var-Block.
5. **Fehlendes `class="vis-widget"`** auf dem Root — Editor erkennt das Widget nicht; nicht selektierbar/verschiebbar.
6. **Fehlendes `style="width:…;height:…"`** — Drop-Größe ist 0×0 → unsichtbar.
7. **Click-Handler im Editor-Mode** — Editor kann nicht selektieren. `if (vis.editMode) return;` Pflicht.
8. **Privates GitHub-Repo** — `iobroker url` cloned via SSH, schlägt fehl. Repo public machen.
