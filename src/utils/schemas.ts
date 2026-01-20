import * as v from 'valibot';

function fallbackNull<T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(schema: T) {
  return v.fallback(schema, null);
}

const callsignSchema = fallbackNull(
  v.pipe(
    v.string(),
    v.transform((value) => value.replace(/\u0004/, '')),
    v.transform((value) => (value === 'Blocked' ? null : value))
  )
);

export type FRMostTrackedFlight = v.InferOutput<typeof mostTrackedFlightSchema>;

export const mostTrackedFlightSchema = v.object({
  _type: v.optional(v.literal('tracked'), 'tracked'),
  id: v.string(),
  flight_number: fallbackNull(v.string()),
  callsign: callsignSchema,
  squawk: fallbackNull(v.string()),
  clicks: v.number(),
  airport_origin_code_iata: fallbackNull(v.string()),
  airport_origin_city: fallbackNull(v.string()),
  airport_destination_code_iata: fallbackNull(v.string()),
  airport_destination_city: fallbackNull(v.string()),
  aircraft_code: fallbackNull(v.string()),
  aircraft_model: fallbackNull(v.string()),
  on_ground: fallbackNull(v.number()),
  tracked_by_device: v.optional(v.string()),
});

export type FRAreaFlight = v.InferOutput<typeof areaFlightSchema>;

export const areaFlightSchema = v.object({
  _type: v.optional(v.literal('area'), 'area'),
  id: v.string(),
  flight_number: fallbackNull(v.string()),
  callsign: callsignSchema,
  aircraft_registration: fallbackNull(v.string()),
  aircraft_photo_small: fallbackNull(v.string()),
  aircraft_photo_medium: fallbackNull(v.string()),
  aircraft_photo_large: fallbackNull(v.string()),
  aircraft_model: v.string(),
  aircraft_code: v.string(),
  airline: fallbackNull(v.string()),
  airline_short: fallbackNull(v.string()),
  airline_iata: fallbackNull(v.string()),
  airline_icao: fallbackNull(v.string()),
  airport_origin_name: fallbackNull(v.string()),
  airport_origin_code_iata: fallbackNull(v.string()),
  airport_origin_code_icao: fallbackNull(v.string()),
  airport_origin_country_name: fallbackNull(v.string()),
  airport_origin_country_code: fallbackNull(v.string()),
  airport_origin_city: fallbackNull(v.string()),
  airport_origin_timezone_offset: fallbackNull(v.number()),
  airport_origin_timezone_abbr: fallbackNull(v.string()),
  airport_origin_terminal: fallbackNull(v.string()),
  airport_origin_latitude: fallbackNull(v.number()),
  airport_origin_longitude: fallbackNull(v.number()),
  airport_destination_name: fallbackNull(v.string()),
  airport_destination_code_iata: fallbackNull(v.string()),
  airport_destination_code_icao: fallbackNull(v.string()),
  airport_destination_country_name: fallbackNull(v.string()),
  airport_destination_country_code: fallbackNull(v.string()),
  airport_destination_city: fallbackNull(v.string()),
  airport_destination_timezone_offset: fallbackNull(v.number()),
  airport_destination_timezone_abbr: fallbackNull(v.string()),
  airport_destination_terminal: fallbackNull(v.string()),
  airport_destination_latitude: fallbackNull(v.number()),
  airport_destination_longitude: fallbackNull(v.number()),
  time_scheduled_departure: fallbackNull(v.number()),
  time_scheduled_arrival: fallbackNull(v.number()),
  time_real_departure: fallbackNull(v.number()),
  time_real_arrival: fallbackNull(v.number()),
  time_estimated_departure: fallbackNull(v.number()),
  time_estimated_arrival: fallbackNull(v.number()),
  latitude: v.number(),
  longitude: v.number(),
  altitude: v.number(),
  heading: v.number(),
  ground_speed: v.number(),
  squawk: v.string(),
  vertical_speed: v.number(),
  distance: v.number(),
  closest_distance: v.optional(v.number()),
  on_ground: v.nullable(v.number()),
  /** Additional tracked doesn't have this property */
  tracked_by_device: v.optional(v.string()),
});

export function parseFlight(
  data: unknown
): FRMostTrackedFlight | FRAreaFlight | { _type: 'unknown' } {
  return v.parse(
    v.fallback(
      v.union([
        mostTrackedFlightSchema,
        areaFlightSchema,
        v.object({ _type: v.literal('unknown') }),
      ]),
      { _type: 'unknown' }
    ),
    data
  );
}
