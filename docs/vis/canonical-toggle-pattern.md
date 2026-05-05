# Canonical Clickable Bool Widget — Quellen aus iobroker.vis

Verbatim-Auszüge aus `iobroker.vis/www/widgets/basic.html` (master-Branch). Diese Snippets sind Referenzimplementation für klickbare Boolean-Widgets in eigenen Widget-Sets.

## tplBulbOnOffCtrl (Bulb on/off — der Klassiker)

basic.html:3036-3070

```html
<script id="tplBulbOnOffCtrl"
        type="text/ejs"
        class="vis-tpl"
        data-vis-prev='<img src="widgets/basic/img/Prev_BulbOnOffCtrl.png"></img>'
        data-vis-set="basic"
        data-vis-type="ctrl"
        data-vis-name="Bulb on/off"
        data-vis-attrs="oid;min;max;icon_off[img~bulb_off.png]/image;icon_on[img~bulb_on.png]/image;readOnly/checkbox;"
        data-vis-attrs0="group.ccontrol;urlTrue;urlFalse;oidTrue/id;oidFalse/id;oidTrueValue;oidFalseValue;"
>
    <div
        data-oid="<%= this.data.attr('oid') %>"
        class="vis-widget <%== this.data.attr('class') %>"
        id="<%= this.data.attr('wid') %>"
        style="width: 44px; height: 59px"
        data-read-only="<%=  this.data.attr('readOnly') %>"
        data-min="<%= this.data.attr('min') %>"
        data-max="<%= this.data.attr('max') %>"
        data-url-true="<%=  this.data.attr('urlTrue') %>"
        data-url-false="<%= this.data.attr('urlFalse') %>"
        data-oid-true="<%=  this.data.attr('oidTrue') %>"
        data-oid-false="<%= this.data.attr('oidFalse') %>"
        data-oid-true-value="<%=  this.data.attr('oidTrueValue') %>"
        data-oid-false-value="<%= this.data.attr('oidFalseValue') %>"
        <%= (el) -> vis.binds.basic.toggle(el) %>
        >
        <div class="vis-widget-body">
            <% if (vis.binds.basic.isFalse(vis.states.attr(this.data.oid + '.val'), this.data.attr('min'), this.data.attr('max'))) { %>
                <img src="<%== this.data.attr('icon_off') ? this.data.attr('icon_off') : 'img/bulb_off.png' %>" width="100%"/>
            <% } else { %>
                <img src="<%== this.data.attr('icon_on') ? this.data.attr('icon_on') : 'img/icon_on.png' %>" width="100%"/>
            <% } %>
        </div>
    </div>
</script>
```

**Beachte:**
- `<%= this.data.attr('wid') %>` für die Widget-Instanz-ID (nicht `this.id`!)
- Literales `style="width: 44px; height: 59px"` — Drop-Größe
- `<%= (el) -> vis.binds.basic.toggle(el) %>` als Click-Registrierung **inside** des opening `<div>`-Tags
- State-Read im Body via `vis.states.attr(this.data.oid + '.val')` direkt im `<%= %>`-Magic-Tag — CanJS-Live-Binding aktiv
- DOM-Wechsel via `<% if/else %>` — komplett unterschiedliche Subtrees pro State

## vis.binds.basic.toggle (Click-Handler)

basic.html (innerhalb `vis.binds.basic = { ... }` ab Zeile ~482)

```js
toggle: function (el, oid) {
    var $this = $(el);
    oid = oid || $this.data('oid');
    var min = $this.data('min');
    var max = $this.data('max');

    if ((oid || ...) && !vis.editMode && !readOnly) {
        var moved = false;
        $this.on('click touchend', function () {
            if (vis.detectBounce(this)) return;
            if (moved) return;

            var val = vis.states[oid + '.val'];
            // ...invertiere und schreibe
            vis.setValue(oid, neuerWert);
        }).on('touchmove', function () {
            moved = true;
        }).on('touchstart', function () {
            moved = false;
        }).data('destroy', function (id, $widget) {
            $widget.off('click touchend').off('touchmove').off('touchstart');
        });
    }
}
```

**Beachte:**
- `vis.editMode`-Guard: keine Klick-Handler im Editor (sonst nicht selektierbar)
- `vis.detectBounce` schützt vor Doppelklick (touch+mouse-Events)
- `moved`-Flag: bei Touch-Drag (z. B. Scrollen) nicht feuern
- `data('destroy', fn)`: wird bei `destroyWidget` aufgerufen — Cleanup-Pflicht

## vis.binds.basic.hideOnFalse (State→UI Pattern mit `vis.states.bind`)

```js
if (oid) {
    vis.states.bind(oid + '.val', onChange);
    $this.data('bound', [oid + '.val'])
        .data('bindHandler', onChange);
    if (!vis.editMode) {
        var newVal = vis.states.attr(oid + '.val');
        // ...
    }
}
```

**Beachte:** Das ist die **alternative** Methode zum CanJS-Live-Binding aus dem Bulb-Pattern. Verwendet, wenn man `.toggleClass(...)` o. ä. direkt machen will, statt komplette DOM-Subtrees auszutauschen. Funktioniert nur, wenn die State subscribed ist (Attribut-Naming `^oid` siehe `state-subscription.md`).
