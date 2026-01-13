# Flightradar Flight Card

A custom Home Assistant card for displaying Flightradar flight information.

[![GitHub Release](https://img.shields.io/github/release/plckr/flightradar-flight-card.svg)](https://github.com/plckr/flightradar-flight-card/releases)
[![Community Forum](https://img.shields.io/static/v1.svg?label=Community&message=Forum&color=41bdf5&logo=HomeAssistant&logoColor=white)](https://community.home-assistant.io/t/flightradar24-flight-card/972609)
[![HACS](https://img.shields.io/badge/HACS-Default-orange.svg?logo=HomeAssistantCommunityStore&logoColor=white)](https://github.com/hacs/integration)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/plckr/flightradar-flight-card/refs/heads/main/card-examples/area-card-dark.png">
  <img alt="Area card example" src="https://raw.githubusercontent.com/plckr/flightradar-flight-card/refs/heads/main/card-examples/area-card-light.png" width="60%">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/plckr/flightradar-flight-card/refs/heads/main/card-examples/tracked-card-dark.png">
  <img alt="Area card example" src="https://raw.githubusercontent.com/plckr/flightradar-flight-card/refs/heads/main/card-examples/tracked-card-light.png" width="60%">
</picture>

## Prerequisites

This card requires the [Flightradar24 integration](https://github.com/AlexandrErohin/home-assistant-flightradar24) to be installed and configured in Home Assistant.

## Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=plckr&repository=flightradar-flight-card&category=plugin)

1. Open [HACS](https://www.hacs.xyz/) in your Home Assistant instance
2. Search for "Flightradar Flight Card"
3. Click "Install"
4. Refresh your browser

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

| Option                      | Type    | Required | Default | Description                                             |
| --------------------------- | ------- | -------- | ------- | ------------------------------------------------------- |
| `entities`                  | array   | Yes      | -       | List of flight sensor entities (see below)              |
| `units`                     | object  | No       | -       | Unit display preferences (see below)                    |
| `show_flightradar_link`     | boolean | No       | `true`  | Show link to Flightradar24 flight page                  |
| `show_airline_info_column`  | boolean | No       | `true`  | Show airline information column                         |
| `show_airline_logo`         | boolean | No       | `true`  | Show airline logo                                       |
| `show_aircraft_photo`       | boolean | No       | `true`  | Show aircraft photo                                     |
| `show_progress_bar`         | boolean | No       | `true`  | Show flight progress bar                                |
| `template_airline_logo_url` | string  | No       | -       | Custom airline logo URL template (see Templating below) |

### Entity Options

Each entity in the `entities` array supports the following options:

| Option      | Type   | Required | Description                         |
| ----------- | ------ | -------- | ----------------------------------- |
| `entity_id` | string | Yes      | The entity ID of your flight sensor |
| `title`     | string | No       | Custom title for this flight card   |

### Unit Options

You can customize the display units for altitude, distance, and ground speed:

| Option         | Type   | Default | Options                  | Description           |
| -------------- | ------ | ------- | ------------------------ | --------------------- |
| `altitude`     | string | `ft`    | `ft`, `FL`, `m`          | Altitude display unit |
| `distance`     | string | `km`    | `km`, `NM`               | Distance display unit |
| `ground_speed` | string | `kts`   | `kts`, `kmh`, `mph`, `M` | Ground speed unit     |

**Unit descriptions:**

- **Altitude**: `ft` (Feet), `FL` (Flight Level), `m` (Meters)
- **Distance**: `km` (Kilometers), `NM` (Nautical Miles)
- **Ground Speed**: `kts` (Knots), `kmh` (Kilometers per hour), `mph` (Miles per hour), `M` (Mach)

### Example Configuration

```yaml
type: custom:flightradar-flight-card
entities:
  - entity_id: sensor.flightradar24_current_in_area
    title: Flights Nearby
  - entity_id: sensor.flightradar24_most_tracked
    title: Most Tracked
units:
  altitude: ft
  distance: km
  ground_speed: kts
show_flightradar_link: true
show_airline_info_column: true
show_airline_logo: true
show_aircraft_photo: true
show_progress_bar: true
```

### Templating

The `template_airline_logo_url` option allows you to use a custom URL template for airline logos. The following variables are available for replacement:

| Variable | Description                              |
| -------- | ---------------------------------------- |
| `{ICAO}` | The airline's ICAO code (e.g., TAP, UAL) |

Example usage:

```yaml
type: custom:flightradar-flight-card
entities:
  - entity_id: sensor.flightradar24_current_in_area
template_airline_logo_url: 'https://example.com/logos/{ICAO}.png'
```

## Use case example

You can track the history of flights that flew by your home using [this method](https://github.com/AlexandrErohin/home-assistant-flightradar24?tab=readme-ov-file#last-flights-history-sensor).

With that new sensor, you can combine the `sensor.flightradar24_current_in_area` that comes by default with the integration, and then with the new sensor just created. That will make the card to display the currently in area first, and if no flight is around your home, it'll show the last flight.

Yaml example:

```yaml
type: custom:flightradar-flight-card
entities:
  - entity_id: sensor.flightradar24_current_in_area
    title: Flights Nearby
  - entity_id: sensor.flightradar24_area_history
    title: Last Flight
```

## Alternative use of Airline Logos

### Tail Airline Logos

<img src="https://airhex.com/images/photos/airline-tail-logos.png" alt="Airhex Tail Logos" width="48%" />

If you prefer different airline logos, you can use [Airhex](https://airhex.com/api/logos/) tail logos by setting the `template_airline_logo_url` option:

```yaml
template_airline_logo_url: 'https://content.airhex.com/content/logos/airlines_{ICAO}_40_40_f.png'
```

### Serving Airline Logos Offline

If you have devices (like wall-mounted tablets) that don't have internet access but still need to display airline logos, you can host the logos locally on your Home Assistant instance.

#### Setup

1. Download the airline logos from this repository's [`public/flightaware_logos`](https://github.com/plckr/flightradar-flight-card/tree/main/public/flightaware_logos) folder
2. Copy the logos to your Home Assistant `config/www/flightaware_logos/` folder
3. Configure the card to use the local path by setting the `template_airline_logo_url`:

```yaml
template_airline_logo_url: '/local/flightaware_logos/{ICAO}.png'
```

This way, all airline logos will be served directly from your Home Assistant instance, ensuring they display correctly even on devices without internet access.

## Credits

Huge thanks for [potseeslc](https://github.com/potseeslc/flight24-airline-card) that inspired me to create this custom card. The design is heavily inspired by his version.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
