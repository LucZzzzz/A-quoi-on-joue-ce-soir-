// Fonction serverless Vercel — tourne côté serveur, donc pas de blocage CORS.
// Appelée par le site via  fetch('/api/steam-cover?name=...')
export default async function handler(req, res) {
  const name = (req.query.name || '').toString().trim();
  if (!name) {
    res.status(400).json({ found: false, error: 'missing name' });
    return;
  }
  try {
    const url =
      'https://store.steampowered.com/api/storesearch/?term=' +
      encodeURIComponent(name) +
      '&cc=fr&l=french';
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GameNightApp/1.0)' },
    });
    if (!r.ok) throw new Error('steam api status ' + r.status);
    const data = await r.json();
    const item = data && Array.isArray(data.items) ? data.items[0] : null;
    if (!item) {
      res.status(200).json({ found: false });
      return;
    }
    const appid = item.id;
    // Jaquette portrait (celle utilisée dans la bibliothèque Steam elle-même)
    const image = 'https://cdn.cloudflare.steamstatic.com/steam/apps/' + appid + '/library_600x900.jpg';
    // Filet de sécurité si la jaquette portrait n'existe pas pour ce jeu
    const fallbackImage = 'https://cdn.cloudflare.steamstatic.com/steam/apps/' + appid + '/header.jpg';
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ found: true, appid, name: item.name, image, fallbackImage });
  } catch (e) {
    res.status(200).json({ found: false, error: String(e && e.message || e) });
  }
}
