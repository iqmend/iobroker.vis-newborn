# ioBroker Visualisierung

> Quelle: docs/de/viz/ aus ioBroker.docs

---

## Übersicht

ioBroker bietet mehrere Visualisierungsoptionen:

| Adapter | Beschreibung | Schwierigkeit |
|---------|-------------|---------------|
| **vis** | Klassische Visualisierung (HTML5 Canvas) | Mittel |
| **vis-2** | Moderne Visualisierung (React-basiert) | Mittel |
| **material** | Material Design UI | Einfach |
| **lovelace** | Home Assistant Style | Einfach-Mittel |
| **jarvis** | Dashboard Builder | Einfach |
| **habpanel** | Panel-basierte UI | Einfach |

---

## VIS / VIS-2

VIS ist der **Standard-Visualisierungsadapter** für ioBroker.

### Installation
```bash
iobroker install vis-2
```

### Zugriff
- **Editor:** `http://<IP>:8082/vis-2/edit.html`
- **Runtime:** `http://<IP>:8082/vis-2/index.html`

### Konzepte
| Konzept | Beschreibung |
|---------|-------------|
| **Projekt** | Container für alle Views |
| **View** | Einzelne Seite/Bildschirm |
| **Widget** | UI-Element (Button, Slider, Text, Bild) |
| **Binding** | Verknüpfung Widget ↔ Datenpunkt |

### Widget-Typen
- **Basic:** Text, HTML, Image, iFrame
- **Controls:** Button, Switch, Slider, Select, Input
- **Display:** Gauge, Bar, Chart, LED, Icon
- **Container:** Group, View-in-Widget, Tab

### Datenpunkt-Binding
Widgets können direkt an ioBroker-Datenpunkte gebunden werden:
```
{0_userdata.0.Mähroboter.Montag}           → Wert anzeigen
{worx.0.{id}.battery.percent;val}           → Batterie-Prozent
{worx.0.{id}.mower.state;val}               → Mäher-Status
```

---

## Mähroboter-Dashboard (aktuelles Setup)

Das bestehende VIS-Dashboard zeigt:

### Oberer Bereich
- **Roboter-Bild** (Worx Landroid)
- **Batterie-Stand:** z.B. "Batterie 99%"
- **Status:** z.B. "Status: in Ladestation"

### Wochenplan-Tabelle
| Spalte | Widget-Typ | Datenpunkt |
|--------|-----------|-----------|
| Fahrzeit (Mo-So) | Label | Statischer Text |
| An/Aus | Switch/Toggle | `0_userdata.0.Mähroboter.{Tag}` |
| Rasenkante | Switch/Toggle | `0_userdata.0.Mähroboter.{Tag}_Rasenkante` |

### Unterer Bereich
| Element | Widget-Typ | Datenpunkt |
|---------|-----------|-----------|
| Start-Zeit | Time Picker | `0_userdata.0.Mähroboter.Startzeit` |
| End-Zeit | Time Picker | (berechnet aus Startzeit + Arbeitszeit) |
| "Plan an Roboter senden" | Button | `0_userdata.0.Mähroboter.Wert-An-Roboter-Senden` |

---

## Widget-Sets (Erweiterungen)

Beliebte Widget-Sets für VIS:
| Widget-Set | Beschreibung |
|-----------|-------------|
| `vis-material-design` | Material Design Widgets |
| `vis-inventwo` | Universelle Widgets |
| `vis-timeandweather` | Wetter und Zeit |
| `vis-google-fonts` | Google Fonts |
| `vis-justgage` | Gauge Anzeigen |
| `vis-widgets-weather` | Wetter-Widgets |

---

## Tipps für VIS-Gestaltung

1. **Responsive Design:** Views für verschiedene Bildschirmgrößen anlegen
2. **View-in-Widget:** Wiederverwendbare Komponenten erstellen
3. **CSS nutzen:** Eigenes Styling über CSS-Klassen
4. **Bindings:** Formatierung mit `{id;val;format}` Syntax
5. **Signalbilder:** Status-Icons basierend auf Datenpunkt-Werten
