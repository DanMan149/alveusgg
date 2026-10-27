import { type GetStaticProps, type NextPage } from "next";
import Image from "next/image";
import { type ReactNode, useMemo, useState } from "react";

import ambassadors, {
  type AmbassadorKey,
} from "@alveusgg/data/build/ambassadors/core";
import { isActiveAmbassadorEntry } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";
import { getSpecies } from "@alveusgg/data/build/ambassadors/species";
import { getIUCNStatus } from "@alveusgg/data/build/iucn";

import { classes } from "@/utils/classes";
import { formatPartialDateString } from "@/utils/datetime-partial";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { camelToKebab } from "@/utils/string-case";

import Button from "@/components/content/Button";
import Donate from "@/components/content/Donate";
import Heading from "@/components/content/Heading";
import InPageNav from "@/components/content/InPageNav";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";
import MockupNotice from "@/components/mockups/MockupNotice";
import { underlineTabClassName } from "@/components/mockups/ViewTabs";

import IconArrowRight from "@/icons/IconArrowRight";

/* ---------- 1. In-page nav ---------- */

// Copied from /help/report-neglect-surrender
const demoSections = [
  {
    id: "demo-reporting",
    name: "Reporting Cruelty",
    heading: "Reporting Animal Cruelty, Neglect, and Pet Store Concerns",
    text: "If you suspect an animal is being mistreated, your prompt action can be life-saving. Because laws and authorities vary by location, this guide is organized to help you reach the right people quickly.",
  },
  {
    id: "demo-surrendering",
    name: "Surrendering a Pet",
    heading: "Surrendering or Finding a Pet",
    text: "If you can no longer care for a pet or have found a stray one, please follow these professional protocols to ensure the animal's safety and legal protection.",
  },
  {
    id: "demo-wildlife",
    name: "Found a Wild Animal?",
    heading: "Found an Injured or Orphaned Wild Animal?",
    text: "If you found native wildlife that might need assistance, and you aren't sure what to do or who to contact, check out our dedicated interactive tool.",
  },
];

/* ---------- 2. Featured ambassadors ---------- */

const activeAmbassadors = typeSafeObjectEntries(ambassadors).filter(
  isActiveAmbassadorEntry,
);

// The next upcoming birthday among ambassadors with a full date of birth
const getBirthdayAmbassador = (today: Date) => {
  const withBirthdays = activeAmbassadors
    .map(([key, ambassador]) => {
      // Only ambassadors with a full date of birth (YYYY-MM-DD)
      const parts = ambassador.birth?.split("-").map(Number);
      if (!parts || parts.length !== 3) return null;
      const [year = 0, month = 1, day = 1] = parts;

      const next = new Date(Date.UTC(today.getUTCFullYear(), month - 1, day));
      if (next.getTime() < today.getTime() - 24 * 60 * 60 * 1000)
        next.setUTCFullYear(next.getUTCFullYear() + 1);
      return { key, next, age: next.getUTCFullYear() - year };
    })
    .filter((item) => item !== null)
    .sort((a, b) => a.next.getTime() - b.next.getTime());
  return withBirthdays[0];
};

type Mode = "random" | "birthday";

const modes: Record<Mode, string> = {
  random: "Random",
  birthday: "Birthday",
};

// Random picks happen at build time, refreshed with the same revalidate
// window as the home page's YouTube section
type Props = { randomAmbassadors: AmbassadorKey[] };

export const getStaticProps: GetStaticProps<Props> = () => {
  // Every active ambassador, same list as the live /ambassadors page
  const pool = activeAmbassadors.map(([key]) => key);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }

  return {
    props: { randomAmbassadors: pool.slice(0, 4) },
    revalidate: 1800, // revalidate after 30 minutes
  };
};

const AmbassadorCard = ({
  ambassadorKey,
  size = "default",
  badge,
}: {
  ambassadorKey: AmbassadorKey;
  size?: "default" | "wide";
  badge?: ReactNode;
}) => {
  const ambassador = ambassadors[ambassadorKey];
  const species = getSpecies(ambassador.species);
  const image = getAmbassadorImages(ambassadorKey)[0];
  const href = `/ambassadors/${camelToKebab(ambassadorKey)}`;

  return (
    <div
      className={classes(
        "flex min-w-0 flex-col gap-2",
        size === "wide" && "col-span-2",
      )}
    >
      <div className="relative">
        <Image
          src={image.src}
          alt={image.alt}
          width={size === "default" ? 400 : 800}
          className={classes(
            "h-auto w-full rounded-xl object-cover",
            size === "default" && "aspect-square",
            size === "wide" && "aspect-[2.08/1]",
          )}
          style={{ objectPosition: image.position }}
        />
        {badge && (
          <span className="absolute top-3 left-3 rounded-md bg-alveus-tan px-2 py-1 text-sm font-semibold text-alveus-green-900">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-alveus-green-700">
        {species.name} &middot; IUCN: {getIUCNStatus(species.iucn.status)}
      </p>
      <Heading
        level={3}
        className={classes(
          "my-0",
          size === "default" ? "text-2xl" : "text-3xl",
        )}
      >
        {ambassador.name}
      </Heading>
      <p>{ambassador.mission}</p>
      <Link href={href} className="mt-auto inline-flex items-center gap-1">
        Meet {ambassador.name}
        <IconArrowRight className="size-4" />
      </Link>
    </div>
  );
};

const Banner = ({
  tag,
  title,
  children,
}: {
  tag: string;
  title: ReactNode;
  children?: ReactNode;
}) => (
  <div className="mb-6 flex flex-col gap-3 rounded-xl border border-alveus-green-200 bg-alveus-green-100 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-semibold tracking-wide text-alveus-green-700 uppercase">
        {tag}
      </p>
      <p className="font-serif text-2xl font-bold">{title}</p>
    </div>
    {children}
  </div>
);

const FeaturedAmbassadors = ({
  randomAmbassadors,
}: {
  randomAmbassadors: AmbassadorKey[];
}) => {
  const [mode, setMode] = useState<Mode>("random");
  const birthday = useMemo(() => getBirthdayAmbassador(new Date()), []);

  let content: ReactNode;
  switch (mode) {
    case "birthday":
      content = birthday ? (
        <>
          <Banner
            tag="Happy birthday"
            title={`${ambassadors[birthday.key].name} turns ${birthday.age}`}
          >
            <p className="text-alveus-green-700">
              Born {formatPartialDateString(ambassadors[birthday.key].birth)}
            </p>
          </Banner>
          <div className="grid grid-cols-2 items-start gap-6 lg:grid-cols-4">
            <AmbassadorCard
              ambassadorKey={birthday.key}
              size="wide"
              badge="Birthday today"
            />
            {/* Side cards: the build-time random pick from all active ambassadors */}
            {randomAmbassadors
              .filter((key) => key !== birthday.key)
              .slice(0, 2)
              .map((key) => (
                <AmbassadorCard key={key} ambassadorKey={key} />
              ))}
          </div>
        </>
      ) : null;
      break;

    default:
      content = (
        <div className="grid grid-cols-2 items-start gap-6 lg:grid-cols-4">
          {randomAmbassadors.map((key) => (
            <AmbassadorCard key={key} ambassadorKey={key} />
          ))}
        </div>
      );
  }

  return (
    <>
      <div
        role="group"
        aria-label="Preview mode (mockup only)"
        className="mb-8 flex flex-wrap items-center gap-x-2 border-b border-alveus-green-200"
      >
        <span className="mr-2 text-sm text-alveus-green-700">
          Preview mode (mockup only):
        </span>
        {(Object.keys(modes) as Mode[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
            className={underlineTabClassName(mode === key)}
          >
            {modes[key]}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Heading level={2} className="my-0">
          Ambassadors:
        </Heading>
        <Link href="/ambassadors" className="text-lg">
          See All ({activeAmbassadors.length})
        </Link>
      </div>

      {content}

      <div className="mt-10 flex flex-col gap-4 rounded-xl bg-alveus-green p-6 text-alveus-tan md:flex-row md:items-center md:justify-between">
        <div>
          <Heading level={3} className="my-0">
            Do you want to support these animals?
          </Heading>
          <p className="mt-2 max-w-2xl">
            Donations help Alveus carry on its mission to inspire online
            audiences to engage in conservation efforts while providing
            high-quality animal care to these ambassadors.
          </p>
        </div>
        <Button href="/donate" dark filled className="shrink-0">
          Donate Now
        </Button>
      </div>
    </>
  );
};

/* ---------- 3. How to Help ---------- */

// The donate page's button cards (components/content/Donate.tsx), with the
// home page's titles and links. Descriptions are the donate page's own.
const help = [
  {
    type: "direct",
    title: "Donate to Alveus directly",
    link: "/donate",
    external: false,
  },
  {
    type: "wishlist",
    title: "Gift via our Amazon Wishlist",
    link: "/wishlist",
    external: true,
  },
  {
    type: "poBox",
    title: "Send items to our PO Box",
    link: "/po-box",
    external: false,
  },
] as const;

const NavigationAndCardsPage: NextPage<Props> = ({ randomAmbassadors }) => (
  <>
    <Meta
      title="Navigation and cards | Mockup"
      description="Design mockup of the in-page nav, featured ambassadors and How to Help cards."
      noindex
    />

    {/* Nav background */}
    <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

    <MockupNotice />

    <Section dark className="py-12">
      <Heading className="my-0">Navigation and cards</Heading>
      <p className="mt-2 text-lg">
        Three home and shared page pieces: the in-page section nav, the featured
        ambassadors block, and How to Help.
      </p>
    </Section>

    {/* 1. In-page nav */}
    <Section>
      <Heading level={2} id="in-page-nav">
        1. In-page nav
      </Heading>
      <p className="max-w-3xl">
        The current nav uses chevrons, which read as expand arrows. The new
        shared nav uses plain links with thin dividers, underlines the section
        you are reading, and jumps to each heading. It is used on the Events,
        Collaborations and About history mockups too.
      </p>

      <Heading level={3} className="mt-8 text-xl">
        Before
      </Heading>
      <div className="overflow-hidden rounded-xl border border-alveus-green-200">
        <SubNav
          links={demoSections.map((section) => ({
            name: section.name,
            href: `#${section.id}`,
          }))}
          className="static shadow-none"
        />
      </div>

      <Heading level={3} className="mt-8 text-xl">
        After (scroll to try)
      </Heading>
      <div className="rounded-xl border border-alveus-green-200">
        <InPageNav
          label="On this page"
          items={demoSections.map((section) => ({
            id: section.id,
            label: section.name,
          }))}
          className="rounded-t-xl"
        />
        {demoSections.map((section, idx) => (
          <div
            key={section.id}
            className={classes(
              "min-h-[60vh] px-6 py-8",
              idx % 2 === 1 && "bg-alveus-green text-alveus-tan",
            )}
          >
            <Heading level={4} id={section.id} className="mt-0 text-2xl">
              {section.heading}
            </Heading>
            <p className="max-w-3xl">{section.text}</p>
          </div>
        ))}
      </div>
    </Section>

    {/* 2. Featured ambassadors */}
    <Section className="bg-alveus-green-100">
      <Heading level={2} id="featured-ambassadors">
        2. Home: featured ambassadors
      </Heading>

      <FeaturedAmbassadors randomAmbassadors={randomAmbassadors} />
    </Section>

    {/* 3. How to Help */}
    <Section dark className="bg-alveus-green-900">
      <Heading level={2} id="how-to-help" className="text-center">
        How to Help
      </Heading>

      <ul className="mt-8 grid gap-8 md:grid-cols-3">
        {help.map((item) => (
          <li key={item.type}>
            <Donate
              type={item.type}
              title={item.title}
              link={item.link}
              external={item.external}
            />
          </li>
        ))}
      </ul>
    </Section>
  </>
);

export default NavigationAndCardsPage;
