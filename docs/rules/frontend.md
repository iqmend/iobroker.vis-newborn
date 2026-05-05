# Frontend Rules

## Zweck
Dokumentiert die Regeln für ioBroker VIS / HTML-Widgets und UI-Komponenten.

## Regeln
- Verwende `vis.getValue(id)` und `vis.setValue(id, value)` für ioBroker VIS HTML-Widgets.
- Lese den Wert primär aus `vis.states[id + '.val']`. VIS speichert den State unter `id + '.val'`, nicht unter `id`.
- Registriere Änderungen am Datenpunkt mit `vis.states.bind(id + '.val', callback)` — der `.val`-Suffix ist Pflicht, sonst feuert der Callback nie.
- Lade den initialen Zustand beim `DOMContentLoaded`-Event und retrye, falls `vis` noch nicht bereit ist.
- Vermeide Ausdrücke wie `{state ? 'ON' : 'OFF'}` direkt im HTML, weil VIS diese nicht als JavaScript auswertet.
- Nutze einen Button-Status, der sich optisch unterscheidet, wenn der Wert aktiv ist (`active` CSS-Klasse).
- Entferne unnötige Icons und verwende klare Symbole (z. B. Lautsprecher statt Mikrofon für Alexa-Ansage).
- Kein Document-Wrapper (`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`) im Widget — VIS rendert den Inhalt in eine bestehende Seite.
- Alle CSS-Selektoren auf einen eindeutigen Container scopen (z. B. `.wm-widget …`). Niemals `*`, `body` oder generische Klassen wie `.card`, `.header` ohne Prefix verwenden — das bleeded auf andere Widgets.
- Klassennamen und `@keyframes` mit Widget-Prefix versehen (`wm-card`, `wmPulse` …), um Kollisionen mit anderen Widgets zu vermeiden.

## States, die nur per JS gelesen werden, müssen ein Hidden-Binding bekommen
VIS abonniert nur die Datenpunkte, deren `{stateID}` es im Widget-Template findet. Wird ein State ausschließlich per `vis.states[id + '.val']` oder `vis.states.bind(...)` aus JavaScript heraus gelesen, ist er **nach einem Page-Reload `undefined`**, weil VIS ihn gar nicht subscribed hat. Folge: Beim Laden zeigt der UI-Status den falschen Wert (z. B. AUS statt AN). Nach einem `vis.setValue()` funktioniert es trotzdem, weil der Wert lokal gecached wird — bis zum nächsten Reload.

**Lösung:** Ein unsichtbares Binding ins HTML setzen, damit VIS den State auf der View-Subscription-Liste hat:
```html
<span style="display:none" aria-hidden="true">{0_userdata.0.Zentralfunktionen.waschmaschine-alexa-ansage}</span>
```

Im Init zuerst `bindState()` aufrufen und nur rendern, wenn der State bereits im Cache ist — sonst übernimmt der Bind-Callback, sobald der Wert vom Server eintrifft (vermeidet kurzes Flackern des Default-Werts).

## VIS-Template-Substitution: einzeilige `{…}`-Blöcke vermeiden
VIS scannt **den gesamten Widget-Inhalt** (HTML, CSS und `<script>`) nach Patterns wie `{stateID}` und ersetzt sie durch den State-Wert. Greift der Regex auf einen versehentlichen Treffer (z. B. einen einzeiligen Funktions­körper im JS), wird der State-Lookup zu `null` und das Script bricht mit `SyntaxError: Unexpected token 'null'` ab. Folge: Widget rendert nicht und springt auf die Default-Position oben links.

**Faustregel:** Der Regex matcht nur **einzeilige** `{…}`-Blöcke ohne verschachtelte Klammern. Mehrzeilige Blöcke sind sicher.

**Pflicht im JS:**
- Keine einzeiligen Inline-Funktions­körper schreiben:
  ```js
  // KAPUTT — VIS ersetzt { render(val); } durch null
  vis.states.bind(id + '.val', function (e, val) { render(val); });
  setTimeout(function () { init(0); }, 100);
  ```
- Stattdessen entweder mehrzeilig oder über benannte Funktionen referenzieren:
  ```js
  function onChange(e, val) {
    render(val);
  }
  vis.states.bind(id + '.val', onChange);
  ```

**Pflicht im CSS:**
- `@keyframes`-Stops und ähnliche kurze Blöcke nicht in einer Zeile schreiben:
  ```css
  /* KAPUTT — VIS ersetzt { opacity: 1; transform: scale(1); } */
  0%, 100% { opacity: 1; transform: scale(1); }
  ```
  ```css
  /* OK */
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  ```

**Diagnose:** In der Browser-Konsole erscheinen Zeilen wie `Create inner vis object render(val)` oder `Create inner vis object  scale(1)` — das sind die fälschlich extrahierten Patterns.

## Sicherheit
- Kein `eval()` und kein `new Function(...)` in Widgets (siehe `docs/rules/security.md`).

## Beispiel: Status live nachziehen (VIS-sicher)
```js
var alexaStateId = '0_userdata.0.Zentralfunktionen.waschmaschine-alexa-ansage';

function toBool(v) {
  if (v && typeof v === 'object' && 'val' in v) v = v.val;
  return v === true || v === 'true' || v === 1 || v === '1';
}

function updateAlexaButton(value) {
  var button = document.getElementById('alexa-toggle');
  var label = document.getElementById('alexa-status');
  var on = toBool(value);
  label.textContent = on ? 'AN' : 'AUS';
  button.classList.toggle('active', on);
}

function onAlexaChange(e, val) {
  updateAlexaButton(val);
}

function initAlexaToggle() {
  // .val-Suffix beim Lesen
  var currentValue = vis.states[alexaStateId + '.val'];
  updateAlexaButton(currentValue);
  // .val-Suffix beim Bind
  vis.states.bind(alexaStateId + '.val', onAlexaChange);
}

document.addEventListener('DOMContentLoaded', initAlexaToggle);
```

## Hinweis
Der Callback sorgt dafür, dass der Button auch dann den richtigen Zustand anzeigt, wenn der Datenpunkt von außen geändert wird (z. B. durch Scripts, andere Widgets oder Admin). Funktion `onAlexaChange` ist absichtlich benannt und steht außerhalb des `bind`-Aufrufs — ein einzeiliges `function (e, val) { … }` würde von der VIS-Template-Substitution erfasst (siehe Regel oben).
