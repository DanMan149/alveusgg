import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { type ReactNode, useMemo, useRef, useState } from "react";

import { getClassification } from "@alveusgg/data/build/ambassadors/classification";
import ambassadors, {
  type Ambassador,
  type AmbassadorKey,
  isAmbassadorKey,
} from "@alveusgg/data/build/ambassadors/core";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";
import { getAmbassadorEpisodes } from "@alveusgg/data/build/animal-quest";
import enclosures from "@alveusgg/data/build/enclosures";
import { getIUCNStatus } from "@alveusgg/data/build/iucn";

import { classes } from "@/utils/classes";
import { formatPartialDateString } from "@/utils/datetime-partial";
import { convertToSlug } from "@/utils/slugs";
import { camelToKebab, kebabToCamel } from "@/utils/string-case";

import AnimalQuest from "@/components/content/AnimalQuest";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import PartialDateDiff from "@/components/content/PartialDateDiff";
import Section from "@/components/content/Section";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";
import ImagePlaceholder from "@/components/mockups/ImagePlaceholder";
import MockupNotice from "@/components/mockups/MockupNotice";

import IconArrowRight from "@/icons/IconArrowRight";
import IconChevronLeft from "@/icons/IconChevronLeft";
import IconChevronRight from "@/icons/IconChevronRight";
import IconZoomIn from "@/icons/IconZoomIn";

import { activeAmbassadors } from "@/pages/mockups/ambassadors";

type Props = { ambassadorKey: AmbassadorKey };

export const getStaticPaths: GetStaticPaths = () => ({
  paths: activeAmbassadors.map(([key]) => ({
    params: { ambassadorName: camelToKebab(key) },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const name = context.params?.ambassadorName;
  if (typeof name !== "string") return { notFound: true };
  const ambassadorKey = kebabToCamel(name);
  if (!isAmbassadorKey(ambassadorKey)) return { notFound: true };
  return { props: { ambassadorKey } };
};

const mockupHref = (key: string) => `/mockups/ambassadors/${camelToKebab(key)}`;

const stringifyLifespan = (
  value: number | { min: number; max: number } | string,
) =>
  typeof value === "string"
    ? value
    : typeof value === "number"
      ? `${value} years`
      : `${value.min}-${value.max} years`;

const StatRow = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="grid gap-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
    <dt className="font-serif text-lg font-bold">{title}</dt>
    <dd className="text-lg">{children}</dd>
  </div>
);

const Sub = ({ children }: { children: ReactNode }) => (
  <span className="block text-base text-alveus-green-700 italic">
    {children}
  </span>
);

const AmbassadorMockup = ({ ambassadorKey }: Props) => {
  const ambassador: Ambassador = ambassadors[ambassadorKey];
  const species = getSpecies(ambassador.species);
  const enclosure = enclosures[ambassador.enclosure];
  const images = useMemo(
    () => getAmbassadorImages(ambassadorKey),
    [ambassadorKey],
  );
  const episodes = useMemo(
    () => getAmbassadorEpisodes(ambassadorKey, "featured") ?? [],
    [ambassadorKey],
  );

  // Previous/next in the same order as the live /ambassadors page
  const idx = activeAmbassadors.findIndex(([key]) => key === ambassadorKey);
  const count = activeAmbassadors.length;
  const prev = activeAmbassadors[(idx - 1 + count) % count]!;
  const next = activeAmbassadors[(idx + 1) % count]!;

  const others = activeAmbassadors.filter(
    ([key, other]) =>
      key !== ambassadorKey && other.enclosure === ambassador.enclosure,
  );

  /* Gallery */
  const [photo, setPhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState<string>();
  const stripRef = useRef<HTMLUListElement>(null);
  const current = images[photo] ?? images[0];
  const lightboxItems = useMemo(
    () =>
      images.reduce<Record<string, ReactNode>>(
        (acc, image) => ({
          ...acc,
          [image.src.src]: (
            <div className="flex h-full flex-col">
              <div
                className="mx-auto flex max-h-full max-w-full grow"
                style={{
                  aspectRatio: `${image.src.width} / ${image.src.height}`,
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  quality={90}
                  className="my-auto h-auto max-h-full w-full rounded-xl bg-alveus-green-800"
                  draggable={false}
                />
              </div>
            </div>
          ),
        }),
        {},
      ),
    [images],
  );
  const scrollStrip = (direction: 1 | -1) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({
      left: direction * strip.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  /* Highlights */
  const [clip, setClip] = useState(0);
  const [playing, setPlaying] = useState(false);
  const featuredClip = ambassador.clips[clip];

  // Either { link } (on sale) or { soon } (announced), as on the live page
  const plush = ambassador.plush;

  return (
    <>
      <Meta
        title={`${ambassador.name} | Ambassadors | Mockup`}
        description={`${ambassador.name} is an Alveus Ambassador.`}
        image={images[0].src.src}
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <MockupNotice>All details come from the ambassador data.</MockupNotice>

      <Section className="pt-6">
        <nav
          aria-label="Ambassadors"
          className="mb-8 flex items-stretch justify-between gap-4"
        >
          {[
            { entry: prev, label: "Previous", align: "left" },
            { entry: next, label: "Next", align: "right" },
          ].map(({ entry: [key, other], label, align }) => {
            const thumb = getAmbassadorImages(key)[0];
            return (
              <Link
                key={label}
                href={mockupHref(key)}
                custom
                className={classes(
                  "flex min-w-0 items-center gap-3 rounded-xl border border-alveus-green-200 bg-alveus-tan-50 p-2 transition-colors hover:border-alveus-green-500",
                  align === "right" && "flex-row-reverse text-right",
                )}
              >
                {align === "left" ? (
                  <IconChevronLeft className="size-5 shrink-0" />
                ) : (
                  <IconChevronRight className="size-5 shrink-0" />
                )}
                <Image
                  src={thumb.src}
                  alt=""
                  width={96}
                  className="size-10 shrink-0 rounded-lg object-cover"
                  style={{ objectPosition: thumb.position }}
                />
                <span className="min-w-0">
                  <span className="block text-sm text-alveus-green-700">
                    {label}
                  </span>
                  <span className="block truncate font-serif text-lg font-bold">
                    {other.name}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setLightboxOpen(current.src.src)}
              className="group relative block w-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700"
            >
              <Image
                src={current.src}
                alt={current.alt}
                placeholder="blur"
                width={900}
                priority
                className="aspect-square h-auto w-full object-cover max-lg:aspect-4/3"
                style={{ objectPosition: current.position }}
              />
              <span className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-md bg-alveus-green-900 px-3 py-1.5 text-sm text-alveus-tan">
                <IconZoomIn className="size-4" />
                {images.length > 1
                  ? `View all ${images.length} photos`
                  : "Enlarge photo"}
              </span>
            </button>

            {images.length > 1 && (
              <div className="mt-3 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollStrip(-1)}
                  className="shrink-0 rounded-full p-2 hover:bg-alveus-green-100"
                >
                  <IconChevronLeft className="size-5" />
                  <span className="sr-only">Scroll photos left</span>
                </button>
                <ul
                  ref={stripRef}
                  className="scrollbar-none flex grow snap-x gap-2 overflow-x-auto p-1"
                >
                  {images.map((image, imageIdx) => (
                    <li
                      key={image.src.src}
                      className="w-1/4 shrink-0 snap-start"
                    >
                      <button
                        type="button"
                        onClick={() => setPhoto(imageIdx)}
                        aria-pressed={photo === imageIdx}
                        className={classes(
                          "block w-full overflow-hidden rounded-lg ring-offset-2 ring-offset-alveus-tan focus-visible:outline-2 focus-visible:outline-alveus-green-700",
                          photo === imageIdx
                            ? "ring-3 ring-alveus-green-700"
                            : "opacity-75 hover:opacity-100",
                        )}
                      >
                        <Image
                          src={image.src}
                          alt={`Photo ${imageIdx + 1}: ${image.alt}`}
                          width={200}
                          className="aspect-square h-auto w-full object-cover"
                          style={{ objectPosition: image.position }}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => scrollStrip(1)}
                  className="shrink-0 rounded-full p-2 hover:bg-alveus-green-100"
                >
                  <IconChevronRight className="size-5" />
                  <span className="sr-only">Scroll photos right</span>
                </button>
              </div>
            )}

            <Lightbox
              open={lightboxOpen}
              onClose={() => setLightboxOpen(undefined)}
              items={lightboxItems}
            />
          </div>

          {/* Details */}
          <div className="min-w-0">
            <Heading className="mt-0 text-5xl">{ambassador.name}</Heading>
            {!!ambassador.alternate.length && (
              <p className="-mt-1 mb-2 text-lg text-alveus-green-700 italic">
                also: {ambassador.alternate.join("; ")}
              </p>
            )}

            <div className="my-2 space-y-2 text-xl">
              {[ambassador.story, ambassador.mission]
                .flatMap((text) => text.split("\n\n"))
                .map((text) => (
                  <p key={text}>{text}</p>
                ))}
            </div>

            <dl className="mt-6 divide-y divide-alveus-green-200 border-y border-alveus-green-200">
              <StatRow title="Species">
                {species.name}
                <Sub>
                  {species.scientificName} (
                  <Link
                    href={`/ambassadors#classification:${convertToSlug(getClassification(species.class))}`}
                  >
                    {getClassification(species.class)}
                  </Link>
                  )
                </Sub>
              </StatRow>
              <StatRow title="Conservation Status">
                {species.iucn.id ? (
                  <Link
                    href={`https://www.iucnredlist.org/species/${species.iucn.id}/${species.iucn.assessment}`}
                    external
                  >
                    IUCN: {getIUCNStatus(species.iucn.status)}
                  </Link>
                ) : (
                  <>IUCN: {getIUCNStatus(species.iucn.status)}</>
                )}
              </StatRow>
              <StatRow title="Native To">{species.native}</StatRow>
              <StatRow title="Species Lifespan">
                Wild: {stringifyLifespan(species.lifespan.wild)}
                <Sub>
                  Captivity: {stringifyLifespan(species.lifespan.captivity)}
                </Sub>
              </StatRow>
              <StatRow
                title={`Date of ${{ live: "Birth", egg: "Hatching", seed: "Planting" }[species.birth]}`}
              >
                {formatPartialDateString(ambassador.birth)}
                {ambassador.birth && (
                  <Sub>
                    <PartialDateDiff date={ambassador.birth} suffix="old" />
                  </Sub>
                )}
              </StatRow>
              <StatRow title="Sex">{ambassador.sex || "Unknown"}</StatRow>
              <StatRow title="Arrived at Alveus">
                {formatPartialDateString(ambassador.arrival)}
                {ambassador.arrival && (
                  <Sub>
                    <PartialDateDiff date={ambassador.arrival} suffix="ago" />
                  </Sub>
                )}
              </StatRow>
              <StatRow title="Enclosure">
                <Link
                  href={`/ambassadors#enclosures:${camelToKebab(ambassador.enclosure)}`}
                >
                  {enclosure.name}
                </Link>
              </StatRow>
            </dl>

            {ambassador.fact && (
              <div className="mt-6 rounded-xl bg-alveus-green p-5 text-alveus-tan">
                <Heading level={2} className="my-0 text-2xl">
                  Did you know?
                </Heading>
                {ambassador.fact.split("\n\n").map((text) => (
                  <p key={text} className="mt-2 text-lg">
                    {text}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {others.length > 0 && (
        <Section className="bg-alveus-green-100 py-12">
          <Heading level={2} className="mt-0 mb-6">
            Meet others in the {enclosure.name}
          </Heading>
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {others.map(([key, other]) => {
              const image = getAmbassadorImages(key)[0];
              return (
                <li key={key}>
                  <Link href={mockupHref(key)} custom className="group block">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={300}
                      className="aspect-square h-auto w-full rounded-xl object-cover"
                      style={{ objectPosition: image.position }}
                    />
                    <span className="mt-2 block font-serif text-xl font-bold group-hover:text-alveus-green-700">
                      {other.name}
                    </span>
                    <span className="block text-alveus-green-700">
                      {getSpecies(other.species).name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {featuredClip && (
        <Section dark className="bg-alveus-green-800">
          <Heading level={2} className="mt-0 mb-8 text-center text-4xl">
            {ambassador.name}&apos;s Highlights
          </Heading>

          <div
            className={classes(
              "grid gap-6",
              ambassador.clips.length > 1
                ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
                : "mx-auto max-w-3xl",
            )}
          >
            <div>
              {playing ? (
                <YouTubeEmbed
                  videoId={featuredClip.id}
                  videoParams={{ autoplay: "1" }}
                  caption={featuredClip.caption}
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="group/trigger block w-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-tan"
                  >
                    <YouTubePreview
                      videoId={featuredClip.id}
                      alt={`Play ${featuredClip.caption}`}
                      className="aspect-video h-auto w-full object-cover"
                    />
                  </button>
                  <p className="mt-3 text-center text-xl">
                    {featuredClip.caption}
                  </p>
                </>
              )}
            </div>

            {ambassador.clips.length > 1 && (
              <ul className="flex flex-col gap-2">
                {ambassador.clips.map((item, clipIdx) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setClip(clipIdx);
                        setPlaying(false);
                      }}
                      aria-current={clip === clipIdx ? "true" : undefined}
                      className={classes(
                        "grid w-full grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 rounded-lg border p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-alveus-tan",
                        clip === clipIdx
                          ? "border-alveus-tan bg-alveus-green-900"
                          : "border-alveus-green-600 hover:bg-alveus-green-900",
                      )}
                    >
                      <YouTubePreview
                        videoId={item.id}
                        alt=""
                        icon={false}
                        className="aspect-video h-auto w-full rounded-md object-cover"
                      />
                      <span>
                        {clip === clipIdx && (
                          <span className="block text-xs tracking-wide text-alveus-green-200 uppercase">
                            Now featured
                          </span>
                        )}
                        {item.caption}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      )}

      <Section className="grow">
        <div
          className={classes(
            "grid items-start gap-8",
            episodes.length > 0 && "lg:grid-cols-2",
          )}
        >
          {plush ? (
            <div className="flex flex-col overflow-hidden rounded-2xl border border-alveus-green-200 bg-alveus-tan-50">
              <div className="relative">
                <ImagePlaceholder
                  label="Image placeholder: plush photo"
                  className="aspect-16/10 rounded-none border-0 border-b-2"
                />
                {"soon" in plush && (
                  // Same note as the live page, shown at all times so it also works on touch
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-1 border-t border-alveus-green-200 bg-alveus-tan/90 p-4 text-center font-bold text-alveus-green-800">
                    <p className="text-2xl md:text-3xl">Coming Soon</p>
                    <p className="text-lg md:text-2xl">{plush.soon}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 p-5">
                <Heading level={2} className="my-0 text-3xl">
                  {ambassador.name} Plush
                </Heading>
                <p>
                  Or, have your very own ambassador in your home with our soft
                  and cuddly plushies!
                </p>
                {"link" in plush && (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                    <p className="font-serif text-3xl font-bold">
                      $29.99 <span className="text-lg font-normal">USD</span>
                    </p>
                    <Button href={plush.link} external filled>
                      Buy the plush
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col overflow-hidden rounded-2xl border border-alveus-green-200 bg-alveus-tan-50">
              <Image
                src={(images[1] ?? images[0]).src}
                alt={(images[1] ?? images[0]).alt}
                width={800}
                className="aspect-16/10 h-auto w-full object-cover"
                style={{ objectPosition: (images[1] ?? images[0]).position }}
              />
              <div className="p-5">
                <Heading level={2} className="my-0 text-3xl">
                  {ambassador.name}
                </Heading>
                <p className="text-alveus-green-700">{species.name}</p>
              </div>
            </div>
          )}

          {episodes.length > 0 && (
            <div className="flex flex-col gap-4">
              <Heading level={2} className="my-0 text-3xl">
                Animal Quest
              </Heading>
              {episodes.map((episode) => (
                <AnimalQuest
                  key={episode.episode}
                  episode={episode}
                  ambassador={ambassadorKey}
                  heading={3}
                />
              ))}
              <Link
                href="/animal-quest"
                className="inline-flex items-center gap-1"
              >
                View All Episodes
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </Section>
    </>
  );
};

// Keyed so gallery and highlight state resets when moving between ambassadors
const AmbassadorMockupPage: NextPage<Props> = ({ ambassadorKey }) => (
  <AmbassadorMockup key={ambassadorKey} ambassadorKey={ambassadorKey} />
);

export default AmbassadorMockupPage;
