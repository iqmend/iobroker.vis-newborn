# ioBroker Admin-Interface

> Quelle: docs/de/admin/ aus ioBroker.docs

---

## Übersicht

Der **Admin-Adapter** ist die zentrale Verwaltungsoberfläche von ioBroker. Er wird über einen Webbrowser aufgerufen:

```
http://<Server-IP>:8081
```

---

## Hauptbereiche

Das Interface besteht aus drei Hauptbereichen:

### 1. Menüleiste (oben)
Navigation zwischen den verschiedenen Bereichen

### 2. Hauptfenster (Mitte)
Zeigt den Inhalt des gewählten Menüpunkts

### 3. Systemeinstellungen
Globale Konfiguration des ioBroker-Systems

---

## Menüpunkte

### Übersicht
- Dashboard mit Systemstatus
- Laufende Instanzen
- Systemressourcen (CPU, RAM, Speicher)

### Adapter
- **Alle verfügbaren Adapter** durchsuchen und installieren
- Filterung nach Kategorie, Name, Popularität
- Adapter aktualisieren
- Verschiedene Quellen: Stable, Beta, GitHub

### Instanzen
- **Laufende Adapter-Instanzen** verwalten
- Start/Stop/Neustart einzelner Instanzen
- Konfiguration pro Instanz
- Log-Level pro Instanz einstellen

### Objekte
- **Gesamter Objektbaum** durchsuchen und bearbeiten
- Hierarchische Ansicht aller Datenpunkte
- Werte direkt setzen und lesen
- Objekte erstellen, bearbeiten, löschen
- Filter und Suche

### Aufzählungen (Enums)
- **Räume** (rooms) und **Funktionen** (functions) verwalten
- Geräte Räumen und Funktionen zuordnen
- Eigene Kategorien erstellen

### Log
- **Echtzeit-Log-Ausgabe** aller Adapter
- Filter nach Adapter, Log-Level, Zeitraum
- Log-Level: error, warn, info, debug, silly
- Logs werden **7 Tage** im Log-Verzeichnis gespeichert

### Benutzer
- **Benutzer und Gruppen** verwalten
- Zugriffsrechte konfigurieren
- Passwörter setzen

### Hosts
- **ioBroker-Hosts** verwalten (bei Multihost-Setup)
- Systeminfo pro Host
- js-controller Version

### Skripte
- **JavaScript/Blockly-Editor** direkt im Browser
- Skripte erstellen, bearbeiten, testen
- Blockly: Visuelle Programmierung
- TypeScript-Unterstützung

### Dateien
- **Dateibrowser** für ioBroker-interne Dateien
- Adapter-spezifische Dateien
- Upload/Download

---

## Systemeinstellungen

### Wichtige Einstellungen
| Einstellung | Beschreibung |
|-------------|--------------|
| Sprache | Interface-Sprache |
| Temperatureinheit | °C oder °F |
| Datumsformat | Regionale Einstellungen |
| Standard-Repository | Stable oder Beta |
| Aktives Repository | Quelle für Adapter-Updates |
| Expertenmodus | Erweiterte Optionen anzeigen |

---

## Tipps
- **Expertenmodus** aktivieren für erweiterte Funktionen
- **Backup** regelmäßig über den Admin erstellen
- **Log-Level** für Debugging temporär auf "debug" setzen, danach zurück auf "info"
- **Objekte-Tab** ist sehr nützlich zum Debuggen von Datenpunkten
