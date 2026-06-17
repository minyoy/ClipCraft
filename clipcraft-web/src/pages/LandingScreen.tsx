import type { ReactNode } from 'react';
import type { Variants } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FeatureSection from '@/components/LandingScreen/FeatureSection';
import LandingFeatureNav from '@/components/LandingScreen/LandingFeatureNav';
import LandingHeader from '@/components/LandingScreen/LandingHeader';
import { CtaSection, HeroSection, LandingFooter, ProblemSection, UseCaseSection } from '@/components/LandingScreen/LandingSections';
import { features } from '@/components/LandingScreen/landingData';
import { cn } from '@/lib/cn';

const FEATURE_NAV_REVEAL_RATIO = 0.1;
const FEATURE_NAV_HIDE_RATIO = 0.8;
const landingEaseOut = [0.22, 1, 0.36, 1] as const;
const landingFadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.15,
      ease: landingEaseOut,
    },
  },
};

function ScrollReveal({ amount = 0.18, children, className }: { amount?: number; children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('will-change-[transform,opacity]', className)}
      variants={landingFadeInUp}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingScreen() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<string>(features[0].id);
  const [showFeatureNav, setShowFeatureNav] = useState<boolean>(false);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    // Observer for tracking which feature is currently in view (for active tab)
    const featureObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
        if (visible?.target.id) setActiveFeature(visible.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 },
    );

    // Show nav only while the viewport top is inside the feature section range.
    const firstFeatureId = features[0].id;
    const lastFeatureId = features[features.length - 1].id;
    const firstEl = document.getElementById(firstFeatureId);
    const lastEl = document.getElementById(lastFeatureId);
    let raf = 0;
    const checkFeatureNavVisibility = () => {
      if (!firstEl || !lastEl) return setShowFeatureNav(false);
      const viewportTop = window.scrollY;
      const firstRect = firstEl.getBoundingClientRect();
      const lastRect = lastEl.getBoundingClientRect();
      const featureStart = viewportTop + firstRect.top + firstRect.height * FEATURE_NAV_REVEAL_RATIO;
      const featureEnd = viewportTop + lastRect.top + lastRect.height * FEATURE_NAV_HIDE_RATIO;
      setShowFeatureNav(viewportTop >= featureStart && viewportTop < featureEnd);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        checkFeatureNavVisibility();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // initial check
    checkFeatureNavVisibility();

    features.forEach((feature) => {
      const element = document.getElementById(feature.id);
      if (element) featureObserver.observe(element);
    });
    return () => {
      featureObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const start = () => navigate('/upload');
  const login = () => navigate('/login');
  const selectFeature = (featureId: string) => {
    setActiveFeature(featureId);
    document.getElementById(featureId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <LandingHeader onLogin={login} onStart={start} />
      <ScrollReveal amount={0.12}>
        <HeroSection onStart={start} />
      </ScrollReveal>
      <ScrollReveal>
        <ProblemSection />
      </ScrollReveal>
      <LandingFeatureNav activeFeature={activeFeature} onSelect={selectFeature} visible={showFeatureNav} />
      {features.map((feature) => (
        <ScrollReveal key={feature.id}>
          <FeatureSection feature={feature} />
        </ScrollReveal>
      ))}
      <ScrollReveal>
        <UseCaseSection />
      </ScrollReveal>
      <ScrollReveal>
        <CtaSection onStart={start} />
      </ScrollReveal>
      <LandingFooter currentYear={currentYear} />
    </main>
  );
}
