import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Image from "next/image";
import { Fragment, type ReactNode, useMemo, useState } from "react";

import { getClassification } from "@alveusgg/data/build/ambassadors/classification";
import ambassadors, {
  type Ambassador,
  type AmbassadorKey,
  isAmbassadorKey,
} from "@alveusgg/data/build/ambassadors/core";
import {
  getAmbassadorImages,
  getAmbassadorMerchImage,
} from "@alveusgg/data/build/ambassadors/images";
import { getAmbassadorSounds } from "@alveusgg/data/build/ambassadors/sounds";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";
import { getAmbassadorEpisodes } from "@alveusgg/data/build/animal-quest";
import enclosures from "@alveusgg/data/build/enclosures";
import { getIUCNStatus } from "@alveusgg/data/build/iucn";

import { classes } from "@/utils/classes";
import { formatPartialDateString } from "@/utils/datetime-partial";
import { convertToSlug } from "@/utils/slugs";
import { camelToKebab, kebabToCamel } from "@/utils/string-case";

import AnimalQuest from "@/components/content/AnimalQuest";
import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Carousel from "@/components/content/Carousel";
import Heading from "@/components/content/Heading";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import PartialDateDiff from "@/components/content/PartialDateDiff";
import Section from "@/components/content/Section";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";
import MockupNotice from "@/components/mockups/MockupNotice";
import PrevNextNav from "@/components/mockups/PrevNextNav";

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

const prevNextItem = ([key, other]: (typeof activeAmbassadors)[number]) => {
  const thumb = getAmbassadorImages(key)[0];
  return {
    label: other.name,
    href: mockupHref(key),
    image: (
      <Image
        src={thumb.src}
        alt=""
        width={96}
        className="size-10 shrink-0 rounded-lg object-cover"
        style={{ objectPosition: thumb.position }}
      />
    ),
  };
};

const stringifyLifespan = (value: number | { min: number; max: number }) =>
  typeof value === "number" ? `${value}` : `${value.min}-${value.max}`;

/* Stats: same rows, order and compact layout as the live ambassador page */

type Stat = { title: string; value: ReactNode };
type Stats = (Stat | Stat[])[];

const getStats = (ambassador: Ambassador): Stats => {
  const species = getSpecies(ambassador.species);
  const enclosure = enclosures[ambassador.enclosure];

  return [
    {
      title: "Species",
      value: (
        <>
          <p>{species.name}</p>
          <p className="text-base text-alveus-green-700 italic">
            {species.scientificName} (
            <Link
              href={`/ambassadors#classification:${convertToSlug(
                getClassification(species.class),
              )}`}
            >
              {getClassification(species.class)}
            </Link>
            )
          </p>
        </>
      ),
    },
    {
      title: "Conservation Status",
      value: (
        <p>
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
        </p>
      ),
    },
    {
      title: "Native To",
      value: <p>{species.native}</p>,
    },
    {
      title: "Species Lifespan",
      value: (
        <div className="flex flex-col flex-nowrap gap-x-4 gap-y-2 md:flex-row md:items-center lg:flex-col lg:items-start xl:flex-row xl:items-center">
          <p>
            Wild:{" "}
            {typeof species.lifespan.wild === "string"
              ? species.lifespan.wild
              : `${stringifyLifespan(species.lifespan.wild)} years`}
          </p>
          <div className="hidden h-4 w-px bg-alveus-green opacity-75 md:block lg:hidden xl:block" />
          <p>
            Captivity:{" "}
            {typeof species.lifespan.captivity === "string"
              ? species.lifespan.captivity
              : `${stringifyLifespan(species.lifespan.captivity)} years`}
          </p>
        </div>
      ),
    },
    [
      {
        title: `Date of ${
          { live: "Birth", egg: "Hatching", seed: "Planting" }[species.birth]
        }`,
        value: (
          <>
            <p>{formatPartialDateString(ambassador.birth)}</p>
            {ambassador.birth && !ambassador.retired && (
              <p className="text-base text-alveus-green-700 italic">
                <PartialDateDiff date={ambassador.birth} suffix="old" />
              </p>
            )}
          </>
        ),
      },
      {
        title: "Sex",
        value: <p>{ambassador.sex || "Unknown"}</p>,
      },
      {
        title: "Arrived at Alveus",
        value: (
          <>
            <p>{formatPartialDateString(ambassador.arrival)}</p>
            {ambassador.arrival && !ambassador.retired && (
              <p className="text-base text-alveus-green-700 italic">
                <PartialDateDiff date={ambassador.arrival} suffix="ago" />
              </p>
            )}
          </>
        ),
      },
      {
        title: "Enclosure",
        value: (
          <p>
            <Link
              href={`/ambassadors#enclosures:${camelToKebab(
                ambassador.enclosure,
              )}`}
            >
              {enclosure.name}
            </Link>
          </p>
        ),
      },
    ],
  ];
};

const AmbassadorMockup = ({ ambassadorKey }: Props) => {
  const ambassador: Ambassador = ambassadors[ambassadorKey];
  const enclosure = enclosures[ambassador.enclosure];
  const images = useMemo(
    () => getAmbassadorImages(ambassadorKey),
    [ambassadorKey],
  );
  const merchImage = useMemo(
    () => getAmbassadorMerchImage(ambassadorKey),
    [ambassadorKey],
  );
  const animalQuest = useMemo(
    () => getAmbassadorEpisodes(ambassadorKey),
    [ambassadorKey],
  );
  const sounds = useMemo(
    () => getAmbassadorSounds(ambassadorKey),
    [ambassadorKey],
  );
  const stats = useMemo(() => getStats(ambassador), [ambassador]);

  // Previous/next in the same order as the live /ambassadors page
  const idx = activeAmbassadors.findIndex(([key]) => key === ambassadorKey);
  const count = activeAmbassadors.length;
  const prev = activeAmbassadors[(idx - 1 + count) % count]!;
  const next = activeAmbassadors[(idx + 1) % count]!;

  const others = activeAmbassadors.filter(
    ([key, other]) =>
      key !== ambassadorKey && other.enclosure === ambassador.enclosure,
  );

  /* Photo carousel and lightbox, as on the live page */
  const [carouselLightboxOpen, setCarouselLightboxOpen] = useState<string>();
  const carouselLightboxItems = useMemo(
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
                  style={{
                    aspectRatio: `${image.src.width} / ${image.src.height}`,
                  }}
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
  const carouselItems = useMemo(
    () =>
      images.reduce<Record<string, ReactNode>>(
        (acc, image) => ({
          ...acc,
          [image.src.src]: (
            <Link
              href={image.src.src}
              external
              onClick={(e) => {
                e.preventDefault();
                setCarouselLightboxOpen(image.src.src);
              }}
              draggable={false}
              className="group/trigger"
              custom
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={300}
                className="aspect-square h-auto w-full rounded-xl object-cover transition group-hover/trigger:scale-102 motion-reduce:transition-none"
                style={{ objectPosition: image.position }}
                draggable={false}
              />
            </Link>
          ),
        }),
        {},
      ),
    [images],
  );

  /* Highlights: featured player plus strip, opening in the lightbox */
  const [clip, setClip] = useState(0);
  const [clipsLightboxOpen, setClipsLightboxOpen] = useState<string>();
  const featuredClip = ambassador.clips[clip];
  const clipsLightboxItems = useMemo(
    () =>
      ambassador.clips.reduce<Record<string, ReactNode>>(
        (acc, item) => ({
          ...acc,
          [item.id]: <YouTubeEmbed videoId={item.id} caption={item.caption} />,
        }),
        {},
      ),
    [ambassador.clips],
  );

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

      {/* Full-height sticky photo layout from the live ambassador page */}
      <div className="relative">
        <Section
          className="min-h-[85vh] pt-64 lg:pt-0"
          containerClassName="flex flex-wrap"
        >
          <div className="absolute inset-x-0 top-0 h-64 w-full lg:bottom-0 lg:h-full lg:w-1/2">
            <Image
              src={images[0].src}
              alt={images[0].alt}
              placeholder="blur"
              priority
              className="absolute inset-x-0 top-0 size-full object-cover lg:sticky lg:h-screen lg:max-h-full"
              style={{ objectPosition: images[0].position }}
            />
          </div>

          <div className="basis-full lg:basis-1/2" />

          <div className="flex basis-full flex-col py-4 lg:max-w-1/2 lg:basis-1/2 lg:px-8 lg:pt-8">
            <PrevNextNav
              label="Ambassadors"
              previous={prevNextItem(prev)}
              next={prevNextItem(next)}
              className="mb-4"
            />

            <Heading className="text-5xl">{ambassador.name}</Heading>
            {!!ambassador.alternate.length && (
              <p className="-mt-1 mb-2 text-lg text-alveus-green-700 italic">
                also:{" "}
                <span className="text-xl">
                  {ambassador.alternate.join("; ")}
                </span>
              </p>
            )}

            <div className="my-2 space-y-2 text-xl">
              {[ambassador.story, ambassador.mission]
                .flatMap((text) => text.split("\n\n"))
                .map((text) => (
                  <p key={text}>{text}</p>
                ))}
            </div>

            <dl className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-auto-2 lg:grid-cols-auto-2">
              {stats.map((item) => {
                const nested = Array.isArray(item);
                const items = nested ? item : [item];
                return (
                  <div
                    key={items.map((i) => i.title).join(",")}
                    className={classes(
                      "contents",
                      nested &&
                        "col-span-full grid-cols-auto-4 gap-4 md:grid lg:contents xl:grid",
                    )}
                  >
                    {items.map(({ title, value }, itemIdx) => (
                      <Fragment key={title}>
                        <div
                          className={classes(
                            "col-span-full h-px bg-alveus-green opacity-10",
                            nested &&
                              itemIdx % 2 !== 0 &&
                              "md:hidden lg:block xl:hidden",
                          )}
                        />
                        <dt className="self-center text-2xl font-bold">
                          {title}
                        </dt>
                        <dd className="self-center text-xl text-balance">
                          {value}
                        </dd>
                      </Fragment>
                    ))}
                  </div>
                );
              })}
            </dl>

            {!!sounds?.length && (
              <dl className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-auto-2 lg:grid-cols-auto-2">
                <div className="col-span-full h-px bg-alveus-green opacity-10" />
                <dt className="self-center text-2xl font-bold">Sounds</dt>
                <dd className="self-center">
                  <div className="flex flex-wrap gap-4">
                    {sounds.map(({ src, caption }) => (
                      <div
                        key={src}
                        className="flex flex-col items-center gap-1"
                      >
                        <audio controls src={src} preload="none" />
                        <p className="text-center text-base text-alveus-green-700">
                          {caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </dd>
              </dl>
            )}

            {/* Did you know? with Animal Quest, in the same place as the live page */}
            {ambassador.fact ? (
              <Box dark className="my-6 flex flex-col gap-2 p-4">
                <Heading level={2} id="did-you-know" className="my-0 text-2xl">
                  Did you know?
                </Heading>

                {ambassador.fact.split("\n\n").map((fact) => (
                  <p key={fact} className="text-lg">
                    {fact}
                  </p>
                ))}

                {animalQuest?.map((aq) => (
                  <AnimalQuest
                    key={aq.episode}
                    episode={aq}
                    ambassador={ambassadorKey}
                    className="mt-2 hover:translate-y-1"
                  />
                ))}
              </Box>
            ) : (
              animalQuest?.map((aq) => (
                <AnimalQuest
                  key={aq.episode}
                  episode={aq}
                  ambassador={ambassadorKey}
                  className="my-6"
                />
              ))
            )}

            <Carousel
              items={carouselItems}
              auto={null}
              className="my-6"
              itemClassName="basis-1/2 md:basis-1/3 lg:basis-1/2 xl:basis-1/3 p-2 2xl:p-4"
            />

            <Lightbox
              open={carouselLightboxOpen}
              onClose={() => setCarouselLightboxOpen(undefined)}
              items={carouselLightboxItems}
            />

            {/* Plush, only where the data has one (on sale or announced) */}
            {ambassador.plush &&
              merchImage &&
              ("link" in ambassador.plush ? (
                <Link
                  href={ambassador.plush.link}
                  className="group mx-auto my-6"
                  external
                  custom
                >
                  <Image
                    src={merchImage.src}
                    width={512}
                    alt={`${ambassador.name} Plush`}
                    className="h-auto w-full max-w-lg rounded-2xl bg-alveus-tan transition group-hover:scale-102 motion-reduce:transition-none"
                  />
                </Link>
              ) : (
                <div className="relative mx-auto my-6 overflow-hidden rounded-2xl">
                  <Image
                    src={merchImage.src}
                    width={512}
                    alt={`${ambassador.name} Plush`}
                    className="h-auto w-full max-w-lg bg-alveus-tan"
                  />
                  {/* Same note as the live page, shown at all times so it also works on touch */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-1 border-t border-alveus-green-200 bg-alveus-tan/90 p-4 text-center font-bold text-alveus-green-800">
                    <p className="text-2xl md:text-3xl">Coming Soon</p>
                    <p className="text-lg md:text-2xl">
                      {ambassador.plush.soon}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Section>
      </div>

      {featuredClip && (
        <Section dark className="bg-alveus-green-800">
          <Heading
            level={2}
            id="highlights"
            className="mt-0 mb-8 text-center text-4xl"
          >
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
              {/* Same lightbox trigger as the live highlights */}
              <Link
                href={`https://www.youtube.com/watch?v=${featuredClip.id}`}
                external
                custom
                onClick={(e) => {
                  e.preventDefault();
                  setClipsLightboxOpen(featuredClip.id);
                }}
                className="group/trigger block w-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-tan"
              >
                <YouTubePreview
                  videoId={featuredClip.id}
                  alt={`Play ${featuredClip.caption}`}
                  className="aspect-video h-auto w-full object-cover"
                />
              </Link>
              <p className="mt-3 text-center text-xl">{featuredClip.caption}</p>
            </div>

            {ambassador.clips.length > 1 && (
              <ul className="flex flex-col gap-2">
                {ambassador.clips.map((item, clipIdx) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setClip(clipIdx)}
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

          <Lightbox
            open={clipsLightboxOpen}
            onClose={() => setClipsLightboxOpen(undefined)}
            items={clipsLightboxItems}
          />
        </Section>
      )}

      {/* Compact row, hidden when the ambassador lives alone */}
      {others.length > 0 && (
        <Section className="bg-alveus-green-100 py-8">
          <Heading level={2} className="mt-0 mb-4 text-2xl">
            Meet others in the {enclosure.name}
          </Heading>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {others.map(([key, other]) => {
                const image = getAmbassadorImages(key)[0];
                return (
                  <li key={key}>
                    <Link
                      href={mockupHref(key)}
                      custom
                      className="group flex items-center gap-2 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700"
                    >
                      <Image
                        src={image.src}
                        alt=""
                        width={96}
                        className="size-12 shrink-0 rounded-full object-cover"
                        style={{ objectPosition: image.position }}
                      />
                      <span className="font-serif text-lg font-bold transition-colors group-hover:text-alveus-green-700 motion-reduce:transition-none">
                        {other.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Button href="/ambassadors#enclosures" className="text-base">
              View all ambassadors by enclosure
            </Button>
          </div>
        </Section>
      )}
    </>
  );
};

// Keyed so carousel and highlight state resets when moving between ambassadors
const AmbassadorMockupPage: NextPage<Props> = ({ ambassadorKey }) => (
  <AmbassadorMockup key={ambassadorKey} ambassadorKey={ambassadorKey} />
);

export default AmbassadorMockupPage;
