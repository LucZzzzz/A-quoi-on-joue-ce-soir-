// Fonction serverless Vercel : description + genres d'un jeu, tirés de la page Steam.
// Appelée par le site via  fetch('/api/steam-info?appid=1145360')
// Aucune clé nécessaire : c'est l'API publique de la boutique Steam.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', ndash: '–', mdash: '—' };

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => (ENTITIES[name.toLowerCase()] !== undefined ? ENTITIES[name.toLowerCase()] : m));
}

// Texte brut propre : sans balises, entités décodées, espaces normalisés.
function cleanText(html) {
  const noTags = String(html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|h\d)>/gi, ' ')
    .replace(/<[^>]*>/g, '');
  return decodeEntities(noTags).replace(/\s+/g, ' ').trim();
}

// Coupe proprement (fin de phrase si possible, sinon fin de mot).
function shorten(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentence > max * 0.55) return cut.slice(0, sentence + 1);
  const word = cut.lastIndexOf(' ');
  return (word > 0 ? cut.slice(0, word) : cut).replace(/[\s,;:–-]+$/, '') + '…';
}

export default async function handler(req, res) {
  const appid = String(req.query.appid || '').replace(/\D/g, '');
  if (!appid || appid.length > 10) {
    res.status(400).json({ found: false, error: 'missing appid' });
    return;
  }
  try {
    const url = 'https://store.steampowered.com/api/appdetails?appids=' + appid + '&l=french&cc=fr';
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GameNightApp/1.0)',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.5',
      },
    });
    if (!r.ok) throw new Error('steam status ' + r.status);
    const json = await r.json();
    const entry = json && json[appid];
    if (!entry || !entry.success || !entry.data) {
      res.status(200).json({ found: false });
      return;
    }
    const d = entry.data;
    const description = shorten(cleanText(d.short_description) || cleanText(d.about_the_game), 340);
    if (!description) {
      res.status(200).json({ found: false });
      return;
    }
    const genres = (Array.isArray(d.genres) ? d.genres : [])
      .map((g) => cleanText(g && g.description))
      .filter(Boolean)
      .slice(0, 4);
    const developers = (Array.isArray(d.developers) ? d.developers : []).map(cleanText).filter(Boolean);
    const released = d.release_date && !d.release_date.coming_soon ? cleanText(d.release_date.date) : '';
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({
      found: true,
      appid: Number(appid),
      name: cleanText(d.name),
      description,
      genres,
      developer: developers[0] || '',
      released,
    });
  } catch (e) {
    res.status(200).json({ found: false, error: String((e && e.message) || e) });
  }
}
