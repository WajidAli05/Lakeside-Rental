'use client';

/**
 * Resizable Navbar — forked from Aceternity UI and corrected for this project.
 *
 * This is OUR source now. Aceternity components are copy-paste, not a dependency,
 * so fixes live here rather than in override classes.
 *
 * What was changed from upstream, and why:
 *
 *  1. `sticky top-20` -> `fixed inset-x-0 top-0`.
 *     Upstream ships a demo-oriented sticky bar offset 5rem down the page. A real site
 *     header belongs at the top of the viewport and must not occupy layout space.
 *     Callers are responsible for padding the page content below it.
 *
 *  2. Removed the hardcoded inline `style={{ minWidth: "800px" }}` on NavBody.
 *     Upstream animates width to 40% on scroll while forcing an 800px minimum. Between
 *     1024px (where the desktop bar appears) and ~1280px those two fight and the bar
 *     overflows its container. Width is now handled entirely by Tailwind max-width.
 *
 *  3. MobileNavToggle was a bare Tabler SVG with an onClick handler — not focusable,
 *     not labelled, not a button. It is now a real <button> with aria-label,
 *     aria-expanded, aria-controls and a 44px tap target.
 *
 * Also applied, per the project restyling procedure:
 *  - every `dark:` variant removed (this site has one theme)
 *  - neutral/zinc palette replaced with project tokens
 *  - radii reduced to 2px, resting shadows and Aceternity's multi-layer glow removed
 *  - focus-visible styles added throughout
 *  - nav links are real <a> elements with 44px targets
 *
 * Motion (`motion/react`) owns the local visible/hidden transition here. GSAP owns
 * nothing in this file. Never drive the same element from both.
 */

import { cn } from '@/lib/utils';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import React, { useId, useRef, useState } from 'react';

interface NavItem {
  name: string;
  link: string;
}

interface NavbarChildProps {
  /** Injected by <Navbar> via cloneElement once the page has scrolled past the threshold. */
  visible?: boolean;
}

interface NavbarProps extends NavbarChildProps {
  children: React.ReactNode;
  className?: string;
}

/** Scroll distance after which the bar condenses. */
const CONDENSE_AT = 100;

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setVisible(latest > CONDENSE_AT);
  });

  return (
    <motion.header
      ref={ref}
      // FIX 1: fixed to the top of the viewport, not sticky at top-20.
      className={cn('fixed inset-x-0 top-0 z-40 w-full', className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement<NavbarChildProps>(child)
          ? React.cloneElement(child, { visible })
          : child,
      )}
    </motion.header>
  );
};

interface NavBodyProps extends NavbarChildProps {
  children: React.ReactNode;
  className?: string;
}

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? 'blur(10px)' : 'none',
        width: visible ? '72%' : '100%',
        y: visible ? 12 : 0,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 50 }}
      // FIX 2: no inline minWidth. Width is bounded by max-w-7xl / min-w-0 only.
      className={cn(
        'relative z-[60] mx-auto hidden w-full min-w-0 max-w-7xl flex-row items-center justify-between self-start rounded-[2px] border border-transparent bg-transparent px-6 py-3 lg:flex',
        visible && 'border-mist/30 bg-navy/90',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

interface NavItemsProps {
  items: NavItem[];
  className?: string;
  onItemClick?: () => void;
}

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <nav
      aria-label="Primary"
      onMouseLeave={() => setHovered(null)}
      className={cn('hidden flex-1 flex-row items-center justify-center lg:flex', className)}
    >
      {items.map((item, idx) => (
        <a
          key={item.link}
          href={item.link}
          onMouseEnter={() => setHovered(idx)}
          onFocus={() => setHovered(idx)}
          onBlur={() => setHovered(null)}
          onClick={onItemClick}
          className="relative flex min-h-[44px] items-center px-4 py-2 text-[15px] font-medium text-cream/90 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-softgold"
        >
          {hovered === idx && (
            <motion.span
              layoutId="nav-hover"
              aria-hidden
              className="absolute inset-0 rounded-[2px] bg-cream/10"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </nav>
  );
};

interface MobileNavProps extends NavbarChildProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? 'blur(10px)' : 'none',
        width: visible ? '94%' : '100%',
        y: visible ? 8 : 0,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 50 }}
      className={cn(
        'relative z-50 mx-auto flex w-full max-w-[calc(100vw-1rem)] flex-col items-center justify-between rounded-[2px] bg-transparent px-3 py-2 lg:hidden',
        visible && 'bg-navy/90',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('flex w-full flex-row items-center justify-between', className)}>
    {children}
  </div>
);

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  /** Must match the `controlsId` given to MobileNavToggle. */
  id: string;
}

export const MobileNavMenu = ({ children, className, isOpen, id }: MobileNavMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        id={id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'absolute inset-x-0 top-full z-50 flex w-full flex-col items-start justify-start gap-1 rounded-[2px] border border-mist/20 bg-navy px-4 py-6',
          className,
        )}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

/**
 * FIX 3: a real button. Upstream rendered a bare <IconX>/<IconMenu2> SVG with an
 * onClick — unreachable by keyboard, unlabelled, and under 44px.
 */
export const MobileNavToggle = ({
  isOpen,
  onClick,
  controlsId,
}: {
  isOpen: boolean;
  onClick: () => void;
  controlsId: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
    aria-expanded={isOpen}
    aria-controls={controlsId}
    className="flex h-11 w-11 items-center justify-center rounded-[2px] text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-softgold"
  >
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      {isOpen ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  </button>
);

type NavbarButtonVariant = 'primary' | 'secondary';

export const NavbarButton = ({
  href,
  as: Tag = 'a',
  children,
  className,
  variant = 'primary',
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: NavbarButtonVariant;
} & (React.ComponentPropsWithoutRef<'a'> | React.ComponentPropsWithoutRef<'button'>)) => {
  // Upstream's `dark` and `gradient` variants are deliberately not ported — a
  // blue-500 -> blue-700 gradient is exactly the off-brand look we are avoiding.
  const base =
    'inline-flex min-h-[48px] items-center justify-center rounded-[2px] px-5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-softgold';

  const variants: Record<NavbarButtonVariant, string> = {
    primary: 'bg-gold text-navy hover:bg-softgold',
    secondary: 'border border-cream/40 text-cream hover:border-cream hover:bg-cream/10',
  };

  return (
    <Tag href={href || undefined} className={cn(base, variants[variant], className)} {...props}>
      {children}
    </Tag>
  );
};

/**
 * Convenience hook pairing the toggle with its menu so the aria-controls id always
 * matches. Without this the two ids drift and the relationship silently breaks.
 */
export function useMobileNavId() {
  return `mobile-nav-${useId()}`;
}
