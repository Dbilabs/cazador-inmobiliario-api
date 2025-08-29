import express from 'express';
import cors from 'cors';

const app = express();

// Configurar CORS para permitir todas las solicitudes (necesario para GPT)
app.use(cors({
  origin: '*',
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '2mb' }));

// Ruta de comprobación de vida
app.get('/', (req, res) => res.json({ ok: true, name: 'Cazador Inmobiliario API', version: '1.0.0' }));

// Ruta para guardar un lead
app.post('/lead', (req, res) => {
  const { name, email, whatsapp, territory, strategy = 'renta', consent = true } = req.body || {};
  if (!name || !email || !whatsapp) {
    return res.status(400).json({ ok: false, error: 'name, email y whatsapp son obligatorios' });
  }
  return res.json({ ok: true, lead_id: 'demo-' + Math.random().toString(36).slice(2), stored: { name, email, whatsapp, territory, strategy, consent } });
});

// Ruta para iniciar una búsqueda
app.post('/search', (req, res) => {
  return res.status(202).json({ job_id: 'job-' + Math.random().toString(36).slice(2), eta_hint: 'few seconds' });
});

// Ruta para obtener resultados de búsqueda
app.get('/search/:jobId/results', (req, res) => {
  const listings = [
    { id: 'listing-1', source: 'demo', url: 'https://example.com/depto', title: 'Depto 2 amb en Belgrano', description: 'Luminoso, a reciclar', price: 120000, currency: 'USD', price_m2: 2666, address: 'Av. Cabildo 1500', neighborhood: 'Belgrano', city: 'CABA', property_type: 'depto', bedrooms: 1, bathrooms: 1, m2_total: 45, m2_cubiertos: 45, dom: 110, condition: 'a_reciclar', amenities: ['balcón'], images: ['https://picsum.photos/seed/before/800/500'], flags: ['baja de precio'] },
    { id: 'listing-2', source: 'demo', url: 'https://example.com/ph', title: 'PH 3 amb Villa Crespo', description: 'Con patio, ideal flip', price: 160000, currency: 'USD', price_m2: 1777, address: 'Aguirre 800', neighborhood: 'Villa Crespo', city: 'CABA', property_type: 'PH', bedrooms: 2, bathrooms: 1, m2_total: 90, m2_cubiertos: 75, dom: 45, condition: 'usado', amenities: ['patio'], images: ['https://picsum.photos/seed/ph/800/500'], flags: ['a refaccionar'] }
  ];
  return res.json({ listings });
});

// Ruta para evaluar listados según la estrategia
app.post('/evaluate', (req, res) => {
  const { listings = [], strategy = 'renta' } = req.body || {};
  const base = listings.length ? listings : [
    { id: 'listing-1', title: 'Depto 2 amb en Belgrano', price: 120000, m2_total: 45, dom: 110 },
    { id: 'listing-2', title: 'PH 3 amb Villa Crespo', price: 160000, m2_total: 90, dom: 45 }
  ];
  const ranked = base.map((l, i) => ({
    listing: l,
    score_total: 70 + (i === 0 ? 18 : 12),
    metrics: { cap_rate_net: i === 0 ? 5.9 : 5.1, discount_vs_comps_pct: i === 0 ? 14 : 9 },
    rationale: strategy === 'flip' ? 'Buen ARV potencial' : 'Precio competitivo y demanda'
  }));
  return res.json({ ranked, winner_id: ranked[0].listing.id });
});

// Ruta para generar imagen de remodelación
app.post('/image/remodel', (req, res) => {
  const { image_url, style = 'Escandinavo' } = req.body || {};
  if (!image_url) return res.status(400).json({ ok: false, error: 'image_url es obligatorio' });
  return res.json({ before_url: image_url, after_url: 'https://picsum.photos/seed/after/800/500', style_used: style });
});

// Ruta para generar reporte en PDF
app.post('/report/pdf', (req, res) => {
  const { winner_id = 'listing-1' } = req.body || {};
  return res.json({ pdf_url: `https://example.com/report-${winner_id}.pdf` });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cazador Inmobiliario API escuchando en puerto ${PORT}`));
