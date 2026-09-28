// Fonction serverless Vercel : récupère la bibliothèque Steam d'un joueur.
// Appelée par le site via  fetch('/api/steam-library?profile=...')
//
// Nécessite la variable d'environnement STEAM_API_KEY (clé gratuite :
// https://steamcommunity.com/dev/apikey). Elle reste côté serveur : elle
// n'apparaît jamais dans index.html ni dans le navigateur des joueurs.
//
// Le profil Steam du joueur doit avoir « Détails du jeu » réglé sur Public.

const STEAM_API = 'https://api.steampowered.com';
const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps/';

// Accepte : lien de profil (/profiles/7656… ou /id/pseudo), ID à 17 chiffres, ou pseudo seul.
function parseProfile(input) {
  const s = String(input || '').trim();
  if (!s || s.length > 200) return { steamid: null, vanity: null };
  const byId = s.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (byId) return { steamid: byId[1], vanity: null };
  const byVanity = s.match(/steamcommunity\.com\/id\/([^/?#\s]+)/i);
  if (byVanity) return { steamid: null, vanity: decodeURIComponent(byVanity[1]) };
  if (/^\d{17}$/.test(s)) return { steamid: s, vanity: null };
  if (/^[\w.\-]{2,64}$/.test(s)) return { steamid: null, vanity: s };
  return { steamid: null, vanity: null };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const key = process.env.STEAM_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'no_key' });
    return;
  }

  let { steamid, vanity } = parseProfile(req.query.profile);
  if (!steamid && !vanity) {
    res.status(400).json({ error: 'not_found' });
    return;
  }

  try {
    if (!steamid) {
      const rv = await fetch(
        STEAM_API + '/ISteamUser/ResolveVanityURL/v1/?key=' + encodeURIComponent(key) +
        '&vanityurl=' + encodeURIComponent(vanity)
      );
      if (rv.status === 401 || rv.status === 403) {
        res.status(500).json({ error: 'bad_key' });
        return;
      }
      const jv = await rv.json();
      if (!jv.response || jv.response.success !== 1 || !jv.response.steamid) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      steamid = jv.response.steamid;
    }

    const rg = await fetch(
      STEAM_API + '/IPlayerService/GetOwnedGames/v1/?key=' + encodeURIComponent(key) +
      '&steamid=' + steamid +
      '&include_appinfo=1&include_played_free_games=1&format=json'
    );
    if (rg.status === 401 || rg.status === 403) {
      res.status(500).json({ error: 'bad_key' });
      return;
    }
    if (!rg.ok) throw new Error('steam status ' + rg.status);
    const jg = await rg.json();
    const list = jg && jg.response && jg.response.games;

    // Profil privé (ou sans aucun jeu) : Steam renvoie un objet "response" vide.
    if (!Array.isArray(list) || !list.length) {
      res.status(403).json({ error: 'private', steamid });
      return;
    }

    const games = list
      .filter((g) => g && g.name)
      .map((g) => ({
        appid: g.appid,
        name: g.name,
        playtime: g.playtime_forever || 0, // en minutes
        image: CDN + g.appid + '/library_600x900.jpg',
        fallbackImage: CDN + g.appid + '/header.jpg',
      }))
      .sort((a, b) => b.playtime - a.playtime);

    res.status(200).json({ steamid, count: games.length, games });
  } catch (e) {
    res.status(502).json({ error: 'steam_error', message: String((e && e.message) || e) });
  }
}
