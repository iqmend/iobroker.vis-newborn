# ioBroker Automatisierung

> Quelle: docs/de/logic/ aus ioBroker.docs

---

## Übersicht

ioBroker bietet mehrere Wege zur Automatisierung:

| Methode | Adapter | Schwierigkeit | Beschreibung |
|---------|---------|---------------|-------------|
| **Blockly** | javascript | Einfach | Visuelle Programmierung mit Blöcken |
| **JavaScript** | javascript | Mittel | Textbasierte Skripte |
| **TypeScript** | javascript | Mittel-Hoch | Typsicheres JavaScript |
| **Rules** | javascript | Einfach | Regel-basierte Automatisierung |
| **Node-RED** | node-red | Mittel | Flow-basierte Programmierung |
| **Scenes** | scenes | Einfach | Szenen-Management |

---

## JavaScript-Adapter

Der `javascript`-Adapter ist der zentrale Automatisierungs-Adapter.

### Installation
```bash
iobroker install javascript
```

### Unterstützte Sprachen
- Blockly (visuell)
- JavaScript (ES2020+)
- TypeScript
- Rules

---

## Blockly

Blockly ist eine **visuelle Programmiersprache** mit Drag-and-Drop-Blöcken.

### Wichtige Block-Kategorien

#### Trigger
| Block | Beschreibung |
|-------|-------------|
| **on (Trigger)** | Reagiert auf Datenpunkt-Änderungen |
| **schedule** | Zeitgesteuerte Ausführung (Cron) |

#### Aktionen
| Block | Beschreibung |
|-------|-------------|
| **control** | Datenpunkt setzen (mit ack=false) |
| **update** | Datenpunkt aktualisieren (mit ack=true) |
| **exec** | Systembefehl ausführen |
| **sendTo** | Nachricht an Adapter senden |

#### Logik
| Block | Beschreibung |
|-------|-------------|
| **controls_if** | Wenn-Dann Bedingung |
| **logic_compare** | Vergleichsoperatoren (==, !=, <, >) |
| **logic_boolean** | true/false |
| **get_value** | Datenpunkt-Wert lesen |

### Blockly-Beispiel: Mähroboter Tag An/Aus
```
ON: 0_userdata.0.Mähroboter.Montag (bei Änderung)
  IF Montag == true THEN
    SET worx.0.{id}.calendar.monday.startTime = Startzeit
    SET worx.0.{id}.calendar.monday.workTime = Arbeitszeit
  IF Montag == false THEN
    SET worx.0.{id}.calendar.monday.workTime = 0
```

---

## JavaScript

### Grundlegende Funktionen

#### Datenpunkte lesen
```javascript
// Aktuellen Wert lesen
const wert = getState('0_userdata.0.Mähroboter.Montag').val;

// Mehrere Attribute lesen
const state = getState('worx.0.{id}.battery.percent');
console.log(`Batterie: ${state.val}%, Zeitstempel: ${state.ts}`);
```

#### Datenpunkte setzen
```javascript
// Wert setzen (ack=false → Kommando)
setState('0_userdata.0.Mähroboter.Montag', true);

// Wert setzen mit Optionen
setState('0_userdata.0.Mähroboter.Montag', { val: true, ack: false });
```

#### Auf Änderungen reagieren
```javascript
on('0_userdata.0.Mähroboter.Montag', function(obj) {
    if (obj.state.val === true) {
        setState('worx.0.{id}.calendar.monday.startTime', 
                 getState('0_userdata.0.Mähroboter.Startzeit').val);
        setState('worx.0.{id}.calendar.monday.workTime', 
                 getState('0_userdata.0.Mähroboter.Arbeitszeit').val);
    } else {
        setState('worx.0.{id}.calendar.monday.workTime', 0);
    }
});
```

#### Zeitgesteuerte Ausführung
```javascript
// Cron-Syntax: Sekunde Minute Stunde Tag Monat Wochentag
schedule('1 0 * * *', function() {  // Täglich um 00:01
    setState('0_userdata.0.Mähroboter.Pruefziffer', true);
});
```

#### Mehrere Datenpunkte überwachen
```javascript
on({ id: /0_userdata\.0\.Mähroboter\.(Montag|Dienstag|Mittwoch)$/ }, function(obj) {
    // Reagiert auf Änderungen von Montag, Dienstag oder Mittwoch
    log(`${obj.id} geändert zu ${obj.state.val}`);
});
```

### Nützliche Funktionen
| Funktion | Beschreibung |
|----------|-------------|
| `getState(id)` | State lesen |
| `setState(id, val)` | State setzen |
| `on(id, callback)` | Auf Änderung reagieren |
| `schedule(cron, callback)` | Zeitgesteuert |
| `createState(id, val, opts)` | Datenpunkt erstellen |
| `log(text, level)` | Log-Ausgabe |
| `exec(cmd, callback)` | Shell-Befehl |
| `sendTo(adapter, cmd, msg)` | Adapter-Nachricht |
| `setStateDelayed(id, val, delay)` | Verzögertes Setzen |
| `getObject(id)` | Objekt-Definition lesen |

---

## Optimierungstipp: Schleifen statt Wiederholung

Anstatt den gleichen Blockly-Code 7x für jeden Wochentag zu kopieren, kann man in JavaScript eine Schleife verwenden:

```javascript
const tage = {
    'Montag': 'monday',
    'Dienstag': 'tuesday',
    'Mittwoch': 'wednesday',
    'Donnerstag': 'thursday',
    'Freitag': 'friday',
    'Samstag': 'saturday',
    'Sonntag': 'sunday'
};

const deviceId = '20223026720700350766';

// Für jeden Tag: An/Aus Handler
for (const [tagDE, tagEN] of Object.entries(tage)) {
    on(`0_userdata.0.Mähroboter.${tagDE}`, function(obj) {
        if (obj.state.val === true) {
            setState(`worx.0.${deviceId}.calendar.${tagEN}.startTime`, 
                     getState('0_userdata.0.Mähroboter.Startzeit').val);
            setState(`worx.0.${deviceId}.calendar.${tagEN}.workTime`, 
                     getState('0_userdata.0.Mähroboter.Arbeitszeit').val);
        } else {
            setState(`worx.0.${deviceId}.calendar.${tagEN}.workTime`, 0);
        }
    });
    
    // Rasenkante Handler
    on(`0_userdata.0.Mähroboter.${tagDE}_Rasenkante`, function(obj) {
        setState(`worx.0.${deviceId}.calendar.${tagEN}.borderCut`, obj.state.val);
    });
}
```

Dieses Skript ersetzt den gesamten repetitiven Blockly-Code mit ~25 Zeilen JavaScript.
