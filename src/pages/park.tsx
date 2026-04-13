/** @jsxImportSource hono/jsx */
import { Layout, ParkGiveLogo } from './layout';
import type { Zone } from '../lib/types';

const PARK_SCRIPT = `
(function () {
  var DURATIONS = [
    { hours: 1,  cents: 200,  label: '1 Hour'  },
    { hours: 2,  cents: 400,  label: '2 Hours' },
    { hours: 4,  cents: 800,  label: '4 Hours' },
    { hours: 24, cents: 1000, label: 'All Day'  },
  ];
  var PRESETS = [0, 200, 500, 1000];
  var state = { durIdx: 0, presetIdx: 0, customCents: 0, isCustom: false };

  function fee(sub) { return Math.round(sub * 0.029 + 30); }
  function fmt(c)   { return '$' + (c / 100).toFixed(2); }
  function donationCents() { return state.isCustom ? state.customCents : PRESETS[state.presetIdx]; }

  var BRAND      = '#4B8EC1';
  var BRAND_DARK = '#3A7BAF';
  var BRAND_LITE = '#EBF5FF';

  function render() {
    var dur = DURATIONS[state.durIdx];
    var don = donationCents();
    var f   = fee(dur.cents + don);
    var tot = dur.cents + don + f;

    // Duration buttons — inline styles so Tailwind CDN isn't needed for dynamic states
    document.querySelectorAll('[data-dur]').forEach(function(btn, i) {
      var sel = i === state.durIdx;
      btn.style.cssText = sel
        ? 'border:2px solid '+BRAND+';background:'+BRAND_LITE+';box-shadow:0 0 0 1px '+BRAND+';border-radius:0.75rem;padding:0.75rem;text-align:left;width:100%;cursor:pointer;'
        : 'border:1px solid #e5e7eb;background:white;border-radius:0.75rem;padding:0.75rem;text-align:left;width:100%;cursor:pointer;';
      var lbl = btn.querySelector('.dur-label');
      var prc = btn.querySelector('.dur-price');
      if (lbl) { lbl.style.color = sel ? BRAND_DARK : '#4b5563'; }
      if (prc) { prc.style.color = sel ? BRAND      : '#111827'; }
    });

    // Donation preset buttons
    document.querySelectorAll('[data-preset]').forEach(function(btn, i) {
      var sel = !state.isCustom && i === state.presetIdx;
      btn.style.cssText = sel
        ? 'background:'+BRAND+';color:white;border:1px solid '+BRAND+';border-radius:0.75rem;padding:0.5rem;font-size:0.875rem;font-weight:500;cursor:pointer;'
        : 'background:white;color:#374151;border:1px solid #e5e7eb;border-radius:0.75rem;padding:0.5rem;font-size:0.875rem;font-weight:500;cursor:pointer;';
    });

    // Custom donation input ring
    var ci = document.getElementById('custom-don');
    ci.style.outline = state.isCustom ? '2px solid '+BRAND : 'none';
    ci.style.borderColor = state.isCustom ? BRAND : '#e5e7eb';

    document.getElementById('sum-parking').textContent = fmt(dur.cents);
    document.getElementById('sum-dur-label').textContent = dur.label;
    document.getElementById('sum-fee').textContent = fmt(f);
    document.getElementById('sum-total').textContent = fmt(tot);
    document.getElementById('submit-btn').textContent = 'Pay ' + fmt(tot);

    var donRow = document.getElementById('sum-don-row');
    if (don > 0) {
      donRow.style.display = 'flex';
      document.getElementById('sum-don').textContent = fmt(don);
    } else {
      donRow.style.display = 'none';
    }
  }

  document.querySelectorAll('[data-dur]').forEach(function(btn, i) {
    btn.addEventListener('click', function() { state.durIdx = i; render(); });
  });
  document.querySelectorAll('[data-preset]').forEach(function(btn, i) {
    btn.addEventListener('click', function() {
      state.presetIdx = i; state.isCustom = false;
      document.getElementById('custom-don').value = '';
      render();
    });
  });
  document.getElementById('custom-don').addEventListener('input', function(e) {
    var v = parseFloat(e.target.value) || 0;
    state.customCents = Math.max(0, Math.round(v * 100));
    state.isCustom = true;
    render();
  });

  document.getElementById('park-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var plate = document.getElementById('plate').value.trim().toUpperCase();
    if (!plate) { showErr('Please enter your license plate.'); return; }

    var btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Redirecting to payment\u2026';
    hideErr();

    try {
      var dur = DURATIONS[state.durIdx];
      var zoneId = document.getElementById('park-form').dataset.zoneId || null;
      var res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licensePlate: plate,
          durationHours: dur.hours,
          donationCents: donationCents(),
          zoneId: zoneId,
        }),
      });
      var data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      throw new Error(data.error || 'Checkout failed.');
    } catch(err) {
      showErr(err.message || 'Something went wrong. Please try again.');
      btn.disabled = false;
      render();
    }
  });

  function showErr(msg) {
    var el = document.getElementById('err-msg');
    el.textContent = msg; el.style.display = 'block';
  }
  function hideErr() { document.getElementById('err-msg').style.display = 'none'; }

  render();
})();
`;

interface Props {
  zone: Zone;
}

export function ParkPage({ zone }: Props) {
  return (
    <Layout title={`Pay to Park — ${zone.name} | ParkGive`}>
      <div class="min-h-screen bg-gray-50 flex flex-col">

        {/* Header */}
        <header class="bg-white px-6 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
          <a href="/" class="text-gray-400 hover:text-gray-600 text-lg leading-none">←</a>
          <ParkGiveLogo size="sm" />
        </header>

        {/* Zone banner */}
        <div class="bg-brand text-white px-6 py-4">
          <div class="max-w-md mx-auto flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 flex flex-col items-center justify-center border border-white/25">
              <span class="text-white/80 text-xs font-bold leading-tight">{zone.id.split('-')[0]}</span>
              <span class="text-white font-extrabold text-base leading-tight">{zone.id.split('-')[1]}</span>
            </div>
            <div>
              <p class="font-bold text-white leading-tight">{zone.name}</p>
              <p class="text-brand-soft text-xs mt-0.5">{zone.address}</p>
            </div>
          </div>
        </div>

        <div class="flex-1 px-6 py-8 max-w-md mx-auto w-full">
          <h1 class="text-xl font-bold text-gray-900 mb-1">Pay to Park</h1>
          <p class="text-gray-500 text-sm mb-6">
            Proceeds support the local youth program.
          </p>

          <form id="park-form" data-zone-id={zone.id} class="space-y-6">

            {/* License plate */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                License Plate <span class="text-red-500">*</span>
              </label>
              <input
                id="plate"
                type="text"
                maxLength={10}
                placeholder="ABC 1234"
                autocomplete="off"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 text-xl font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>

            {/* Duration */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <div class="grid grid-cols-2 gap-2">
                {[
                  { hours: 1,  price: '$2.00',  label: '1 Hour'  },
                  { hours: 2,  price: '$4.00',  label: '2 Hours' },
                  { hours: 4,  price: '$8.00',  label: '4 Hours' },
                  { hours: 24, price: '$10.00', label: 'All Day' },
                ].map(({ label, price }) => (
                  <button type="button" data-dur="1" class="p-3 rounded-xl border text-left border-gray-200 bg-white w-full">
                    <p class="dur-label text-sm font-medium text-gray-600">{label}</p>
                    <p class="dur-price text-xl font-bold text-gray-900 mt-0.5">{price}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Donation */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Extra Donation <span class="text-gray-400 font-normal">(optional)</span>
              </label>
              <div class="grid grid-cols-4 gap-2 mb-2">
                {['None', '+$2', '+$5', '+$10'].map((label) => (
                  <button type="button" data-preset="1" class="py-2 rounded-xl text-sm font-medium border bg-white text-gray-700 border-gray-200">
                    {label}
                  </button>
                ))}
              </div>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">$</span>
                <input
                  id="custom-don"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Custom amount"
                  class="w-full pl-7 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* Price summary */}
            <div class="bg-white rounded-xl p-4 space-y-2 text-sm border border-gray-100 shadow-sm">
              <div class="flex justify-between text-gray-600">
                <span>Parking (<span id="sum-dur-label">1 Hour</span>)</span>
                <span id="sum-parking">$2.00</span>
              </div>
              <div id="sum-don-row" style="display:none" class="flex justify-between text-gray-600">
                <span>Donation ♥</span>
                <span id="sum-don">$0.00</span>
              </div>
              <div class="flex justify-between text-gray-400 text-xs">
                <span>Processing fee</span>
                <span id="sum-fee">$0.36</span>
              </div>
              <div class="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 text-base">
                <span>Total</span>
                <span id="sum-total">$2.36</span>
              </div>
            </div>

            <div id="err-msg" style="display:none" class="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-xl py-2 px-4" />

            <button
              id="submit-btn"
              type="submit"
              class="w-full bg-brand text-white font-bold text-lg py-4 rounded-2xl hover:bg-brand-dark transition-colors shadow-sm"
            >
              Pay $2.36
            </button>

            <p class="text-center text-xs text-gray-400">
              🔒 Secured by Stripe · Proceeds support the local youth program
            </p>
          </form>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: PARK_SCRIPT }} />
    </Layout>
  );
}
