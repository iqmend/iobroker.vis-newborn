# ioBroker Objekte & States

> Quelle: docs/de/dev/objectsschema.md aus ioBroker.docs

---

## Zwei Datentypen

ioBroker unterscheidet fundamental zwischen:

| | **Objekte (Objects)** | **States** |
|---|---|---|
| Änderungshäufigkeit | Selten | Häufig |
| Inhalt | Metadaten, Konfiguration, Struktur | Aktuelle Werte |
| Speicherung | Objects-DB | States-DB |
| Beispiel | Gerätedefinition, Rolleninfo | Temperatur = 22.5°C |

---

## ID-Struktur

### Aufbau
IDs sind **hierarchisch** mit Punkten als Trennzeichen:
```
namespace.instanz.gerät.kanal.datenpunkt
```

### Regeln
- Maximale Länge: **240 Bytes**
- Punkt (`.`) als Hierarchie-Trennzeichen
- **Verbotene Zeichen:** `[]*,;'"&#96;<>\\?`

### Beispiele
```
worx.0.20223026720700350766.calendar.monday.startTime
0_userdata.0.Mähroboter.Montag
system.adapter.javascript.0
enum.rooms.wohnzimmer
```

### Reservierte Namespaces
| Namespace | Zweck |
|-----------|-------|
| `system.` | Systemkonfiguration |
| `system.adapter.` | Adapter-Konfigurationen |
| `system.host.` | Host-Informationen |
| `enum.` | Aufzählungen (Räume, Funktionen) |
| `0_userdata.0.` | Benutzerdefinierte Datenpunkte |
| `alias.0.` | Aliase für Datenpunkte |

---

## Objekt-Typen

| Typ | Beschreibung | Beispiel |
|-----|--------------|---------|
| `state` | Einzelner Wert/Datenpunkt | Temperatur, Schaltzustand |
| `channel` | Gruppe von States | Gerätekategorie |
| `device` | Gruppe von Channels | Physisches Gerät |
| `enum` | Aufzählung | Raum, Funktion |
| `adapter` | Adapter-Definition | Installierter Adapter |
| `instance` | Adapter-Instanz | Laufende Instanz |
| `host` | Host-System | Server/Raspberry |
| `meta` | Metadaten | Adapter-Metainfo |
| `config` | Konfiguration | Systemeinstellungen |
| `script` | Skript | JavaScript/Blockly |
| `user` | Benutzer | Admin-User |
| `group` | Benutzergruppe | Administratoren |

---

## Objekt-Attribute

### Pflichtfelder
| Attribut | Beschreibung |
|----------|-------------|
| `_id` | Eindeutige ID |
| `type` | Objekt-Typ (siehe oben) |
| `common` | Allgemeine Eigenschaften |
| `native` | Adapter-spezifische Eigenschaften |

### common-Attribute (für States)
| Attribut | Typ | Beschreibung |
|----------|-----|-------------|
| `common.name` | string | Name des Datenpunkts |
| `common.type` | string | Datentyp (number, string, boolean, object, array, mixed) |
| `common.role` | string | Rolle/Funktion des Datenpunkts |
| `common.read` | boolean | Lesbar |
| `common.write` | boolean | Schreibbar |
| `common.unit` | string | Einheit (°C, %, W, etc.) |
| `common.min` | number | Minimalwert |
| `common.max` | number | Maximalwert |
| `common.def` | any | Standardwert |
| `common.desc` | string | Beschreibung |

---

## State-Attribute

Jeder State hat folgende Attribute:

| Attribut | Typ | Beschreibung |
|----------|-----|-------------|
| `val` | any | **Aktueller Wert** |
| `ack` | boolean | **Bestätigung** - true = vom Gerät bestätigt, false = vom User/Skript gesetzt |
| `ts` | number | **Timestamp** - Zeitpunkt der letzten Änderung (Unix ms) |
| `lc` | number | **Last Change** - Zeitpunkt der letzten Wertänderung |
| `from` | string | **Quelle** - Welcher Adapter den Wert gesetzt hat |
| `q` | number | **Quality** - Qualitätsindikator |

### ack-Flag Bedeutung
| Wert | Bedeutung | Beispiel |
|------|-----------|---------|
| `false` | **Kommando** - Benutzer/Skript will einen Wert setzen | Button gedrückt |
| `true` | **Bestätigung** - Gerät/Adapter bestätigt den Wert | Gerät hat reagiert |

### Quality-Werte (q)
| Wert | Bedeutung |
|------|-----------|
| `0x00` | OK |
| `0x01` | Allgemeiner Fehler |
| `0x02` | Verbindung nicht verbunden |
| `0x10` | Ersatzwert aus Controller |
| `0x40` | Wert abgelaufen |

---

## common.role - Rollen

Rollen beschreiben die **Funktion** eines Datenpunkts:

### Allgemeine Rollen
| Rolle | Beschreibung |
|-------|-------------|
| `state` | Generischer Zustand |
| `text` | Textfeld |
| `indicator` | Anzeige/Indikator |
| `switch` | Schalter (An/Aus) |
| `button` | Taster |
| `level` | Regler/Dimmer |
| `value` | Messwert |

### Geräte-spezifische Rollen
| Rolle | Beschreibung |
|-------|-------------|
| `switch.light` | Lichtschalter |
| `level.dimmer` | Dimmer (0-100%) |
| `level.blind` | Rollladen (0-100%) |
| `level.temperature` | Soll-Temperatur |
| `value.temperature` | Ist-Temperatur |
| `value.humidity` | Luftfeuchtigkeit |
| `value.power` | Leistung (W) |
| `value.battery` | Batterie-Stand |
| `indicator.connected` | Verbindungsstatus |
| `indicator.lowbat` | Batterie schwach |

---

## Userdata-Datenpunkte erstellen

Eigene Datenpunkte unter `0_userdata.0.*`:

### Über Admin
1. Objekte → `0_userdata.0` → "+" Button
2. Typ wählen (state, channel, device)
3. Eigenschaften definieren

### Über JavaScript
```javascript
createState('0_userdata.0.Mähroboter.Montag', false, {
    name: 'Montag An/Aus',
    type: 'boolean',
    role: 'switch',
    read: true,
    write: true
});
```
