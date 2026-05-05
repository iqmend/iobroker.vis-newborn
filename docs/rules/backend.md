# Backend Rules

## Zweck
Backend-Regeln für ioBroker-Skripte, Datenpunktstruktur und Automatisierungslogik.

## Regeln
- Nutze `0_userdata.0` für benutzerdefinierte Zustände und Steuerungsdaten.
- Verwende klare Namen für Datenpunkte, z. B. `Zentralfunktionen.waschmaschine-alexa-ansage`.
- Speichere binäre Zustände als Boolean, nicht als String, wenn möglich.
- Verwende Scripts und Blockly so, dass externe Änderungen konsistent bleiben.
- Vermeide hardcodierte Werte in UI-Widgets; lese Werte über Datenpunkte.

## Beispiel
- `0_userdata.0.Zentralfunktionen.waschmaschine-alexa-ansage` sollte als boolean geführt werden.
- Scripts prüfen den Wert mit `if (state.val === true) { ... }`.
- Ändere den Wert extern über `setState('0_userdata.0.Zentralfunktionen.waschmaschine-alexa-ansage', true);`.
