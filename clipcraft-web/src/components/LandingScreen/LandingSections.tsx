import { motion } from 'framer-motion';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import { icons } from '@/components/icons';
import { cn } from '@/lib/cn';
import { landingInnerStagger, landingItemRise, landingVisualRise } from '@/lib/animations';
import { displayClass, monoClass, problems, sectionTitleClass, useCases, wrapClass } from '@/components/LandingScreen/landingData';
import HeroMockup from '@/components/LandingScreen/HeroMockup';
import { LandingButton, MonoLabel, SectionHead } from '@/components/LandingScreen/LandingPrimitives';

export function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="overflow-hidden px-0 pb-16 pt-14 sm:pt-[86px]">
      <motion.div className={cn(wrapClass, 'grid items-center gap-16 lg:grid-cols-[1.02fr_1.14fr] lg:gap-12')} variants={landingInnerStagger}>
        <motion.div variants={landingInnerStagger}>
          <motion.div variants={landingItemRise}><MonoLabel>AI SCENARIO BASED SHORT FORM EDITOR</MonoLabel></motion.div>
          <motion.h1 className={cn(displayClass, 'my-[22px] text-[34px] sm:text-[44px] lg:text-[60px]')} variants={landingItemRise}>긴 영상 속<br />원하는 장면을<br /><span className="text-[#5B4CF5]">시나리오</span>로 찾다</motion.h1>
          <motion.p className="max-w-[460px] text-[14px] font-[320] leading-[1.6] tracking-[-0.2px] text-black/60 sm:text-[14.5px]" variants={landingItemRise}>원하는 장면을 한 줄로 설명하면, <br /> ClipCraft가 영상 속에서 가장 어울리는 구간을 찾아 추천합니다. <br /> 이제 장면을 찾는 시간보다, 숏폼을 완성하는 데 집중하세요.</motion.p>
          <motion.div className="mt-[34px] flex flex-wrap items-center gap-3" variants={landingItemRise}>
            <LandingButton onClick={onStart}>지금 시작하기 <Icon d={icons.arrowR} size={17} strokeWidth={2} /></LandingButton>
            <LandingButton onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} variant="white">기능 둘러보기</LandingButton>
          </motion.div>
        </motion.div>

        <motion.div variants={landingVisualRise}>
          <HeroMockup />
        </motion.div>
      </motion.div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className="border-t border-black/[0.08] py-[78px]">
      <motion.div className={wrapClass} variants={landingInnerStagger}>
        <motion.div variants={landingItemRise}>
          <SectionHead
            label="THE PROBLEM"
            title={<>원하는 장면을 찾는 데,<br />너무 많은 시간이 걸립니다</>}
            body={"15분짜리 원본에서 쓸 만한 몇 초를 찾기 위해 타임라인을 계속 되감고, 멈추고, 다시 확인해야 합니다. \n 숏폼 편집에서 가장 먼저 지치는 순간은 편집이 아니라, 필요한 장면을 찾는 과정입니다."}
          />
        </motion.div>
        <motion.div className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-11" variants={landingInnerStagger}>
          {problems.map(([no, title, body, stat]) => (
            <motion.article key={no} variants={landingItemRise}>
              <span className={cn(monoClass, 'text-[11px] text-black/30')}>{no}</span>
              <h3 className="mb-[9px] mt-3 whitespace-pre-line text-[15px] font-[540] tracking-[-0.2px]">{title}</h3>
              <p className="whitespace-pre-line text-[13px] font-[320] leading-[1.6] tracking-[-0.2px] text-black/60">{body}</p>
              <div className={cn(monoClass, 'mt-4 whitespace-pre-line border-t border-black/[0.08] pt-3.5 text-[12px] tracking-[0.02em] text-black/40')}>{stat}</div>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

export function UseCaseSection() {
  return (
    <section className="scroll-mt-[126px] py-[72px]" id="usecase">
      <motion.div className={wrapClass} variants={landingInnerStagger}>
        <motion.div variants={landingItemRise}>
          <SectionHead label="USE CASES" title={<>긴 영상 편집이 필요한<br />모두를 위해</>} />
        </motion.div>
        <motion.div className="mt-[52px] grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4" variants={landingInnerStagger}>
          {useCases.map((item) => (
            <motion.article className="rounded-lg border border-black/15 bg-white px-6 py-[26px] transition hover:-translate-y-[3px] hover:border-black/30 hover:shadow-[0_18px_40px_-26px_rgba(0,0,0,0.35)]" key={item.title} variants={landingItemRise}>
              <span className="mb-[18px] flex h-11 w-11 items-center justify-center rounded-full border border-black/15 text-black"><Icon d={item.icon} size={21} strokeWidth={1.6} fill={item.title === '유튜버' ? 'currentColor' : 'none'} /></span>
              <h3 className="mb-2 text-[13.5px] font-[540] tracking-[-0.2px]">{item.title}</h3>
              <p className="text-[13px] font-[320] leading-[1.55] tracking-[-0.2px] text-black/60">{item.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

export function CtaSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="pb-[104px]" id="start">
      <div className={wrapClass}>
        <motion.div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#7568ff_0%,#5B4CF5_48%,#4536d4_100%)] px-6 py-16 text-center text-white sm:px-14 sm:py-24" variants={landingInnerStagger}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(255,255,255,0.32),transparent_60%)]" />
          <motion.div className="relative z-[1]" variants={landingInnerStagger}>
            <motion.div variants={landingItemRise}><MonoLabel light>START FOR FREE</MonoLabel></motion.div>
            <motion.h2 className={cn(sectionTitleClass, 'mx-auto mt-[18px] max-w-[17ch] text-[26px] text-white sm:text-[32px] lg:text-[38px]')} variants={landingItemRise}>장면 찾는 시간,<br />이제 AI에게 맡기세요</motion.h2>
            <motion.p className="mx-auto mt-[18px] max-w-[46ch] text-[14px] font-[320] leading-[1.6] tracking-[-0.2px] text-white/90 sm:text-[14.5px]" variants={landingItemRise}>시나리오 한 줄이면 충분합니다. 긴 영상에서 원하는 순간을 찾아 숏폼으로 만드는 가장 빠른 길, ClipCraft에서 무료로 시작해보세요.</motion.p>
            <motion.div className="mt-[34px] flex flex-wrap items-center justify-center gap-3" variants={landingItemRise}>
              <LandingButton onClick={onStart} variant="white">지금 시작하기 <Icon d={icons.arrowR} size={17} strokeWidth={2} /></LandingButton>
              <LandingButton onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} variant="glass">기능 둘러보기</LandingButton>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingFooter({ currentYear }: { currentYear: number }) {
  return (
    <footer className="bg-[#f6f6f5] py-10 text-black sm:py-16">
      <div className={wrapClass}>
        <div className="flex flex-wrap justify-between gap-12">
          <div>
            <Logo height={25} />
            <p className="mt-4 max-w-[280px] text-[13px] font-[320] leading-[1.6] tracking-[-0.2px] text-black/50">시나리오로 찾는 AI 숏폼 편집. <br /> 긴 영상 속 원하는 순간을 추천받으세요.</p>
          </div>
          <div className="flex flex-wrap gap-12 sm:gap-16">
            {[
              ['Product', [['주요 기능', '#features'], ['AI 장면 검색', '#f1'], ['자동 구간 추천', '#f4']]],
              ['Use Cases', [['크리에이터', '#usecase'], ['영상 편집자', '#usecase'], ['브랜드 콘텐츠', '#usecase']]],
              ['Company', [['서비스 소개', '#top'], ['문의하기', '#top']]],
            ].map(([title, links]) => (
              <nav key={title as string}>
                <h4 className={cn(monoClass, 'mb-[15px] text-[11px] text-black/40')}>{title}</h4>
                {(links as string[][]).map(([label, href]) => <a className="mb-[11px] block text-[14px] font-[320] tracking-[-0.2px] text-black/70 hover:text-black" href={href} key={label}>{label}</a>)}
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-[52px] flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6 text-[13px] text-black/40">
          <span>© {currentYear} ClipCraft. All rights reserved.</span>
          <span>이용약관 · 개인정보처리방침</span>
        </div>
      </div>
    </footer>
  );
}
