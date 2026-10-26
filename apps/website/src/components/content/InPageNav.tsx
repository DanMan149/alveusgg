import {
  Fragment,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { classes } from "@/utils/classes";

export type InPageNavItem = {
  id: string;
  label: ReactNode;
};

type InPageNavProps = {
  items: InPageNavItem[];
  label: string;
  // Optional controls (e.g. a sort dropdown) shown at the end of the bar
  children?: ReactNode;
  // Called before jumping, e.g. to expand a collapsed section
  onNavigate?: (id: string) => void;
  className?: string;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Sticky in-page navigation: plain serif links separated by thin dividers,
 * with the current section underlined (scroll-spy) and smooth jump links.
 */
const InPageNav = ({
  items,
  label,
  children,
  onNavigate,
  className,
}: InPageNavProps) => {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lockRef = useRef(0);
  const [active, setActive] = useState(items[0]?.id);

  // Work out which section is currently at the top of the viewport
  const update = useCallback(() => {
    if (Date.now() < lockRef.current) return;

    const offset = (navRef.current?.offsetHeight ?? 0) + 32;
    const visible = items.filter((item) => {
      const elm = document.getElementById(item.id);
      return elm && elm.offsetParent !== null;
    });

    let current = visible[0]?.id;
    for (const item of visible) {
      const elm = document.getElementById(item.id);
      if (elm && elm.getBoundingClientRect().top - offset <= 0) {
        current = item.id;
      }
    }

    // At the very bottom of the page, the last section is the current one
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom && visible.length) current = visible[visible.length - 1]!.id;

    setActive(current);
  }, [items]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  // Keep the current link visible when the bar scrolls sideways (phones)
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !link) return;

    const start = link.offsetLeft - list.offsetLeft;
    const end = start + link.offsetWidth;
    if (start < list.scrollLeft || end > list.scrollLeft + list.clientWidth) {
      list.scrollTo({
        left: start - 16,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }, [active]);

  const jump = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      onNavigate?.(id);

      // Let any expanded content render before measuring
      requestAnimationFrame(() => {
        const elm = document.getElementById(id);
        if (!elm) return;

        const offset = (navRef.current?.offsetHeight ?? 0) + 16;
        const reduce = prefersReducedMotion();
        lockRef.current = Date.now() + (reduce ? 0 : 900);
        setActive(id);

        window.scrollTo({
          top: elm.getBoundingClientRect().top + window.scrollY - offset,
          behavior: reduce ? "auto" : "smooth",
        });
        window.history.replaceState(null, "", `#${id}`);

        // Move focus to the section for keyboard and screen reader users
        if (!elm.hasAttribute("tabindex")) elm.setAttribute("tabindex", "-1");
        elm.focus({ preventScroll: true });
      });
    },
    [onNavigate],
  );

  if (!items.length && !children) return null;

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className={classes(
        "sticky inset-x-0 top-0 z-20 border-b border-alveus-green-200 bg-alveus-green-50 text-alveus-green-900",
        className,
      )}
    >
      <div className="container mx-auto flex flex-wrap items-center gap-x-6 px-4">
        <ul
          ref={listRef}
          className="-mx-3 scrollbar-none flex min-w-0 grow items-center overflow-x-auto"
        >
          {items.map((item, idx) => (
            <Fragment key={item.id}>
              {idx > 0 && (
                <li
                  aria-hidden="true"
                  className="h-4 w-px shrink-0 bg-alveus-green-300"
                />
              )}
              <li className="shrink-0">
                <a
                  href={`#${item.id}`}
                  data-id={item.id}
                  onClick={(e) => jump(e, item.id)}
                  aria-current={active === item.id ? "location" : undefined}
                  className={classes(
                    "block border-b-3 px-3 pt-3 pb-2.5 font-serif text-lg whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-alveus-green-700 motion-reduce:transition-none",
                    active === item.id
                      ? "border-alveus-green-700"
                      : "border-transparent hover:border-alveus-green-300",
                  )}
                >
                  {item.label}
                </a>
              </li>
            </Fragment>
          ))}
        </ul>

        {children && (
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 py-2">
            {children}
          </div>
        )}
      </div>
    </nav>
  );
};

export default InPageNav;
