# ioBroker Grundlagen

> Quelle: docs/de/basics/ aus ioBroker.docs

---

## Was ist ioBroker?

ioBroker ist eine **Integrationsplattform für das Internet der Dinge (IoT)**. Sie dient als zentraler Verbindungspunkt für verschiedene Smart-Home-Systeme, Geräte und Dienste.

### Kernkonzepte
- **Einheitliche Plattform:** Verbindet über 600 verschiedene Systeme und Protokolle
- **Modular:** Erweiterbar durch Adapter
- **Open Source:** Kostenlos und quelloffen
- **Plattformübergreifend:** Läuft auf Linux, Windows, macOS, Docker, Raspberry Pi

---

## Architektur

### js-controller
Der **js-controller** ist das Herzstück von ioBroker:
- Zentrale Datenverwaltung und Inter-Modul-Kommunikation
- Verwaltet alle Adapter-Instanzen
- Steuert den Objektbaum und die States-Datenbank
- Basiert auf **Node.js**

### Adapter
**Adapter** sind eigenständige Module, die Geräte und Dienste integrieren:
- Jede Adapter-Instanz läuft in einem **eigenen Prozess**
- Kommunikation über den js-controller
- Installation über npm/ioBroker-Repository
- Über 600 Adapter verfügbar

### Instanzen
- Ein Adapter kann **mehrere Instanzen** haben
- Jede Instanz hat eine eindeutige Nummer (z.B. `worx.0`, `worx.1`)
- Instanzen laufen unabhängig voneinander

### Multihost
- ioBroker unterstützt **verteilte Installationen** über mehrere Server
- Ein Master-Host mit dem js-controller
- Slave-Hosts können zusätzliche Adapter ausführen
- Nützlich für die Verteilung der Last

---

## Datenstruktur

### Namespaces
Daten sind hierarchisch nach Namespaces organisiert:
```
AdapterName.InstanzNummer.Kanal.Datenpunkt
```

**Beispiele:**
```
worx.0.20223026720700350766.calendar.monday.startTime
javascript.0.scriptEnabled.common
0_userdata.0.Mähroboter.Montag
```

### Objekte vs. States
| | Objekte | States |
|---|---------|--------|
| Änderungshäufigkeit | Selten | Häufig |
| Inhalt | Metadaten, Konfiguration | Aktuelle Werte |
| Beispiel | Gerätedefinition, Rollen | Temperatur, Schaltzustand |

---

## Repositories

Repositories sind zentrale Speicherorte für Adapter-Pakete.

### Zwei Repository-Typen
| Repository | URL | Beschreibung |
|------------|-----|--------------|
| **Stable** | `http://download.iobroker.net/sources-dist.json` | Produktionsreif, getestet |
| **Beta** | `http://download.iobroker.net/sources-dist-latest.json` | Zum Testen, neueste Features |

### Adapter-Lifecycle
1. Entwickler erstellt Adapter
2. Adapter wird im **Beta-Repository** veröffentlicht
3. Nach Tests und Feedback → Aufnahme ins **Stable-Repository**

### Adapter von GitHub installieren
- Im **Experten-Modus** → Tab "Von NPM"
- Adapter können direkt von GitHub installiert werden, ohne Repository zu wechseln

---

## Systemvoraussetzungen

| Anforderung | Empfehlung |
|-------------|------------|
| Node.js | **20.x LTS** (empfohlen) |
| RAM | 2-4 GB (Standard), mehr bei vielen Adaptern |
| Speicher | Min. 16 GB (SD-Karte/SSD) |
| Betriebssystem | Debian/Ubuntu Linux, Windows, macOS |
| Hardware | Raspberry Pi 3/4/5, NUC, Server, VM |
