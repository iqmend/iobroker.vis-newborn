# ioBroker Troubleshooting & FAQ

> Quelle: docs/de/trouble/ und docs/de/faq/ aus ioBroker.docs

---

## Diagnose-Informationen sammeln

Bei Problemen diese Informationen bereithalten:

```bash
# Node.js Version
node -v

# npm Version
npm -v

# ioBroker Version
iobroker version

# js-controller Version
iobroker version js-controller

# Betriebssystem
uname -a        # Linux
systeminfo      # Windows

# Adapter-Version
iobroker version adapterName
```

---

## Log-Management

### Log-Zugriff
- **Admin UI:** Menüpunkt "Log"
- **Dateisystem:** `/opt/iobroker/log/` (Linux) oder `C:\ioBroker\log\` (Windows)
- **Aufbewahrung:** 7 Tage

### Log-Level konfigurieren
| Level | Beschreibung | Einsatz |
|-------|-------------|---------|
| `error` | Nur Fehler | Produktion (minimal) |
| `warn` | Fehler + Warnungen | Produktion |
| `info` | Standard-Meldungen | **Standard** |
| `debug` | Detaillierte Meldungen | Fehlersuche |
| `silly` | Alles | Tiefe Analyse |

**Pro Instanz einstellen:** Admin → Instanzen → Schraubenschlüssel → Log-Level

### Wichtig
- Debug-Level nur **temporär** aktivieren (erzeugt viel Output)
- Nach Debugging zurück auf `info` setzen
- Log-Dateien können sehr groß werden bei `debug`/`silly`

---

## Häufige Probleme & Lösungen

### Node.js Version inkompatibel
**Symptom:** Adapter startet nicht, Fehlermeldung zu Node.js
**Lösung:**
```bash
# Aktuelle Node.js LTS installieren (20.x empfohlen)
# Linux:
curl -sLf https://iobroker.net/install.sh | bash -

# Windows: ioBroker Installer → Node.js aktualisieren
```

### Adapter startet nicht
**Symptome:** Instanz zeigt rot, Fehler im Log
**Schritte:**
1. Log auf `debug` setzen und Instanz neustarten
2. Log-Meldungen prüfen
3. Adapter-Version prüfen (Update verfügbar?)
4. Adapter deinstallieren und neu installieren
5. Node-Module neu installieren:
   ```bash
   cd /opt/iobroker
   iobroker stop
   npm install iobroker.adapterName --production
   iobroker start
   ```

### Datenbank-Probleme
**Symptom:** ioBroker startet nicht, Datenbankfehler
**Lösung:**
```bash
# Fixer ausführen
curl -sLf https://iobroker.net/fix.sh | bash -

# Oder manuell:
iobroker stop
iobroker setup first
iobroker start
```

### Speicher/RAM-Probleme
**Symptom:** System langsam, Adapter stürzen ab
**Maßnahmen:**
- Unnötige Adapter-Instanzen deaktivieren
- History-Adapter: Weniger Datenpunkte loggen
- Node.js Heap-Size anpassen:
  ```bash
  iobroker set javascript.0 --memLimit 512
  ```

### Port-Konflikte
**Symptom:** Admin oder andere Adapter nicht erreichbar
**Prüfen:**
```bash
# Linux
netstat -tlnp | grep 8081

# Windows
netstat -ano | findstr 8081
```

### Syntax-Fehler in Skripten
**Symptom:** JavaScript-Adapter meldet Fehler
**Lösung:**
1. Skript im Admin-Editor auf Fehler prüfen
2. Log-Meldungen analysieren
3. Skript deaktivieren und schrittweise testen

---

## FAQ

### Allgemein

**Was ist ioBroker?**
Eine Open-Source IoT-Plattform zur Integration verschiedener Smart-Home-Systeme.

**Welche Hardware wird benötigt?**
Minimum: Raspberry Pi 3 mit 2 GB RAM. Empfohlen: Raspberry Pi 4/5 mit 4+ GB RAM oder ein Intel NUC / Mini-PC.

**Ist ioBroker kostenlos?**
Ja, ioBroker ist Open Source (MIT-Lizenz). Einige Cloud-Dienste sind kostenpflichtig.

### Installation

**Welche Node.js Version?**
Node.js 20.x LTS wird empfohlen. Immer LTS-Versionen verwenden.

**Kann ich ioBroker auf Windows betreiben?**
Ja, aber Linux wird für 24/7-Betrieb empfohlen (weniger Updates, stabiler).

### Adapter

**Wie finde ich den richtigen Adapter?**
Admin → Adapter → Suche. Oder auf https://www.iobroker.net/#de/adapters

**Was ist der Unterschied zwischen Stable und Beta?**
Stable = getestet und stabil. Beta = neueste Features, möglicherweise Bugs.

### Backup

**Wie erstelle ich ein Backup?**
1. Adapter `backitup` installieren
2. Automatische Backups konfigurieren
3. Oder manuell: `iobroker backup`

**Was wird gesichert?**
Konfiguration, Objekte, States, Skripte, Adapter-Einstellungen.

### Fortgeschritten

**Redis als States-DB?**
Ja, für große Installationen empfohlen:
```bash
iobroker setup custom
```

**Multihost-Setup?**
Ja, möglich. Ein Master-Host + beliebig viele Slave-Hosts.

**SSL/HTTPS aktivieren?**
Über Admin-Konfiguration oder Let's Encrypt Adapter.

---

## Nützliche Kommandozeilen-Befehle

```bash
# Status
iobroker status           # Gesamtstatus
iobroker list instances   # Alle Instanzen
iobroker list adapters    # Installierte Adapter

# Steuerung
iobroker start            # ioBroker starten
iobroker stop             # ioBroker stoppen
iobroker restart          # ioBroker neustarten
iobroker start worx.0     # Einzelne Instanz starten
iobroker stop worx.0      # Einzelne Instanz stoppen

# Updates
iobroker update           # Repository aktualisieren
iobroker upgrade          # Alle Adapter updaten
iobroker upgrade self     # js-controller updaten

# Datenpunkte
iobroker state get worx.0.{id}.battery.percent    # Wert lesen
iobroker state set 0_userdata.0.test true          # Wert setzen

# Objekte
iobroker object get system.adapter.worx.0          # Objekt lesen

# Backup
iobroker backup                                     # Backup erstellen
iobroker restore <backup-datei>                     # Backup wiederherstellen

# Reparatur
iobroker fix                                        # Berechtigungen reparieren
iobroker setup first                                # Ersteinrichtung wiederholen
```
