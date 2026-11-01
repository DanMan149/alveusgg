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
};

// Compact row of ambassador photos and names, used for the enclosure section
// on ambassador pages and the featured ambassadors on Animal Quest episodes
const AmbassadorStrip = ({
  heading,
  headingId,
  items,
  action,
  className,
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

      <ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {items.map((item) => (
          <li key={item.key} className="min-w-0">
            <Link
              href={item.href}
              custom
              className="group flex items-center gap-3 rounded-full pr-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700"
            >
              <Image
                src={item.image.src}
                alt=""
                width={144}
                className="size-18 shrink-0 rounded-full object-cover"
                style={{ objectPosition: item.image.position }}
              />
              <span className="min-w-0">
                <span className="block font-serif text-xl font-bold transition-colors group-hover:text-alveus-green-700 motion-reduce:transition-none">
                  {item.name}
                </span>
                {item.caption && (
                  <span className="block text-sm font-bold text-alveus-green-700 uppercase">
                    {item.caption}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default AmbassadorStrip;
