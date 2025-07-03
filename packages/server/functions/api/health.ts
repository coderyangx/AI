export function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      environment: 'cloudflare-pages',
      timestamp: new Date().toISOString(),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
