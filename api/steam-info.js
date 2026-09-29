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

// Catégories Steam indiquant qu'un jeu se joue à plusieurs (identifiants stables de l'API Steam).
// 1=Multijoueur 9=Coop 20=MMO 24=Multi local 27=Multiplateforme 36=PvP en ligne
// 37=PvP écran partagé 38=Coop en ligne 39=Coop écran partagé 47=Coop LAN 48=PvP LAN
const MULTIPLAYER_CATEGORY_IDS = new Set([1, 9, 20, 24, 27, 36, 37, 38, 39, 47, 48]);

async function fetchAppDetails(appid) {
  const url = 'https://store.steampowered.com/api/appdetails?appids=' + appid + '&l=french&cc=fr';
  const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; GameNightApp/1.0)', 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.5' };
  let r = await fetch(url, { headers });
  if (r.status === 429 || r.status === 403) {
    // L'API boutique Steam est très vite limitée en débit ; une seule tentative
    // suffit généralement, sans quoi mieux vaut renvoyer "non trouvé" que bloquer.
    await new Promise((res) => setTimeout(res, 1200));
    r = await fetch(url, { headers });
  }
  if (!r.ok) throw new Error('steam status ' + r.status);
  return r.json();
}

// Repli : SteamSpy, hébergé ailleurs que Steam et généralement épargné quand
// l'API boutique Steam elle-même bloque les appels venant d'un serveur (ce
// qu'elle fait couramment pour les hébergeurs comme Vercel). Les tags
// communautaires qu'il fournit suffisent à repérer le multijoueur, même sans
// description.
const STEAMSPY_MULTIPLAYER_TAGS = new Set([
  'Multiplayer', 'Co-op', 'Online Co-Op', 'Local Co-Op', 'Online Multiplayer',
  'Local Multiplayer', 'LAN Co-op', 'LAN PvP', 'PvP', 'Online PvP', 'Local PvP',
  'MMO', 'Massively Multiplayer', 'Team-Based', 'Battle Royale', '4 Player Local',
]);
async function fetchSteamSpy(appid) {
  const r = await fetch('https://steamspy.com/api.php?request=appdetails&appid=' + appid, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GameNightApp/1.0)' },
  });
  if (!r.ok) throw new Error('steamspy status ' + r.status);
  const d = await r.json();
  if (!d || d.appid == null) return null;
  const tags = d.tags && typeof d.tags === 'object' && !Array.isArray(d.tags) ? Object.keys(d.tags) : [];
  return {
    multiplayer: tags.some((t) => STEAMSPY_MULTIPLAYER_TAGS.has(t)),
    genres: String(d.genre || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4),
    developer: cleanText(d.developer || ''),
  };
}

export default async function handler(req, res) {
  const appid = String(req.query.appid || '').replace(/\D/g, '');
  if (!appid || appid.length > 10) {
    res.status(400).json({ found: false, error: 'missing appid' });
    return;
  }

  let steamOk = false, description = '', genres = [], developer = '', released = '', name = '';
  let multiplayer, multiplayerSource = null;

  try {
    const json = await fetchAppDetails(appid);
    const entry = json && json[appid];
    if (entry && entry.success && entry.data) {
      steamOk = true;
      const d = entry.data;
      name = cleanText(d.name);
      const categories = (Array.isArray(d.categories) ? d.categories : []).map((c) => c && c.id);
      if (categories.length) { multiplayer = categories.some((id) => MULTIPLAYER_CATEGORY_IDS.has(id)); multiplayerSource = 'steam'; }
      description = shorten(cleanText(d.short_description) || cleanText(d.about_the_game), 340);
      genres = (Array.isArray(d.genres) ? d.genres : []).map((g) => cleanText(g && g.description)).filter(Boolean).slice(0, 4);
      developer = ((Array.isArray(d.developers) ? d.developers : []).map(cleanText).filter(Boolean))[0] || '';
      released = d.release_date && !d.release_date.coming_soon ? cleanText(d.release_date.date) : '';
    }
  } catch (e) { /* la boutique Steam a échoué ou nous a bloqués : on tente SteamSpy ci-dessous */ }

  if (multiplayerSource === null) {
    try {
      const sp = await fetchSteamSpy(appid);
      if (sp) {
        multiplayer = sp.multiplayer; multiplayerSource = 'steamspy';
        if (!genres.length) genres = sp.genres;
        if (!developer) developer = sp.developer;
      }
    } catch (e) { /* les deux sources ont échoué : on renverra ce qu'on a, éventuellement rien */ }
  }

  if (!steamOk && multiplayerSource === null) {
    res.status(200).json({ found: false, error: 'unreachable' });
    return;
  }
  if (!description) {
    res.status(200).json({ found: false, multiplayer });
    return;
  }
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  res.status(200).json({ found: true, appid: Number(appid), name, description, genres, developer, released, multiplayer });
}
