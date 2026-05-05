# State Subscription Mechanik — Verbatim aus iobroker.vis

Wie VIS 1.x States für eine View abonniert. Quelle: `iobroker.vis/www/js/visUtils.js` und `vis.js`. Die Erkenntnisse sind belegt durch Source-Quotes; jede Mechanik hat ihre Datei:Zeile.

## Subscription-Trigger — `getUsedObjectIDs`

`visUtils.js:269` — wird beim View-Load aufgerufen:

```js
function getUsedObjectIDs(views, isByViews) {
    ...
    for (id in views[view].widgets) {
        ...
        var data = views[view].widgets[id].data;
        ...
        for (var attr in data) {
            ...
```

`visUtils.js:438-453` — Pfad 1: `{stateId}`-Patterns in String-Werten:

```js
if (typeof data[attr] === 'string') {
    var m;
    var oids = extractBinding(data[attr]);
    if (oids) {
        ...
        if (IDs.indexOf(ssid) === -1) IDs.push(ssid);
    }
}
```

`visUtils.js:467-475` — Pfad 2: Attributnamen-Regex:

```js
} else
if (attr !== 'oidTrueValue' && attr !== 'oidFalseValue' &&
    ((attr.match(/oid\d{0,2}$/) || attr.match(/^oid/) || attr.match(/^signals-oid-/) || attr === 'lc-oid')
     && data[attr])) {
    if (data[attr] && data[attr] !== 'nothing_selected') {
        if (IDs.indexOf(data[attr]) === -1) {
            IDs.push(data[attr]);
        }
        if (_views && _views[view].indexOf(data[attr]) === -1) {
            _views[view].push(data[attr]);
        }
```

`visUtils.js:66` — was als Binding-Pattern zählt:

```js
function extractBinding(format) {
    var oid = format.match(/{(.+?)}/g);
    ...
```

## Subscription-Anwendung — Socket-Subscribe

`vis.js:524`, `vis.js:2061-2063`, `vis.js:3771`:

```js
getUsedObjectIDs:   function () {
    var result = getUsedObjectIDs(this.views, !this.editMode);
...
var _data = that.getUsedObjectIDs();
that.subscribing.IDs = _data.IDs;
that.subscribing.byViews = _data.byViews;
...
if (vis.subscribing.active.length) {
    vis.conn.subscribe(vis.subscribing.active);
}
```

## State-Update-Pfad — `updateState`

`vis.js:3046-3068` — schreibt in die can.Map:

```js
updateState: function (id, state) {
    if (!id.startsWith('local_')) {
        ...
        const o = {};
        o[`${id}.val`] = state.val;
        ...
        this.states.attr(o);   // <-- löst CanJS bind-callbacks aus
```

`vis.js:3138-3151` — Pfad für `{stateId}`-Textbindings:

```js
if (!this.editMode && this.bindings[id]) {
    for (var i = 0; i < this.bindings[id].length; i++) {
        var widget = this.views[this.bindings[id][i].view].widgets[this.bindings[id][i].widget];
        var value = this.formatBinding(...);
        ...
        this.reRenderWidget(this.bindings[id][i].view, ..., this.bindings[id][i].widget);
    }
}
```

`vis.js:3155-3158` — Fallback für nicht-CanJS-Widgets:

```js
for (var j = 0, len = this.onChangeCallbacks.length; j < len; j++) {
    this.onChangeCallbacks[j].callback(this.onChangeCallbacks[j].arg, id, state.val, state.ack);
}
```

## `vis.states.bind` Implementierung

`vis.js:3429-3464`:

```js
vis.states = new can.Map({'nothing_selected.val': null});
...
// Im Editor-Mode überschrieben (filtert auf dev1, dev2…)
vis.states.___bind = vis.states.bind;
vis.states.bind = function (id, callback) {
    if (id && id.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
        return vis.states.___bind(id, callback);
    }
};
```

→ Im Runtime-Mode bleibt das unmodifizierte CanJS-`bind`. Es feuert auf jeder `states.attr(o)`-Mutation für die jeweilige Key. Subscription bleibt Voraussetzung — sonst kommt der Wert nie über den Socket.

## Wichtige Konsequenz

**`data-oid="..."` als HTML-Attribut wird von der Subscription-Maschinerie ignoriert.** Es kann zwar als Carrier verwendet werden, um in jQuery-Handlern via `$this.data('oid')` an die OID zu kommen, hat aber **keinen Einfluss** darauf, ob VIS den State abonniert.

Subscription kommt **immer** entweder aus:
1. `{stateId}` in einem String-Wert von `widget.data` (typisch: `data.html`)
2. Attributname matcht `^oid` / `oid\d{0,2}$` / `^signals-oid-` / `lc-oid` — und `data[attr]` ist gesetzt (typisch: eigene Widget-Sets mit `data-vis-attrs="oid/id"`)
