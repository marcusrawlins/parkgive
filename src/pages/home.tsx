/** @jsxImportSource hono/jsx */
import { Layout, ParkGiveLogo } from './layout';
import type { Zone } from '../lib/types';

interface Props {
  zones: Zone[];
  totalCents: number;
}

export function HomePage({ zones, totalCents }: Props) {
  return (
    <Layout>
      <div class="min-h-screen bg-white flex flex-col">

        {/* ── Nav ── */}
        <header class="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
          <ParkGiveLogo size="md" />
          <div class="flex items-center gap-5">
            <a href="#mission" class="text-sm text-gray-500 hover:text-gray-800 hidden sm:block">Our Mission</a>
            <a href="#partner" class="text-sm text-gray-500 hover:text-gray-800 hidden sm:block">Partner With Us</a>
            <a href="/admin" class="text-sm text-gray-400 hover:text-gray-600">Admin</a>
          </div>
        </header>

        {/* ── Hero ── */}
        <section class="bg-brand text-white px-6 pt-16 pb-20 text-center">
          <div class="max-w-xl mx-auto">
            <p class="text-brand-soft text-sm font-semibold uppercase tracking-widest mb-4">
              Park with Purpose
            </p>
            <h1 class="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Find your zone.<br />Support your community.
            </h1>
            <p class="text-brand-soft text-lg mb-8 max-w-md mx-auto">
              Every parking fee goes directly to youth programs at the organization that owns the lot.
            </p>
            {totalCents > 0 && (
              <div class="inline-block bg-white/10 rounded-2xl px-6 py-4 border border-white/20">
                <p class="text-brand-muted text-xs uppercase tracking-widest mb-1">Total raised for youth programs</p>
                <p class="text-3xl font-bold">${(totalCents / 100).toFixed(2)}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Zone finder ── */}
        <section class="px-6 py-12 max-w-2xl mx-auto w-full" id="zones">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Find a Parking Zone</h2>
          <p class="text-gray-500 text-sm mb-6">Select a zone below to pay for parking. Each zone has a QR code posted on-site.</p>

          {zones.length === 0 ? (
            <div class="bg-gray-50 rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
              No active zones yet.
            </div>
          ) : (
            <div class="space-y-4">
              {zones.map((zone) => (
                <a href={`/zone/${zone.id}`} class="block group">
                  <div class="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-brand hover:shadow-md transition-all">
                    <div class="flex items-center gap-4">
                      {/* Zone badge */}
                      <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-light flex flex-col items-center justify-center">
                        <span class="text-brand text-xs font-bold leading-tight">{zone.id.split('-')[0]}</span>
                        <span class="text-brand font-extrabold text-lg leading-tight">{zone.id.split('-')[1]}</span>
                      </div>
                      <div>
                        <p class="font-bold text-gray-900 text-lg leading-tight">{zone.name}</p>
                        <p class="text-gray-500 text-sm mt-0.5">{zone.address}</p>
                        {zone.description && (
                          <p class="text-gray-400 text-xs mt-1">{zone.description}</p>
                        )}
                      </div>
                    </div>
                    <div class="flex-shrink-0 text-right">
                      <span class="inline-flex items-center gap-1 text-brand font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        Park Here <span class="text-base">→</span>
                      </span>
                      <p class="text-gray-400 text-xs mt-1">from $2.00</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ── How it works ── */}
        <section class="bg-gray-50 px-6 py-14" id="how">
          <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">How ParkGive Works</h2>
            <div class="grid sm:grid-cols-3 gap-6">
              {[
                { n: '1', title: 'Find your zone', body: 'Scan the QR code in the lot or find your zone on this page.' },
                { n: '2', title: 'Pay to park',    body: 'Choose your duration and pay securely with any card, Apple Pay, or Google Pay.' },
                { n: '3', title: 'Give back',      body: 'Your parking fee goes directly to the youth program of the organization that owns the lot.' },
              ].map(({ n, title, body }) => (
                <div class="text-center">
                  <div class="w-12 h-12 rounded-full bg-brand text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4">{n}</div>
                  <h3 class="font-bold text-gray-900 mb-2">{title}</h3>
                  <p class="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission ── */}
        <section class="px-6 py-16 max-w-2xl mx-auto w-full" id="mission">
          <div class="text-center mb-8">
            <img src="/logo-full.png" alt="ParkGive" class="h-24 w-auto mx-auto mb-6 opacity-90" />
            <h2 class="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p class="text-gray-600 leading-relaxed max-w-lg mx-auto">
              ParkGive is an independent platform that turns underutilized church and organization parking lots into a revenue stream for youth programs. We're not affiliated with any specific church — we partner with organizations who want to put their parking lot to work for a good cause.
            </p>
          </div>
          <div class="grid sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: '🏫', title: 'Youth Programs', body: '100% of parking fees go directly to the youth program of the partnering organization.' },
              { icon: '🤝', title: 'Community First', body: 'Visitors park with confidence knowing their money is supporting something meaningful.' },
              { icon: '📍', title: 'Local Impact', body: 'Every zone is tied to a real organization and a real community making a real difference.' },
            ].map(({ icon, title, body }) => (
              <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center">
                <span class="text-3xl mb-3 block">{icon}</span>
                <h3 class="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                <p class="text-gray-500 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Partner CTA ── */}
        <section class="bg-brand px-6 py-16 text-center" id="partner">
          <div class="max-w-xl mx-auto">
            <h2 class="text-3xl font-extrabold text-white mb-3">Is your lot sitting empty?</h2>
            <p class="text-brand-soft mb-8 text-lg">
              If your church, school, or organization has a parking lot that visitors use, ParkGive can turn it into a fundraiser for your youth programs — at no cost to you.
            </p>
            <div class="grid sm:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { icon: '💸', title: 'Free to set up', body: 'No upfront costs. We only earn a small service fee per transaction.' },
                { icon: '⚡', title: 'Live in days',   body: 'We handle the payment system, QR signs, and everything else.' },
                { icon: '🎯', title: 'You keep 100%',  body: 'All parking fees go directly to your organization\'s youth program.' },
              ].map(({ icon, title, body }) => (
                <div class="bg-white/10 rounded-xl p-4 border border-white/20">
                  <span class="text-2xl block mb-2">{icon}</span>
                  <h3 class="font-bold text-white text-sm mb-1">{title}</h3>
                  <p class="text-brand-muted text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <a
              href="mailto:hello@parkgive.com?subject=Partner with ParkGive"
              class="inline-block bg-white font-bold text-lg py-4 px-10 rounded-2xl shadow-lg hover:bg-brand-light transition-all"
              style="color:#4B8EC1"
            >
              List Your Lot →
            </a>
            <p class="text-brand-muted text-sm mt-4">Or email us at hello@parkgive.com</p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer class="px-6 py-8 border-t border-gray-100 text-center text-xs text-gray-400">
          <img src="/logo-name.png" alt="ParkGive" class="h-7 w-auto mx-auto mb-3 opacity-50" />
          <p>ParkGive is an independent parking payment platform — not affiliated with any church or organization.</p>
          <p class="mt-1">All parking proceeds benefit the youth program of the lot's partnering organization.</p>
        </footer>

      </div>
    </Layout>
  );
}
