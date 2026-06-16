import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { features, wrapClass } from './landingData';

export default function LandingFeatureNav({ activeFeature, onSelect, visible = true }: { activeFeature: string; onSelect: (featureId: string) => void; visible?: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      id="features"
      className={cn(
        'sticky top-[76px] z-[90] py-3',
        visible ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div className={cn(wrapClass, 'flex justify-center')}>
        <motion.div
          className={cn(
            'pointer-events-auto grid w-full max-w-[520px] grid-cols-4 gap-1 rounded-full bg-[#F7F7F8] p-1 shadow-[0_10px_28px_-22px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.04] will-change-[transform,opacity,filter]',
          )}
          animate={
            visible
              ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, y: shouldReduceMotion ? 0 : -14, scale: shouldReduceMotion ? 1 : 0.97, filter: shouldReduceMotion ? 'blur(0px)' : 'blur(4px)' }
          }
          initial={false}
          transition={{ duration: shouldReduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {features.map((feature) => (
            <button
              className={cn(
                'min-w-0 cursor-pointer rounded-full border-0 px-2 py-[7px] text-[10.5px] font-[480] tracking-[-0.1px] text-black/45 transition-colors hover:bg-black/[0.04] hover:text-black/70 sm:px-4 sm:text-[12.5px]',
                activeFeature === feature.id && 'bg-black text-white shadow-[0_4px_12px_-8px_rgba(0,0,0,0.7)] hover:bg-black hover:text-white',
              )}
              key={feature.id}
              onClick={() => onSelect(feature.id)}
              type="button"
            >
              {feature.tab}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
