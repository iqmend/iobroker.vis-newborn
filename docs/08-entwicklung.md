# ioBroker Adapter-Entwicklung

> Quelle: docs/de/dev/ aus ioBroker.docs

---

## Übersicht

Eigene Adapter für ioBroker entwickeln, um neue Geräte und Dienste zu integrieren.

---

## Entwickler-Tools

| Tool | URL | Beschreibung |
|------|-----|--------------|
| **Adapter Creator (Web)** | https://adapter-creator.iobroker.in/ | Web-basierter Template-Generator |
| **Adapter Creator (CLI)** | npm: `@iobroker/create-adapter` | Kommandozeilen-Generator |
| **Adapter Check** | https://adapter-check.iobroker.in/ | Validierung eines Adapters |
| **Übersetzer** | https://translator.iobroker.in/ | Text-Übersetzung als JSON |
| **Adapter Studio** | - | Standardisierte Adapter-Erstellung |

---

## Adapter erstellen (Schnellstart)

### 1. Template generieren
```bash
npx @iobroker/create-adapter
```

Der Generator fragt nach:
- Adapter-Name
- Beschreibung
- Autor
- Programmiersprache (JavaScript/TypeScript)
- Features (Admin UI, Testing, etc.)

### 2. Projektstruktur
```
ioBroker.meinAdapter/
├── admin/
│   ├── index_m.html     → Admin-Konfigurationsseite
│   └── style.css
├── lib/
│   └── tools.js
├── main.js              → Haupt-Adapter-Logik
├── io-package.json      → Adapter-Metadaten
├── package.json         → npm-Konfiguration
└── README.md
```

### 3. Wichtige Dateien

#### io-package.json
```json
{
    "common": {
        "name": "meinAdapter",
        "version": "0.1.0",
        "title": "Mein Adapter",
        "desc": { "de": "Beschreibung", "en": "Description" },
        "mode": "daemon",
        "platform": "Javascript/Node.js",
        "loglevel": "info",
        "enabled": true,
        "type": "general"
    },
    "native": {
        "option1": "default"
    }
}
```

#### main.js (Grundgerüst)
```javascript
'use strict';
const utils = require('@iobroker/adapter-core');

class MeinAdapter extends utils.Adapter {
    constructor(options) {
        super({ ...options, name: 'meinAdapter' });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        // Adapter gestartet
        this.log.info('Adapter gestartet');
        
        // Objekte erstellen
        await this.setObjectNotExistsAsync('testVariable', {
            type: 'state',
            common: {
                name: 'Test',
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: true,
            },
            native: {},
        });
        
        // State-Änderungen abonnieren
        this.subscribeStates('*');
    }

    onStateChange(id, state) {
        if (state && !state.ack) {
            // Benutzer hat Wert geändert
            this.log.info(`State ${id} changed to ${state.val}`);
        }
    }

    onUnload(callback) {
        // Aufräumen
        callback();
    }
}

if (require.main !== module) {
    module.exports = (options) => new MeinAdapter(options);
} else {
    new MeinAdapter();
}
```

---

## Adapter testen

### Lokal testen
```bash
# Im Adapter-Verzeichnis
npm test

# Manuell starten
node main.js --force --debug
```

### Adapter-Checker
```bash
npx @iobroker/adapter-checker
```

---

## Adapter veröffentlichen

1. **GitHub Repository** erstellen (Namenskonvention: `ioBroker.adapterName`)
2. **npm veröffentlichen:** `npm publish`
3. **Beta-Repository:** Antrag im ioBroker-Forum stellen
4. **Review-Prozess** durch die Community
5. **Stable-Repository:** Nach erfolgreichem Testing

---

## Best Practices

- **Logging:** Sinnvolle Log-Nachrichten auf verschiedenen Levels
- **Error Handling:** Fehler abfangen und loggen
- **Reconnect:** Automatische Wiederverbindung bei Verbindungsabbruch
- **Cleanup:** Ressourcen im `onUnload` freigeben
- **Dokumentation:** README.md mit Installationsanleitung und Konfiguration
- **i18n:** Texte mehrsprachig bereitstellen
- **Testing:** Unit-Tests und Integration-Tests
