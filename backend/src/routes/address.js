import { Router } from 'express';
import axios from 'axios';

const router = Router();

/**
 * GET /address/lookup?postcode=1234AB&number=10
 * Retourneert { street, city, postcode, houseNumber }
 */
router.get('/lookup', async (req, res) => {
  const postcode = (req.query.postcode || '').toString().replace(/\s+/g, '');
  const number = (req.query.number || '').toString();

  if (!postcode || !number) {
    return res.status(400).json({ error: 'postcode en number verplicht' });
  }

  // PDOK BAG suggest+lookup flow (eenvoudig: zoek op postcode+huisnummer)
  try {
    const q = encodeURIComponent(`${postcode} ${number}`);
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${q}&rows=1`;
    const { data } = await axios.get(url, { timeout: 5000 });
    const doc = data?.response?.docs?.[0];
    if (!doc) return res.status(404).json({ error: 'Adres niet gevonden' });

    const street = doc.weergavenaam?.split(',')?.[0] || doc.straatnaam || '';
    const city = doc.woonplaatsnaam || '';
    return res.json({
      street,
      city,
      postcode,
      houseNumber: number
    });
  } catch (e) {
    console.error(e.message);
    return res.status(502).json({ error: 'Lookup service onbereikbaar' });
  }
});

export default router;
