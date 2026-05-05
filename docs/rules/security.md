# Security Rules

## Zweck
Sicherheitsregeln für ioBroker-Dokumentation und Dashboard-Entwicklung.

## Regeln
- Keine Passwörter, Tokens oder API-Keys in Widget-HTML oder öffentlichen Markdown-Dateien speichern.
- Setze nur die notwendigen Zugriffsrechte für Admin, VIS und Adapter.
- Vermeide `eval()` oder dynamisch erzeugtes JavaScript im Widget.
- Benutze nur definierte Datenpunkt-IDs in Widgets.
- Halte die UI-Codebasis sauber und nachvollziehbar, damit kein unerwarteter Datenzugriff entsteht.
