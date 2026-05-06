# ioBroker Installation

> Quelle: docs/de/install/ aus ioBroker.docs

---

## Linux / Raspberry Pi

### Voraussetzungen
- Raspberry Pi mit Raspberry OS oder Debian/Ubuntu
- OS im **Server-Modus** installieren (ohne Desktop)
- Qualitäts-Netzteil für Raspberry Pi verwenden
- **NICHT als root installieren** - normalen Benutzer verwenden

### Installation
```bash
curl -sLf https://iobroker.net/install.sh | bash -
```

### Nach der Installation
- Web-Interface erreichbar unter: `http://localhost:8081`
- Oder von anderem Gerät: `http://<Server-IP>:8081`

### Empfohlene Plattformen
- Raspberry Pi 3/4/5 mit Raspberry Pi OS Lite
- Debian 11/12 (Bullseye/Bookworm)
- Ubuntu 22.04/24.04 LTS

---

## Windows

### Voraussetzungen
- Internetverbindung während der Installation
- Windows 10/11

### Installation
1. **ioBroker Windows Installer** herunterladen
2. Installer ausführen (installiert Node.js automatisch)
3. Standard-Installationsordner: `C:\ioBroker`

### Funktionen des Installers (ab v3.1.0)
- Node.js aktualisieren
- Fixer ausführen
- Firewall-Regeln verwalten
- Autostart konfigurieren
- Experten-Modus für mehrere ioBroker-Server und Alpha-Versionen

### Hinweise
- ioBroker läuft unter Windows genauso gut wie unter Linux
- Windows hat **Nachteile für 24/7-Betrieb** (Updates, Neustarts)
- **Port-Konflikt:** Port 9001 kann mit Intel Graphics Command Center kollidieren

---

## Docker

### Voraussetzungen
- Docker installiert und konfiguriert
- Systemvoraussetzungen prüfen

### Offizielle Docker-Dokumentation
- https://docs.buanet.de/de/iobroker-docker-image/

### Grundlegendes Setup
```bash
docker pull buanet/iobroker:latest

docker run -d \
  --name iobroker \
  --hostname iobroker \
  -p 8081:8081 \
  -v iobroker-data:/opt/iobroker \
  buanet/iobroker:latest
```

---

## Nach der Installation - Erste Schritte

1. **Admin-Interface öffnen:** `http://<IP>:8081`
2. **Sprache einstellen** (falls nicht automatisch erkannt)
3. **Lizenzbedingungen akzeptieren**
4. **Wichtige Adapter installieren:**
   - `admin` (bereits vorinstalliert)
   - `javascript` (für Skripte und Blockly)
   - `vis` oder `vis-2` (für Visualisierung)
   - Gerätespezifische Adapter (z.B. `worx` für Landroid)
5. **Adapter konfigurieren** (Zugangsdaten, Verbindungen)
6. **Erste Datenpunkte prüfen** im Objekte-Tab

---

## Updates

### ioBroker aktualisieren
```bash
# js-controller aktualisieren
iobroker update
iobroker upgrade self

# Einzelnen Adapter aktualisieren
iobroker upgrade adapterName

# Alle Adapter aktualisieren
iobroker upgrade
```

### Node.js aktualisieren
- Linux: Über das Installationsskript oder manuell
- Windows: Über den ioBroker Windows Installer
- Docker: Neues Image pullen
