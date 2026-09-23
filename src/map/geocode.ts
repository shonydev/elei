export interface GeocodeResult {
  boundingbox: [string, string, string, string]; // [south, north, west, east]
}

export async function geocode(query: string): Promise<GeocodeResult> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = (await res.json()) as GeocodeResult[];
  if (!data.length) throw new Error('No se encontró el lugar');
  return data[0];
}
