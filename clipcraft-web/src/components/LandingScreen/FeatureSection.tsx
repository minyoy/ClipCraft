import { motion } from 'framer-motion';
import Icon from '@/components/Icon';
import { icons } from '@/components/icons';
import { cn } from '@/lib/cn';
import { landingInnerStagger, landingItemRise, landingVisualRise } from '@/lib/animations';
import { sectionTitleClass, wrapClass } from '@/components/LandingScreen/landingData';
import type { LandingFeature } from '@/components/LandingScreen/landingData';
import FeatureVisual from '@/components/LandingScreen/FeatureVisuals';
import { MonoLabel } from '@/components/LandingScreen/LandingPrimitives';

export default function FeatureSection({ feature }: { feature: LandingFeature }) {
  return (
    <section className={cn('scroll-mt-[126px] py-[72px] sm:py-[104px]', feature.tint && 'bg-[#f6f6f5]')} id={feature.id}>
      <motion.div className={cn(wrapClass, 'grid items-center gap-11 lg:grid-cols-[1fr_1.04fr] lg:gap-[72px]')} variants={landingInnerStagger}>
        <motion.div className={cn(feature.reverse && 'lg:order-2')} variants={landingInnerStagger}>
          <motion.div variants={landingItemRise}><MonoLabel>{feature.no}</MonoLabel></motion.div>
          <motion.h2 className={cn(sectionTitleClass, 'my-4 text-[26px] sm:text-[32px] lg:text-[38px]')} variants={landingItemRise}>{feature.title}</motion.h2>
          <motion.p className="max-w-[440px] text-[14px] font-[320] leading-[1.55] tracking-[-0.2px] text-black/55 sm:text-[14.5px]" variants={landingItemRise}>{feature.body}</motion.p>
          <motion.ul className="mt-[26px] flex flex-col gap-[13px]" variants={landingInnerStagger}>
            {feature.bullets.map((bullet) => (
              <motion.li className="flex items-start gap-[11px] text-[13.5px] font-[320] tracking-[-0.2px] text-black/70" key={bullet} variants={landingItemRise}>
                <span className="mt-px flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-black text-white"><Icon d={icons.check} size={12} strokeWidth={3} /></span>
                {bullet}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
        <motion.div className={cn(feature.reverse && 'lg:order-1')} variants={landingVisualRise}>
          <FeatureVisual type={feature.visual} />
        </motion.div>
      </motion.div>
    </section>
  );
}
