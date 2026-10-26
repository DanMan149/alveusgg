import { type NextPage } from "next";
import Image, { type StaticImageData } from "next/image";
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
import Heading from "@/components/content/Heading";
import InPageNav from "@/components/content/InPageNav";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import SubNav from "@/components/content/SubNav";
import MockupNotice from "@/components/mockups/MockupNotice";
import { underlineTabClassName } from "@/components/mockups/ViewTabs";

import IconAmazon from "@/icons/IconAmazon";
import IconArrowRight from "@/icons/IconArrowRight";
import IconBox from "@/icons/IconBox";
import IconDollar from "@/icons/IconDollar";

import usfwsMexicanWolfFieldImage from "@/assets/institute/usfws-mexican-wolf-field.jpg";
import usfwsRedWolfImage from "@/assets/institute/usfws-red-wolf.jpg";

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

const homepageAmbassadors = activeAmbassadors
  .filter(([, ambassador]) => !!ambassador.homepage)
  .map(([key]) => key);

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

type SpeciesCard = {
  key: string;
  name: string;
  image: { src: StaticImageData; alt: string };
  text: ReactNode;
  href: string;
  cta: string;
};

// Copy from the Wolves component on the institute pages
const wolfSpecies: SpeciesCard[] = [
  {
    key: "red-wolf",
    name: "Red wolf",
    image: {
      src: usfwsRedWolfImage,
      alt: "Red wolf, B. Bartel/USFWS, Public Domain, https://www.fws.gov/media/red-wolf-7",
    },
    text: "21 Red wolves exist in the wild today.",
    href: "/institute",
    cta: "Learn More About the Institute",
  },
  {
    key: "mexican-gray-wolf",
    name: "Mexican Gray wolf",
    image: {
      src: usfwsMexicanWolfFieldImage,
      alt: "Mexican wolf in field, New Mexico Department of Game and Fish, Public Domain, https://www.fws.gov/media/mexican-wolf-field",
    },
    text: "319 Mexican Gray wolves exist in the wild today.",
    href: "/institute",
    cta: "Learn More About the Institute",
  },
];

type Mode = "default" | "donkey" | "wolf" | "birthday";

const modes: Record<Mode, string> = {
  default: "Default",
  donkey: "Donkey Day",
  wolf: "Wolf Week",
  birthday: "Birthday",
};

const AmbassadorCard = ({
  ambassadorKey,
  size = "default",
  badge,
}: {
  ambassadorKey: AmbassadorKey;
  size?: "default" | "large" | "wide";
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
            size === "large" && "aspect-4/3",
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
      <p>{ambassador.homepage?.description ?? ambassador.mission}</p>
      <Link href={href} className="mt-auto inline-flex items-center gap-1">
        Meet {ambassador.name}
        <IconArrowRight className="size-4" />
      </Link>
    </div>
  );
};

const WolfSpeciesCard = ({ card }: { card: SpeciesCard }) => (
  <div className="flex min-w-0 flex-col gap-2">
    <Image
      src={card.image.src}
      alt={card.image.alt}
      width={400}
      className="aspect-square h-auto w-full rounded-xl object-cover"
    />
    <p className="text-sm text-alveus-green-700">
      Alveus Research & Recovery Institute
    </p>
    <Heading level={3} className="my-0 text-2xl">
      {card.name}
    </Heading>
    <p>{card.text}</p>
    <Link href={card.href} className="mt-auto inline-flex items-center gap-1">
      {card.cta}
      <IconArrowRight className="size-4" />
    </Link>
  </div>
);

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

const FeaturedAmbassadors = () => {
  const [mode, setMode] = useState<Mode>("default");
  const birthday = useMemo(() => getBirthdayAmbassador(new Date()), []);

  let content: ReactNode;
  switch (mode) {
    case "donkey":
      content = (
        <>
          <Banner tag="Featured today" title="Donkey Day" />
          <div className="grid gap-6 sm:grid-cols-2">
            <AmbassadorCard ambassadorKey="serrano" size="large" />
            <AmbassadorCard ambassadorKey="jalapeno" size="large" />
          </div>
        </>
      );
      break;

    case "wolf":
      content = (
        <>
          <Banner tag="Featured this week" title="National Wolf Awareness Week">
            <Button href="/institute/pixels/two" className="shrink-0">
              Donate to Support the Institute
            </Button>
          </Banner>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
            <AmbassadorCard ambassadorKey="akela" />
            {wolfSpecies.map((card) => (
              <WolfSpeciesCard key={card.key} card={card} />
            ))}
          </div>
        </>
      );
      break;

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
            {homepageAmbassadors
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
          {homepageAmbassadors.slice(0, 4).map((key) => (
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

// Titles from the home page, descriptions from the donate page cards
const help = [
  {
    key: "donate",
    icon: IconDollar,
    title: "Donate to Alveus directly",
    description:
      "Make a one-time donation to Alveus, or set up a recurring donation for ongoing support.",
    link: "/donate",
    cta: "Donate",
    external: false,
  },
  {
    key: "amazon",
    icon: IconAmazon,
    title: "Gift via our Amazon Wishlist",
    description:
      "Donate specific items we are in need of at Alveus through our Amazon wishlist.",
    link: "/wishlist",
    cta: "Wishlist",
    external: true,
  },
  {
    key: "po-box",
    icon: IconBox,
    title: "Send items to our PO Box",
    description:
      "Send something to our PO Box. Perhaps a snack for our staff or ambassador enrichment?",
    link: "/po-box",
    cta: "PO Box",
    external: false,
  },
];

const NavigationAndCardsPage: NextPage = () => (
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
      <p className="mb-8 max-w-3xl">
        Shows three or four ambassadors at once instead of a carousel, with
        modes for special days. Photos, names and text come from the ambassador
        data. The birthday mode picks the next ambassador birthday.
      </p>

      <FeaturedAmbassadors />
    </Section>

    {/* 3. How to Help */}
    <Section dark className="bg-alveus-green-900">
      <Heading level={2} id="how-to-help" className="text-center">
        How to Help
      </Heading>

      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {help.map((item) => (
          <li key={item.key}>
            <Link
              href={item.link}
              external={item.external}
              custom
              className="group flex h-full flex-col gap-3 rounded-xl border border-alveus-green-700 bg-alveus-green-800 p-5 transition-colors hover:border-alveus-tan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-tan motion-reduce:transition-none"
            >
              <span className="self-start rounded-2xl bg-alveus-tan p-3 text-alveus-green">
                <item.icon size={24} />
              </span>
              <span className="font-serif text-2xl font-bold">
                {item.title}
              </span>
              <span className="text-alveus-green-100">{item.description}</span>
              <span className="mt-auto inline-flex items-center gap-1 underline">
                {item.cta}
                <IconArrowRight className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  </>
);

export default NavigationAndCardsPage;
