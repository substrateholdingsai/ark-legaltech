/**
 * SENTINELA REGTECH WIDGET v1.0
 * Embeddable Regulatory Radar for Legal & Accounting Landing Pages
 * Usage: <script src="/widget.js" data-tenant="contagram"></script>
 */
(function() {
  const currentScript = document.currentScript || document.querySelector('script[data-tenant]');
  const tenantSlug = currentScript?.getAttribute('data-tenant') || 'contagram';
  const apiBase = currentScript ? new URL(currentScript.src).origin : window.location.origin;

  let alerts = [];

  async function fetchSentinelaData() {
    try {
      const res = await fetch(`${apiBase}/api/sentinela/feed?firm=${encodeURIComponent(tenantSlug)}&limit=3`);
      if (!res.ok) return;
      const data = await res.json();
      alerts = data.events || [];
      if (alerts.length > 0) {
        injectSentinelaPill(alerts[0]);
      }
    } catch (e) {
      // Graceful fallback
    }
  }

  function injectSentinelaPill(topAlert) {
    if (document.getElementById('sentinela-embed-pill')) return;

    const pill = document.createElement('div');
    pill.id = 'sentinela-embed-pill';
    pill.style.cssText = `
      position: fixed;
      bottom: 84px;
      right: 24px;
      background: rgba(7, 26, 48, 0.95);
      border: 1px solid #C9A227;
      border-radius: 9999px;
      padding: 8px 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6), 0 0 12px rgba(201,162,39,0.25);
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      color: #FBF9F4;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      z-index: 45;
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
      animation: pillFadeIn 0.3s ease;
    `;

    const sevColor = topAlert.severity === 'CRITICAL' ? '#CC766C' : '#C9A227';

    pill.innerHTML = `
      <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${sevColor};box-shadow:0 0 8px ${sevColor};animation:pulse 1.8s infinite;"></span>
      <span style="color:#DCE6F2;">🛰️ SENTINELA:</span>
      <span style="color:#E3C274;max-width:210px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${topAlert.title}</span>
      <span style="font-size:9px;color:#8FAAC6;border-left:1px solid #143353;padding-left:8px;">VER RADAR</span>
    `;

    pill.addEventListener('mouseenter', () => {
      pill.style.transform = 'translateY(-2px)';
      pill.style.boxShadow = '0 12px 28px rgba(201,162,39,0.4)';
    });
    pill.addEventListener('mouseleave', () => {
      pill.style.transform = 'none';
      pill.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6), 0 0 12px rgba(201,162,39,0.25)';
    });

    pill.addEventListener('click', () => {
      if (topAlert.defense_action?.whatsapp_url) {
        window.open(topAlert.defense_action.whatsapp_url, '_blank');
      } else {
        window.location.href = `/?firm=${encodeURIComponent(tenantSlug)}#radarSection`;
      }
    });

    document.body.appendChild(pill);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchSentinelaData);
  } else {
    fetchSentinelaData();
  }

  window.Sentinela = {
    getAlerts: () => alerts,
    tenant: tenantSlug,
  };
})();
