import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'
import '@/i18n' // initialise i18next so t() resolves to real strings in tests

// ── Global framer-motion mock ───────────────────────────────────────────────
// Renders every `motion.*` element as the plain underlying tag (stripping
// animation-only props) and stubs the hooks, so components that call
// useReducedMotion()/AnimatePresence work in jsdom without per-file mocks.
vi.mock('framer-motion', () => {
  const ANIM_PROPS = new Set([
    'initial', 'animate', 'exit', 'whileHover', 'whileTap', 'whileInView',
    'whileFocus', 'whileDrag', 'transition', 'variants', 'viewport',
    'layout', 'layoutId', 'drag', 'dragConstraints', 'onAnimationComplete',
    'custom',
  ])
  function clean(props: Record<string, unknown>) {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(props)) if (!ANIM_PROPS.has(k)) out[k] = props[k]
    return out
  }
  const cache: Record<string, React.FC<Record<string, unknown>>> = {}
  const motion = new Proxy(
    {},
    {
      get: (_t, tag: string) => {
        if (!cache[tag]) {
          const Comp = ({ children, ...props }: Record<string, unknown>) =>
            React.createElement(tag, clean(props), children as React.ReactNode)
          Comp.displayName = `motion.${tag}`
          cache[tag] = Comp
        }
        return cache[tag]
      },
    },
  )
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useInView: () => false,
    useScroll: () => ({ scrollY: { get: () => 0, onChange: () => () => {} }, scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
    useMotionValue: (v: unknown) => ({ get: () => v, set: vi.fn(), onChange: () => () => {} }),
  }
})
