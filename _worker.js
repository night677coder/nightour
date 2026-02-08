import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    
    // Handle static assets
    if (url.pathname.startsWith('/_next/static/') || 
        url.pathname.startsWith('/favicon') || 
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.gif') ||
        url.pathname.endsWith('.webp')) {
      return getAssetFromKV(request, {
        mapRequestToAsset: req => new Request(`${req.url.replace(/\/$/, '')}/index.html`, req)
      });
    }
    
    // For all other requests, serve the index.html (client-side routing)
    return getAssetFromKV(request, {
      mapRequestToAsset: req => new Request(`${req.url.replace(/\/$/, '').replace(/\/[^\/]*$/, '')}/index.html`, req)
    });
    
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}
