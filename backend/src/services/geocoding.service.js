export async function buscarCoordenadas(endereco) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "VesteBem/1.0",
        "Accept-Language": "pt-BR",
      },
    });
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}