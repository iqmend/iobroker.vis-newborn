# ioBroker Adapter-System

> Quelle: docs/de/basics/ und docs/de/adapterref/ aus ioBroker.docs

---

## Was sind Adapter?

Adapter sind **modulare Erweiterungen**, die ioBroker mit externen Geräten, Diensten und Protokollen verbinden. Jeder Adapter ist ein eigenständiges npm-Paket.

---

## Adapter vs. Instanzen

| Konzept | Beschreibung |
|---------|--------------|
| **Adapter** | Das Software-Paket (Template) |
| **Instanz** | Eine laufende Kopie des Adapters |

Ein Adapter kann **mehrere Instanzen** haben:
```
worx.0    → Erster Landroid
worx.1    → Zweiter Landroid (falls vorhanden)
```

---

## Adapter-Modi

| Modus | Beschreibung | Beispiel |
|-------|-------------|----------|
| `daemon` | Läuft dauerhaft | worx, hm-rpc |
| `subscribe` | Startet bei Datenpunkt-Änderung | - |
| `schedule` | Startet nach Zeitplan | backup |
| `once` | Startet einmal | installer |
| `extension` | Erweiterung eines anderen Adapters | - |

---

## Wichtige Adapter-Kategorien

### Kommunikation / Protokolle
- **mqtt** - MQTT Broker/Client
- **socketio** - Socket.IO
- **rest-api** - REST API

### Smart Home / Geräte
- **worx** - Worx Landroid Mähroboter
- **hm-rpc** / **hm-rega** - HomeMatic
- **shelly** - Shelly Geräte
- **zigbee** - ZigBee Geräte
- **zwave** - Z-Wave Geräte
- **sonoff** - Sonoff/Tasmota
- **tuya** - Tuya Smart Geräte
- **alexa2** - Amazon Alexa

### Logik / Automatisierung
- **javascript** - JavaScript, Blockly, TypeScript
- **node-red** - Node-RED
- **scenes** - Szenen-Management

### Visualisierung
- **vis** / **vis-2** - Visualisierung
- **material** - Material Design UI
- **lovelace** - Home Assistant Style UI

### Daten / Historie
- **history** - Datenhistorie (Datei-basiert)
- **influxdb** - InfluxDB Anbindung
- **sql** - SQL-Datenbank Historie

### System
- **admin** - Administrationsoberfläche
- **backitup** - Backup-Management
- **info** - Systeminformationen

---

## Adapter installieren

### Über Admin-Interface
1. Admin öffnen → Tab "Adapter"
2. Adapter suchen
3. "+" Button klicken → Installiert und erstellt Instanz
4. Instanz konfigurieren

### Über Kommandozeile
```bash
# Aus Repository installieren
iobroker install adapterName

# Bestimmte Version installieren
iobroker install adapterName@version

# Von GitHub installieren
iobroker install https://github.com/user/ioBroker.adapterName
```

---

## Adapter-Konfiguration

Jede Instanz hat eine eigene Konfiguration:
- Über Admin → Instanzen → Schraubenschlüssel-Symbol
- Konfiguration wird in `system.adapter.{name}.{instance}` gespeichert
- Native-Konfiguration unter `.native.*`

### Beispiel: Worx-Adapter
```
system.adapter.worx.0
├── native.username    → Worx-Account E-Mail
├── native.password    → Worx-Account Passwort
└── native.server      → Worx Cloud Server
```

---

## Adapter-Datenpunkte

Jeder Adapter erstellt automatisch Datenpunkte im Objektbaum:
```
{adapter}.{instanz}.{gerät}.{kanal}.{datenpunkt}
```

### Beispiel: Worx Landroid
```
worx.0.{geräteID}/
├── battery/
│   ├── cycles
│   └── percent          → Batterie-Prozent
├── calendar/
│   ├── monday/
│   │   ├── startTime    → Startzeit
│   │   ├── workTime     → Arbeitszeit (Min)
│   │   └── borderCut    → Rasenkante
│   ├── tuesday/...
│   └── calJson_sendto   → Kalender senden
├── mower/
│   ├── state            → Status
│   ├── error            → Fehlercode
│   └── online           → Online-Status
└── ...
```
