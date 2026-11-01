import Image from "next/image";
import { type ReactNode } from "react";

import { type AmbassadorImage } from "@alveusgg/data/build/ambassadors/images";

import { classes } from "@/utils/classes";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Section from "@/components/content/Section";

import IconArrowRight from "@/icons/IconArrowRight";

export type AmbassadorStripItem = {
  key: string;
  name: string;
  href: string;
  image: AmbassadorImage;
  // Optional short note under the name, e.g. "Featured" on Animal Quest
  caption?: string;
};

type AmbassadorStripProps = {
  heading: ReactNode;
  headingId?: string;
  items: AmbassadorStripItem[];
  // Secondary action, shown as a link on the heading row
  action?: { label: string; href: string };
  className?: string;
  // Shown below the list, inside the same section
  children?: ReactNode;
};

// Image hover from the /ambassadors grid cards: no shadow, also on keyboard focus
const cardImageHover =
  "transition group-hover:scale-102 group-hover:brightness-105 group-hover:contrast-115 group-hover:saturate-110 group-focus-visible:scale-102 group-focus-visible:brightness-105 group-focus-visible:contrast-115 group-focus-visible:saturate-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100";

// Row of ambassador photo cards, used for the enclosure section
// on ambassador pages and the featured ambassadors on Animal Quest episodes
const AmbassadorStrip = ({
  heading,
  headingId,
  items,
  action,
  className,
  children,
}: AmbassadorStripProps) => {
  if (!items.length) return null;

  return (
    <Section className={classes("py-8", className)}>
      <div className="mb-5 flex flex-col gap-x-6 gap-y-2 sm:flex-row sm:items-baseline sm:justify-between">
        <Heading level={2} id={headingId} className="my-0 text-2xl">
          {heading}
        </Heading>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 self-start text-lg sm:self-auto"
          >
            {action.label}
            <IconArrowRight aria-hidden="true" size={16} className="shrink-0" />
          </Link>
        )}
      </div>

      {/* Two per row on phones, fixed-width cards in a wrapping row from sm up */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:flex sm:flex-wrap sm:gap-x-6">
        {items.map((item) => (
          <li key={item.key} className="min-w-0 sm:w-48">
            <Link
              href={item.href}
              custom
              className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-alveus-green-700"
            >
              {/* Same photo, shape and hover as the /ambassadors grid cards */}
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={item.image.src}
                  alt=""
                  width={400}
                  className={classes(
                    "aspect-4/3 h-auto w-full object-cover",
                    cardImageHover,
                  )}
                  style={{ objectPosition: item.image.position }}
                />
              </div>
              <Heading
                level={3}
                className="mt-2 mb-0 text-2xl wrap-break-word transition-colors group-hover:text-alveus-green-700 group-focus-visible:text-alveus-green-700 motion-reduce:transition-none"
              >
                {item.name}
              </Heading>
              {item.caption && (
                <span className="block text-sm font-bold text-alveus-green-700 uppercase">
                  {item.caption}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Optional follow-on content in the same section, e.g. prev/next */}
      {children && (
        <div className="mt-10 border-t border-alveus-green-200 pt-8">
          {children}
        </div>
      )}
    </Section>
  );
};

export default AmbassadorStrip;
