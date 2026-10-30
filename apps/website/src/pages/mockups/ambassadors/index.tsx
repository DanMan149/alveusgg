import { type NextPage } from "next";
import Image from "next/image";
import { type MouseEvent, type PointerEvent, useRef, useState } from "react";

import ambassadors, {
  type Ambassador,
} from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";

import { classes } from "@/utils/classes";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import MockupNotice from "@/components/mockups/MockupNotice";

import IconArrowRight from "@/icons/IconArrowRight";

// Same list and order as the live /ambassadors page
export const activeAmbassadors = typeSafeObjectEntries(ambassadors).filter(
  isActiveAmbassadorEntry,
);

// First sentence of the fact, for the short preview
export const factSummary = (fact: string) => {
  const firstParagraph = fact.split("\n")[0] ?? fact;
  const match = firstParagraph.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0] : firstParagraph;
};

// Base hover/focus state for every card, from the live grid's
// ambassadorImageHover (scale, brightness, contrast, saturation) minus the
// hover shadow, plus the same on keyboard focus. Fact cards add the overlay.
const cardImageHover =
  "transition group-hover:scale-102 group-hover:brightness-105 group-hover:contrast-115 group-hover:saturate-110 group-focus-visible:scale-102 group-focus-visible:brightness-105 group-focus-visible:contrast-115 group-focus-visible:saturate-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100";

const AmbassadorsMockupPage: NextPage = () => {
  const pointerType = useRef<string>("mouse");
  const [armed, setArmed] = useState<string>();

  return (
    <>
      <Meta
        title="Ambassadors | Mockup"
        description="Design mockup of the ambassadors page."
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <MockupNotice>
        Hover or focus a card to see Meet and, where the ambassador data has
        one, its Did you know? fact. On touch, cards with a fact tap once to
        preview and again to open.
      </MockupNotice>

      <Section dark className="py-16">
        <div className="w-full lg:w-3/5">
          <Heading>Alveus Ambassadors</Heading>
          <p className="text-lg">
            Each and every ambassador at Alveus plays an important role as a
            representative of their species, sharing unique stories about
            conservation and consumer choice. Our non-releasable animal
            ambassadors are not pets &mdash; they help educate our audience,
            inspire conservation efforts, and foster a deeper connection with
            their species.
          </p>
        </div>
      </Section>

      <Section className="grow pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xl font-semibold">
            Click each ambassador for information and highlights!
          </p>
          <p className="text-alveus-green-700">
            All Ambassadors ({activeAmbassadors.length})
          </p>
        </div>

        <ul className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {activeAmbassadors.map(([key, ambassador]) => {
            const image = getAmbassadorImages(key)[0];
            const species = getSpecies(ambassador.species);
            const href = `/mockups/ambassadors/${camelToKebab(key)}`;
            const fullFact = (ambassador as Ambassador).fact;
            const fact = fullFact ? factSummary(fullFact) : undefined;
            const factId = `${key}-fact`;

            return (
              <li key={key}>
                <Link
                  href={href}
                  custom
                  aria-describedby={fact ? factId : undefined}
                  onPointerDown={(e: PointerEvent) => {
                    pointerType.current = e.pointerType;
                  }}
                  onClick={(e: MouseEvent) => {
                    // On touch, the first tap shows the fact, the second opens
                    if (
                      fact &&
                      pointerType.current === "touch" &&
                      armed !== key
                    ) {
                      e.preventDefault();
                      setArmed(key);
                    }
                  }}
                  onBlur={() => armed === key && setArmed(undefined)}
                  className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-alveus-green-700"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      placeholder="blur"
                      width={700}
                      className={classes(
                        "aspect-4/3 h-auto w-full object-cover",
                        cardImageHover,
                      )}
                      style={{ objectPosition: image.position }}
                    />
                    {/* Every card shows the same "Meet" affordance on hover,
                        focus or first tap; cards with a fact add it behind */}
                    <div
                      className={classes(
                        "absolute inset-0 flex flex-col justify-end gap-1 p-4 text-alveus-tan transition-opacity motion-reduce:transition-none",
                        fact && "bg-alveus-green-900/90",
                        armed === key
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                      )}
                    >
                      {fact && (
                        <span id={factId} className="flex flex-col gap-1">
                          <span className="font-serif text-lg font-bold">
                            Did you know?
                          </span>
                          <span className="line-clamp-4 text-sm">{fact}</span>
                        </span>
                      )}
                      {/* A span, not a link, as the whole card is already the link */}
                      <Button
                        as="span"
                        dark
                        filled
                        aria-hidden="true"
                        className="mt-2 inline-flex items-center gap-2 self-start px-3 py-1 text-base"
                      >
                        Meet {ambassador.name}
                        <IconArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                  <Heading
                    level={2}
                    className="mt-2 mb-0 text-center transition-colors group-hover:text-alveus-green-700 group-focus-visible:text-alveus-green-700"
                  >
                    {ambassador.name}
                  </Heading>
                  <p className="text-center text-xl text-alveus-green-700 transition-colors group-hover:text-alveus-green-400 group-focus-visible:text-alveus-green-400">
                    {species.name}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
};

export default AmbassadorsMockupPage;
