/**
 * Branded email templates (inline-styled HTML for max client support).
 * Matches the Karu visual language: warm champagne accents, deep graphite.
 */

const BRAND = '#cf9f3e';
const INK = '#161719';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function shell(content: string, preheader = ''): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:${INK}">
<span style="display:none;opacity:0;color:#f6f6f7">${preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f7;padding:32px 0">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.06)">
<tr><td style="background:${INK};padding:28px 36px">
<span style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#fff">Karu</span>
<span style="color:${BRAND};font-size:22px;font-weight:700"> ·</span>
<span style="color:#9aa0a6;font-size:13px;float:right;padding-top:6px">handcrafted · trusted</span>
</td></tr>
<tr><td style="padding:36px">${content}</td></tr>
<tr><td style="padding:24px 36px;background:#fafafa;border-top:1px solid #eee;color:#888;font-size:12px">
Karu Marketplace · Bengaluru, India<br/>
<a href="${APP_URL}" style="color:${BRAND};text-decoration:none">karu.market</a> ·
<a href="${APP_URL}/account/notifications" style="color:#888">manage notifications</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${INK};color:#fff;text-decoration:none;padding:13px 26px;border-radius:10px;font-weight:600;font-size:14px">${label}</a>`;
}

export function orderConfirmationEmail(p: {
  name: string;
  orderNumber: string;
  total: string;
  items: { title: string; qty: number; price: string }[];
}): { subject: string; html: string } {
  const rows = p.items
    .map(
      (i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #eee">${i.title} <span style="color:#888">× ${i.qty}</span></td><td align="right" style="padding:10px 0;border-bottom:1px solid #eee">${i.price}</td></tr>`
    )
    .join('');
  return {
    subject: `Order confirmed — ${p.orderNumber}`,
    html: shell(
      `<h1 style="font-size:24px;margin:0 0 8px">Thank you, ${p.name} 🎉</h1>
<p style="color:#555;line-height:1.6">Your order <b>${p.orderNumber}</b> is confirmed. The artisans are preparing your handcrafted pieces with care.</p>
<table width="100%" style="margin:24px 0;font-size:14px">${rows}
<tr><td style="padding:14px 0;font-weight:700">Total</td><td align="right" style="padding:14px 0;font-weight:700">${p.total}</td></tr></table>
${btn('Track your order', `${APP_URL}/account/orders`)}`,
      `Order ${p.orderNumber} confirmed`
    ),
  };
}

export function shippingUpdateEmail(p: {
  name: string;
  orderNumber: string;
  carrier: string;
  tracking: string;
}): { subject: string; html: string } {
  return {
    subject: `Your order ${p.orderNumber} has shipped`,
    html: shell(
      `<h1 style="font-size:24px;margin:0 0 8px">On its way, ${p.name} 📦</h1>
<p style="color:#555;line-height:1.6">Order <b>${p.orderNumber}</b> shipped via <b>${p.carrier}</b>.</p>
<p style="color:#555">Tracking: <b>${p.tracking}</b></p>
${btn('Track shipment', `${APP_URL}/account/orders`)}`
    ),
  };
}

export function refundEmail(p: {
  name: string;
  orderNumber: string;
  amount: string;
  partial: boolean;
}): { subject: string; html: string } {
  return {
    subject: `Refund ${p.partial ? 'partially ' : ''}processed — ${p.orderNumber}`,
    html: shell(
      `<h1 style="font-size:24px;margin:0 0 8px">Refund processed</h1>
<p style="color:#555;line-height:1.6">Hi ${p.name}, a ${p.partial ? 'partial ' : ''}refund of <b>${p.amount}</b> for order <b>${p.orderNumber}</b> is on its way back to your account (3–5 business days).</p>
${btn('View order', `${APP_URL}/account/orders`)}`
    ),
  };
}

export function sellerNewOrderEmail(p: {
  storeName: string;
  orderNumber: string;
  itemCount: number;
}): { subject: string; html: string } {
  return {
    subject: `New order for ${p.storeName} — ${p.orderNumber}`,
    html: shell(
      `<h1 style="font-size:24px;margin:0 0 8px">You have a new order ✨</h1>
<p style="color:#555;line-height:1.6"><b>${p.storeName}</b> received order <b>${p.orderNumber}</b> with ${p.itemCount} item(s).</p>
${btn('Open seller dashboard', `${APP_URL}/seller/orders`)}`
    ),
  };
}

export function welcomeEmail(p: { name: string }): { subject: string; html: string } {
  return {
    subject: 'Welcome to Karu',
    html: shell(
      `<h1 style="font-size:26px;margin:0 0 8px">Welcome, ${p.name}.</h1>
<p style="color:#555;line-height:1.7">You've joined a marketplace where every object carries a story and every purchase supports a maker. Discover handcrafted treasures from across India.</p>
${btn('Start exploring', `${APP_URL}/discover`)}`
    ),
  };
}
