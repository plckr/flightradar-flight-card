# Flightradar Flight Card

A custom Home Assistant card for displaying Flightradar flight information.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/plckr/flightradar-flight-card.svg)](https://github.com/plckr/flightradar-flight-card/releases)

![Area card example](./card-examples/area-card.png)

![Tracked card example](./card-examples/tracked-card.png)

## Prerequisites

This card requires the [Flightradar24 integration](https://www.home-assistant.io/integrations/flightradar24/) to be installed and configured in Home Assistant.

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Frontend"
3. Click the three dots in the top right corner and select "Custom repositories"
4. Add this repository URL and select "Lovelace" as the category
5. Click "Install"
6. Refresh your browser

### Manual Installation

1. Download `flightradar-flight-card.js` from the [latest release](https://github.com/plckr/flightradar-flight-card/releases/latest)
2. Copy it to your `config/www` folder
3. Add the resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **Add Resource**
   - URL: `/local/flightradar-flight-card.js`
   - Resource Type: JavaScript Module

## Usage

Add the card to your dashboard:

```yaml
type: custom:flightradar-flight-card
entities:
  - entity_id: sensor.flightradar24_current_in_area
```

### Configuration Options

Card will look for a `flights` attribute in the entity provided, in case it doesn't find, it'll try the next entity. This is useful for cases where you maintain a list of current in area, and no flight is actually in the area at that moment, so the card will pick the next entity so that the card can always have something to render.

| Option        | Type   | Required | Description                               |
| ------------- | ------ | -------- | ----------------------------------------- |
| `entities`    | array  | Yes      | List of flight sensor entities to display |
| `- entity_id` | string | Yes      | The entity ID of your flight sensor       |
| `- title`     | string | No       | Custom title for this flight card         |

### Example Configuration

```yaml
type: custom:flightradar-flight-card
entities:
  - entity_id: sensor.flightradar24_current_in_area
    title: Flights Nearby
  - entity_id: sensor.flightradar24_most_tracked
    title: Most Tracked
```

## Credits

Huge thanks for [potseeslc](https://github.com/potseeslc/flight24-airline-card) that inspired me to create this custom card. The design is heavily inspired by his version.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
