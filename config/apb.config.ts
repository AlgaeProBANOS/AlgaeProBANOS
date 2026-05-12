export const baseUrl = new URL(
  process.env['NEXT_PUBLIC_API_BASE_URL'] ?? '',
);

export const mapboxAPIKey = process.env['NEXT_PUBLIC_MAPBOX_API_KEY'] ?? '';

export const defaultPageSize = 50;

export const baseAPIProject = "string_7";