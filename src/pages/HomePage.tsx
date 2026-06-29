/**
 * HomePage — landing principal de MiniMax.
 * Primera impresión para retailers pequeños que buscan mejorar sus márgenes.
 * Cinco secciones: Hero, Cómo Funciona, Grupos en Formación, Testimonios y CTA Final.
 * Usa IntersectionObserver para animaciones de entrada sutiles al hacer scroll.
 */

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import AvatarGroup from '../components/ui/AvatarGroup';
import GroupCard from '../features/groups/components/GroupCard';
import CTASection from '../components/layout/CTASection';
import Spinner from '../components/ui/Spinner';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { useGroups } from '../features/groups/hooks/useGroups';

// ─── Scroll animation hook ────────────────────────────────────────────────────

function useInView(ref: RefObject<Element | null>): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

function FadeIn({ children, delay = 0, className = '' }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const SOCIAL_PROOF_USERS = [
  { alt: 'Carlos M.', src: 'https://i.pravatar.cc/150?img=3' },
  { alt: 'Lucía R.', src: 'https://i.pravatar.cc/150?img=5' },
  { alt: 'Marcos S.', src: 'https://i.pravatar.cc/150?img=7' },
  { alt: 'Ana P.', src: 'https://i.pravatar.cc/150?img=9' },
];

// ─── Step card ────────────────────────────────────────────────────────────────

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  delay?: number;
}

function StepCard({ number, title, description, delay = 0 }: StepCardProps) {
  return (
    <FadeIn delay={delay} className="flex-1">
      <div className="bg-surface-card rounded-2xl p-6 h-full border border-ink-faint/30 shadow-sm flex flex-col gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-purple flex items-center justify-center shrink-0">
          <span className="font-display font-extrabold text-brand-teal text-lg">{number}</span>
        </div>
        <div>
          <h3 className="font-display font-bold text-ink text-base mb-2">{title}</h3>
          <p className="font-body text-sm text-ink-muted leading-relaxed">{description}</p>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────

interface TestimonialCardProps {
  quote: string;
  name: string;
  business: string;
  avatarSrc: string;
  delay?: number;
}

function TestimonialCard({ quote, name, business, avatarSrc, delay = 0 }: TestimonialCardProps) {
  return (
    <FadeIn delay={delay} className="flex-1">
      <div className="bg-brand-purple-light/40 border border-brand-teal/20 rounded-2xl p-6 h-full flex flex-col gap-5">
        <svg
          className="w-8 h-8 text-brand-teal opacity-60 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="font-body text-white/90 text-sm leading-relaxed flex-1">"{quote}"</p>
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt={name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-teal/40"
          />
          <div>
            <p className="font-display font-semibold text-white text-sm">{name}</p>
            <p className="font-body text-white/60 text-xs">{business}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  usePageTitle('Comprá como los grandes');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Grupos reales en formación: tomamos los abiertos y mostramos hasta 3.
  const { groups, loading } = useGroups({ status: 'open' });
  const featuredGroups = groups.slice(0, 3);

  useEffect(() => {
    if (user?.role === 'supplier') {
      navigate('/proveedor/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="overflow-x-hidden">
      {/* ── Section 1: Hero ─────────────────────────────────────────────────── */}
      <section className="bg-surface-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left column */}
            <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
              <FadeIn>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-brand-teal text-xs font-display font-semibold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                  Economía de escala para todos
                </span>
              </FadeIn>

              <FadeIn delay={100}>
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight">
                  Comprá como los{' '}
                  <span className="text-brand-teal relative">
                    grandes
                    <svg
                      className="absolute -bottom-1 left-0 w-full"
                      viewBox="0 0 200 8"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 6 Q50 2 100 6 Q150 10 200 6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  ,{' '}
                  <br className="hidden sm:block" />
                  siendo pequeño.
                </h1>
              </FadeIn>

              <FadeIn delay={200}>
                <p className="font-body text-base text-ink-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
                  MiniMax conecta retailers independientes con mayoristas para hacer compras grupales.
                  Alcanzá volúmenes mínimos en conjunto y accedé a precios de fábrica que antes solo
                  tenían las grandes cadenas.
                </p>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/explorar')}
                  >
                    Explorar Grupos
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/proveedores')}
                  >
                    Soy Mayorista
                  </Button>
                </div>
              </FadeIn>

              <FadeIn delay={400}>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <AvatarGroup users={SOCIAL_PROOF_USERS} max={4} />
                  <p className="font-body text-sm text-ink-muted">
                    <span className="font-semibold text-ink">+1.200 retailers</span> ya están
                    ahorrando
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* Right column — product preview mockup */}
            <FadeIn delay={200} className="flex-1 w-full max-w-md lg:max-w-none">
              <div className="relative py-6 px-4">

                {/* Floating stat — top right: savings */}
                <div className="absolute top-0 right-0 z-10 bg-surface-card rounded-2xl shadow-lg px-4 py-3 border border-ink-faint/20 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-teal/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-brand-teal text-lg leading-none">42%</p>
                    <p className="font-body text-xs text-ink-muted">ahorro promedio</p>
                  </div>
                </div>

                {/* Main product card */}
                <div className="bg-surface-card rounded-2xl shadow-xl border border-ink-faint/20 overflow-hidden">
                  {/* Card header */}
                  <div className="bg-brand-purple px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-display font-semibold text-white text-xs">Grupo activo</p>
                        <p className="font-body text-white/50 text-xs">Alimentos · 34 participantes</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-brand-teal/20 text-brand-teal text-xs font-display font-semibold">Abierto</span>
                  </div>

                  {/* Product info */}
                  <div className="px-5 pt-5 pb-4 flex items-start gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120"
                      alt="Aceite de Oliva"
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="font-display font-semibold text-ink text-sm leading-tight">
                        Aceite de Oliva Extra Virgen — Mendoza
                      </p>
                      <p className="font-body text-ink-muted text-xs">Finca Dorada S.A. · Lote mín. 200 u.</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-body text-xs text-ink-muted line-through">$4.800</span>
                        <span className="font-display font-bold text-brand-teal text-base">$3.200</span>
                        <span className="px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal text-xs font-display font-semibold">−33%</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="px-5 pb-5 flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-body text-xs text-ink-muted">Progreso del grupo</span>
                        <span className="font-display font-semibold text-brand-teal text-xs">164 / 200 unidades</span>
                      </div>
                      <div className="h-2 bg-ink-faint/20 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-teal rounded-full transition-all" style={{ width: '82%' }} />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {[
                        { label: 'Sin membresías', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                        { label: 'Envío a tu local', icon: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4' },
                      ].map(({ label, icon }) => (
                        <div key={label} className="flex-1 flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2">
                          <svg className="w-3.5 h-3.5 text-brand-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                          </svg>
                          <span className="font-body text-xs text-ink-muted">{label}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-2.5 rounded-xl bg-brand-purple text-white font-display font-semibold text-sm hover:bg-brand-purple/90 transition-colors">
                      Unirme al grupo →
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Section 2: Cómo Funciona ────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
                El Poder de la Unión
              </h2>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="font-body text-ink-muted text-base max-w-2xl mx-auto leading-relaxed">
                Transformamos la competencia en colaboración para democratizar el acceso a precios
                mayoristas.
              </p>
            </FadeIn>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            <StepCard
              number="01"
              title="Explorá Grupos"
              description="Encontrá grupos de compra activos para los productos que necesita tu tienda. Filtrá por categoría, precio o margen estimado."
              delay={0}
            />
            {/* Arrow connector */}
            <div className="hidden md:flex items-center justify-center text-ink-faint shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <StepCard
              number="02"
              title="Unite y Reservá"
              description="Seleccioná la cantidad que necesitás. Tu pedido se suma al grupo para alcanzar el volumen mínimo del mayorista sin riesgo."
              delay={120}
            />
            <div className="hidden md:flex items-center justify-center text-ink-faint shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <StepCard
              number="03"
              title="Recibí y Ahorrá"
              description="Una vez que el grupo se completa, el pedido se procesa y recibís tu stock directamente en tu local con precio de gran cadena."
              delay={240}
            />
          </div>
        </div>
      </section>

      {/* ── Section 3: Grupos en Formación ──────────────────────────────────── */}
      <section className="bg-surface-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
                Grupos en Formación
              </h2>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="font-body text-ink-muted text-base max-w-2xl mx-auto">
                Asegurá tu cupo antes de que los grupos alcancen su meta.
              </p>
            </FadeIn>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGroups.map((group, i) => (
                <FadeIn key={group.id} delay={i * 100}>
                  <GroupCard group={group} />
                </FadeIn>
              ))}
            </div>
          )}

          <FadeIn delay={300}>
            <div className="mt-10 text-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/explorar')}
              >
                Ver todos los grupos
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Section 4: Testimonios ───────────────────────────────────────────── */}
      <section className="bg-brand-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <FadeIn>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4">
                Lo que dicen nuestros aliados
              </h2>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="font-body text-white/60 text-base max-w-2xl mx-auto">
                Nuestra comunidad crece gracias a la confianza entre retailers y el compromiso de
                MiniMax.
              </p>
            </FadeIn>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            <TestimonialCard
              quote="Antes era imposible competir con las grandes superficies. Gracias a MiniMax, mi margen de ganancia en electrónica subió un 25% desde el primer mes."
              name="Carlos Méndez"
              business="TecnoMundo Retail"
              avatarSrc="https://i.pravatar.cc/150?img=12"
              delay={0}
            />
            <TestimonialCard
              quote="La logística es impecable. Unirse a un grupo es tan fácil como comprar en cualquier app, pero con la diferencia de que el ahorro es real."
              name="Lucía Rivas"
              business="DecoStudio"
              avatarSrc="https://i.pravatar.cc/150?img=5"
              delay={120}
            />
          </div>
        </div>
      </section>

      {/* ── Section 5: CTA Final ─────────────────────────────────────────────── */}
      <CTASection
        title={
          <>
            ¿Listo para transformar{' '}
            <span className="text-brand-teal">tu rentabilidad</span>?
          </>
        }
        subtitle="Unite a más de 1.200 retailers que ya compran en grupo y acceden a precios que antes eran solo para las grandes cadenas."
        primaryLabel="Registrar mi Tienda"
        primaryHref="/explorar"
        secondaryLabel="Cómo Funciona"
        secondaryHref="/como-funciona"
      />
    </div>
  );
}
