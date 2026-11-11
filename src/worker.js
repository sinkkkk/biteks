/**
 * biteks.ee Worker
 *
 * Everything is a static file from ./public, except POST /api/contact, which
 * emails the contact form to siim@biteks.ee through Resend.
 *
 * Needs:
 *   RESEND_API_KEY   secret  (npm run cf -- secret put RESEND_API_KEY)
 *   CONTACT_LIMIT    rate-limit binding (wrangler.jsonc)
 */

const TO = 'siim@biteks.ee';
const FROM = 'biteks.ee <contact@biteks.ee>';
const MAX_BODY = 20_000; // bytes

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return contact(request, env, url);
    return env.ASSETS.fetch(request);
  },
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

async function contact(request, env, url) {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  // Only accept posts from this site's own pages.
  const origin = request.headers.get('Origin');
  if (!origin || new URL(origin).host !== url.host) return json(403, { error: 'forbidden' });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(413, { error: 'too_large' });
  let data;
  try { data = JSON.parse(raw); } catch { return json(400, { error: 'bad_json' }); }

  const name = clean(data.name, 100);
  const email = clean(data.email, 200);
  const message = String(data.message ?? '').trim().slice(0, 5000);

  // Honeypot: a hidden field people never see. Bots fill it; pretend it worked.
  if (String(data.website ?? '').trim()) return json(200, { ok: true });

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: 'invalid' });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.CONTACT_LIMIT) {
    const { success } = await env.CONTACT_LIMIT.limit({ key: ip });
    if (!success) return json(429, { error: 'rate_limited' });
  }

  if (!env.RESEND_API_KEY) return json(503, { error: 'not_configured' });

  const country = request.cf?.country ?? '?';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `biteks.ee: ${name}`,
      text: `${message}\n\n--\n${name} <${email}>\nsent from the biteks.ee terminal · ${country}`,
    }),
  });

  if (!res.ok) {
    console.error('resend failed', res.status, await res.text());
    return json(502, { error: 'send_failed' });
  }
  return json(200, { ok: true });
}

// Single line, no control characters, trimmed and capped.
function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}
