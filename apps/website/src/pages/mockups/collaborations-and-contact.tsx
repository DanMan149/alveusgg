import { type NextPage } from "next";
import Image from "next/image";
import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import collaborations, { type Collaboration } from "@/data/collaborations";

import { classes } from "@/utils/classes";
import { formatDateTime } from "@/utils/datetime";

import { useCopyToClipboard } from "@/hooks/clipboard";

import Box from "@/components/content/Box";
import Heading from "@/components/content/Heading";
import InPageNav from "@/components/content/InPageNav";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";
import MockupNotice from "@/components/mockups/MockupNotice";
import ViewTabs from "@/components/mockups/ViewTabs";

import IconArrowRight from "@/icons/IconArrowRight";
import IconClipboard from "@/icons/IconClipboard";
import IconExternal from "@/icons/IconExternal";
import IconInformationCircle from "@/icons/IconInformationCircle";
import IconSearch from "@/icons/IconSearch";
import IconX from "@/icons/IconX";

import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";

import { Creators, creators } from "@/pages/collaborations";

/* ---------- Collaborations ---------- */

const highlight = (text: string, query: string): ReactNode => {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-xs bg-yellow-300 text-inherit">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

const matches = (collaboration: Collaboration, query: string) => {
  const q = query.toLowerCase();
  return (
    collaboration.name.toLowerCase().includes(q) ||
    collaboration.creators.some((creator) =>
      creator.name.toLowerCase().includes(q),
    )
  );
};

const years = collaborations.reduce<Map<string, Collaboration[]>>(
  (map, collaboration) => {
    const year = collaboration.date.getUTCFullYear().toString();
    map.set(year, [...(map.get(year) || []), collaboration]);
    return map;
  },
  new Map(),
);

const CollaborationCard = ({
  collaboration,
  query,
  onOpen,
}: {
  collaboration: Collaboration;
  query: string;
  onOpen: (slug: string) => void;
}) => {
  const creatorMatch =
    query && !collaboration.name.toLowerCase().includes(query.toLowerCase())
      ? collaboration.creators.find((creator) =>
          creator.name.toLowerCase().includes(query.toLowerCase()),
        )
      : undefined;

  return (
    <li id={collaboration.slug} className="scroll-mt-28">
      <Box className="flex h-full flex-col p-0">
        <Link
          href={`https://www.youtube.com/watch?v=${collaboration.videoId}`}
          external
          custom
          onClick={(e) => {
            e.preventDefault();
            onOpen(collaboration.slug);
          }}
          className="group/trigger block"
        >
          <YouTubePreview
            videoId={collaboration.videoId}
            alt={`Watch the ${collaboration.name} collaboration`}
            className="aspect-video h-auto w-full object-cover"
          />
        </Link>
        <div className="flex flex-col gap-1 p-4">
          <Heading level={3} className="my-0 text-2xl">
            {collaboration.link !== null ? (
              <Link
                href={collaboration.link}
                external
                custom
                className="hover:text-alveus-green-600 hover:underline"
              >
                {highlight(collaboration.name, query)}
              </Link>
            ) : (
              highlight(collaboration.name, query)
            )}
          </Heading>
          {creatorMatch && (
            <p className="text-sm text-alveus-green-700">
              With {highlight(creatorMatch.name, query)}
            </p>
          )}
          <p className="text-alveus-green-700">
            {formatDateTime(collaboration.date, { style: "long" })}
          </p>
          {collaboration.vodId && (
            <p>
              <Link
                href={`https://www.youtube.com/watch?v=${collaboration.vodId}&list=PLtQafKoimfLd6dM9CQqiLm79khNgxsoN3`}
                external
              >
                Full stream VoD
              </Link>
            </p>
          )}
        </div>
      </Box>
    </li>
  );
};

const SearchControl = ({
  query,
  setQuery,
  count,
}: {
  query: string;
  setQuery: (value: string) => void;
  count: number;
}) => {
  const searchId = useId();
  const countId = useId();
  const trimmed = query.trim();

  return (
    <div className="flex w-full items-center gap-3 sm:w-auto">
      <label htmlFor={searchId} className="sr-only">
        Search by collaborator name
      </label>
      <div className="flex min-w-0 grow items-center rounded-lg border border-alveus-green/40 bg-alveus-tan-50 focus-within:outline-2 focus-within:outline-alveus-green-700 sm:w-64 sm:grow-0">
        <IconSearch className="ml-3 size-4 shrink-0 text-alveus-green-700" />
        <input
          id={searchId}
          type="search"
          value={query}
          placeholder="Search by name"
          aria-describedby={countId}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
          autoComplete="off"
          className="min-w-0 grow bg-transparent px-2 py-1.5 outline-none placeholder:text-alveus-green-600 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mr-1 rounded-md p-1.5 text-alveus-green-700 hover:bg-alveus-green-100"
          >
            <IconX className="size-4" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>
      <p
        id={countId}
        aria-live="polite"
        className="shrink-0 text-sm whitespace-nowrap text-alveus-green-700 tabular-nums"
      >
        {trimmed
          ? `${count.toLocaleString()} of ${collaborations.length.toLocaleString()}`
          : `${collaborations.length.toLocaleString()} total`}
      </p>
    </div>
  );
};

const CollaborationsView = () => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const filtered = useMemo(
    () =>
      [...years.entries()]
        .map(
          ([year, items]) =>
            [year, items.filter((item) => matches(item, trimmed))] as const,
        )
        .filter(([, items]) => items.length > 0),
    [trimmed],
  );
  const count = filtered.reduce((sum, [, items]) => sum + items.length, 0);

  const [lightboxOpen, setLightboxOpen] = useState<string>();
  const lightboxItems = useMemo(
    () =>
      collaborations.reduce<Record<string, ReactNode>>(
        (acc, collaboration) => ({
          ...acc,
          [collaboration.slug]: (
            <YouTubeEmbed
              videoId={collaboration.videoId}
              caption={`${collaboration.name}: ${formatDateTime(collaboration.date, { style: "long" })}`}
            />
          ),
        }),
        {},
      ),
    [],
  );

  return (
    <>
      <div className="relative">
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-16 z-30 hidden h-auto w-1/2 max-w-48 -scale-x-100 select-none lg:block"
        />

        <Section dark className="pt-16 pb-12">
          <div className="flex flex-wrap items-end">
            <div className="w-full lg:w-2/3">
              <Heading>Our Collaborations</Heading>

              <p className="text-lg text-balance">
                We work with other content creators to educate our combined
                audiences, introducing them to the educational ambassadors at
                Alveus and their conservation missions.
              </p>

              <p className="mt-2 text-lg text-balance">
                We&apos;ve hosted{" "}
                <abbr
                  title={`Across ${collaborations.length.toLocaleString()} collaboration streams`}
                >
                  {creators.length.toLocaleString()} creators
                </abbr>{" "}
                at the sanctuary since{" "}
                {collaborations.at(-1)!.date.getFullYear()}, bringing audiences
                from Twitch, YouTube, and other platforms, together to learn
                about the importance of conservation.
              </p>
            </div>

            <div className="w-full lg:w-1/3 lg:pl-2">
              <p className="text-lg text-balance">
                We also collaborate with various organizations to amplify their
                efforts and share their important work with our audience,
                furthering our mission of conservation and education.
              </p>

              <p className="mt-2 text-lg">
                <Link href="/about/orgs" dark>
                  Explore some of our NGO collaborations
                  <IconArrowRight size={16} className="ml-1 inline-block" />
                </Link>
              </p>
            </div>
          </div>

          <Creators className="mt-6" />
        </Section>
      </div>

      <InPageNav
        label="Collaboration years"
        items={filtered.map(([year]) => ({ id: `year-${year}`, label: year }))}
        controlsClassName="w-full sm:w-auto"
      >
        <SearchControl query={query} setQuery={setQuery} count={count} />
      </InPageNav>

      <Section className="grow pt-8">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-lg text-alveus-green-700">
            No collaborators match that name.
          </p>
        )}

        {filtered.map(([year, items], idx) => (
          <section
            key={year}
            aria-labelledby={`year-${year}`}
            className={idx > 0 ? "mt-12" : undefined}
          >
            <Heading
              level={2}
              id={`year-${year}`}
              className="mt-0 mb-6 flex scroll-mt-20 items-end justify-between border-b-2 border-alveus-green-300/25 pb-2 text-4xl text-alveus-green-800"
            >
              {year}
              <small className="text-lg font-medium">{` (${items.length})`}</small>
            </Heading>
            <ul className="grid gap-6 md:grid-cols-2">
              {items.map((collaboration) => (
                <CollaborationCard
                  key={collaboration.slug}
                  collaboration={collaboration}
                  query={trimmed}
                  onOpen={setLightboxOpen}
                />
              ))}
            </ul>
          </section>
        ))}

        <Lightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(undefined)}
          items={lightboxItems}
        />
      </Section>
    </>
  );
};

/* ---------- Contact ---------- */

type ContactLink = { text: string; href: string; external?: boolean };

type ContactCategory = {
  key: string;
  name: string;
  // Text and links copied from the live contact page
  description?: string;
  emails: string[];
  // Labelled links shown in the dark inner box (merch)
  inner?: { label: string; link: ContactLink }[];
  // Text shown above the buttons
  note?: string;
  buttons: ContactLink[];
};

const categories: ContactCategory[] = [
  {
    key: "donors",
    name: "Donors",
    description: "For donor inquiries:",
    emails: ["contact@alveussanctuary.org"],
    buttons: [
      { text: "Donate", href: "/donate" },
      { text: "PO Box", href: "/po-box" },
    ],
  },
  {
    key: "business",
    name: "Business",
    description: "For business inquiries:",
    emails: ["alveus@loaded.gg"],
    buttons: [],
  },
  {
    key: "merch",
    name: "Merch",
    emails: [],
    inner: [
      {
        label: "For merch inquiries:",
        link: {
          text: "shop.alveussanctuary.org/pages/contact",
          href: "https://shop.alveussanctuary.org/pages/contact",
          external: true,
        },
      },
      {
        label: "For plushie inquiries:",
        link: {
          text: "youtooz.com/pages/contact-us",
          href: "https://youtooz.com/pages/contact-us",
          external: true,
        },
      },
    ],
    buttons: [],
  },
  {
    key: "grants",
    name: "Grants",
    description: "For foundation & corporate grants:",
    emails: ["grants@alveussanctuary.org"],
    buttons: [{ text: "Funding priorities", href: "/donate/grants" }],
  },
  {
    key: "collaboration",
    name: "Collaboration",
    description:
      "To connect with Maya regarding collaboration or to offer support for Alveus Sanctuary:",
    emails: ["mayahiga@alveussanctuary.org"],
    buttons: [],
  },
  {
    key: "security",
    name: "Security and tech",
    description:
      "If you discover a security vulnerability within the website, or any of our other open-source projects, please email us:",
    emails: ["opensource@alveussanctuary.org"],
    note: "For issues with the website or Twitch extension, please open an issue on GitHub:",
    buttons: [
      {
        text: "Website",
        href: "https://github.com/alveusgg/alveusgg/issues/new/choose",
        external: true,
      },
      {
        text: "Twitch Extension",
        href: "https://github.com/alveusgg/extension/issues/new/choose",
        external: true,
      },
    ],
  },
];

// Light fill, dark text (the style the old Send email button had)
const contactButtonClasses =
  "inline-flex items-center gap-2 rounded-lg bg-alveus-tan px-3 py-1.5 text-alveus-green-900 transition-colors hover:bg-alveus-tan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-tan motion-reduce:transition-none";

const innerBoxClasses = "rounded-xl bg-alveus-green-800 p-3";

// Let long addresses wrap at "@", "." and "/" rather than mid-word
const withBreaks = (text: string) =>
  text.split(/(?=[@./])/).map((part, idx) => (
    <Fragment key={part + idx.toString()}>
      {idx > 0 && <wbr />}
      {part}
    </Fragment>
  ));

const EmailRow = ({ email }: { email: string }) => {
  const { copy, status } = useCopyToClipboard();
  const message =
    status === "success" ? "Copied" : status === "error" ? "Copy failed" : "";

  return (
    <div className={classes(innerBoxClasses, "flex items-center gap-2")}>
      <Link
        href={`mailto:${email}`}
        dark
        className="min-w-0 grow font-serif text-base font-bold wrap-anywhere sm:text-lg"
      >
        {withBreaks(email)}
      </Link>
      <span className="relative shrink-0">
        <button
          type="button"
          onClick={() => copy(email)}
          aria-label="Copy email address"
          className="rounded-lg p-2 transition-colors hover:bg-alveus-tan hover:text-alveus-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-tan motion-reduce:transition-none"
        >
          <IconClipboard className="size-5" />
        </button>
        {/* Floats above the button so the row never shifts */}
        <span
          aria-hidden="true"
          className={classes(
            "pointer-events-none absolute right-0 bottom-full mb-1 rounded-md bg-alveus-tan px-2 py-0.5 text-sm whitespace-nowrap text-alveus-green-900 transition-opacity motion-reduce:transition-none",
            message ? "opacity-100" : "opacity-0",
          )}
        >
          {message || "Copied"}
        </span>
        <span className="sr-only" aria-live="polite">
          {message}
        </span>
      </span>
    </div>
  );
};

const wideKeys = ["merch", "security"];
const gridCategories = categories.filter(({ key }) => !wideKeys.includes(key));
const merch = categories.find(({ key }) => key === "merch");
const security = categories.find(({ key }) => key === "security");

const CategoryIntro = ({ category }: { category: ContactCategory }) => (
  <div>
    <Heading level={2} className="my-0 text-2xl">
      {category.name}
    </Heading>
    {category.description && <p className="mt-1">{category.description}</p>}
  </div>
);

const ContactButtons = ({
  links,
  className,
}: {
  links: ContactLink[];
  className?: string;
}) =>
  links.length > 0 ? (
    <ul className={classes("flex flex-wrap gap-2 pt-1", className)}>
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            external={link.external}
            custom
            className={contactButtonClasses}
          >
            {link.text}
            {link.external && <IconExternal size={14} aria-hidden="true" />}
            {link.external && (
              <span className="sr-only"> (opens in a new tab)</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  ) : null;

const ContactView = () => (
  <Section className="grow">
    <Heading className="text-5xl">Contact Us</Heading>

    <p
      role="note"
      className="mb-6 inline-flex items-center gap-2 rounded-lg border border-alveus-green-300 bg-alveus-green-100 px-4 py-2 text-lg font-semibold"
    >
      <IconInformationCircle className="size-5 shrink-0" />
      We are not openly hiring.
    </p>

    {/* Four equal cards: 1, 2 or 4 per row, so no row has an empty slot */}
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {gridCategories.map((category) => (
        <li key={category.key} id={`contact-${category.key}`}>
          <Box dark className="flex h-full flex-col gap-3 p-5">
            <CategoryIntro category={category} />
            {category.emails.map((email) => (
              <EmailRow key={email} email={email} />
            ))}
            {/* Buttons sit on the bottom edge so they line up across a row */}
            <ContactButtons links={category.buttons} className="mt-auto" />
          </Box>
        </li>
      ))}
    </ul>

    {/* Merch and Security have more content, so each gets a full-width row */}
    {merch && (
      <div id="contact-merch" className="mt-4">
        <Box dark className="flex flex-col gap-3 p-5">
          <CategoryIntro category={merch} />
          <ul className={classes(innerBoxClasses, "grid gap-3 md:grid-cols-2")}>
            {merch.inner?.map(({ label, link }) => (
              <li key={link.href}>
                <p className="text-sm">{label}</p>
                <Link
                  href={link.href}
                  external={link.external}
                  dark
                  className="font-serif text-base font-bold wrap-anywhere sm:text-lg"
                >
                  {withBreaks(link.text)}
                </Link>
              </li>
            ))}
          </ul>
        </Box>
      </div>
    )}

    {security && (
      <div id="contact-security" className="mt-4">
        <Box dark className="p-5">
          <Heading level={2} className="my-0 text-2xl">
            {security.name}
          </Heading>
          <div className="mt-3 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              {security.description && <p>{security.description}</p>}
              {security.emails.map((email) => (
                <EmailRow key={email} email={email} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {security.note && <p>{security.note}</p>}
              <ContactButtons links={security.buttons} />
            </div>
          </div>
        </Box>
      </div>
    )}
  </Section>
);

/* ---------- Page ---------- */

const views = ["collaborations", "contact"] as const;

const CollaborationsAndContactMockupPage: NextPage = () => {
  const [view, setView] = useState(0);

  // Allow #contact to open the contact view directly
  useEffect(() => {
    if (window.location.hash === "#contact") setView(1);
  }, []);

  const onChange = useCallback((idx: number) => {
    setView(idx);
    window.history.replaceState(
      null,
      "",
      idx === 1 ? "#contact" : window.location.pathname,
    );
  }, []);

  return (
    <>
      <Meta
        title="Collaborations and Contact | Mockup"
        description="Design mockup of the collaborations and contact pages."
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <MockupNotice />

      <ViewTabs
        label="Page"
        selected={view}
        onChange={onChange}
        tabs={[
          {
            key: views[0],
            label: "Collaborations",
            content: <CollaborationsView />,
          },
          { key: views[1], label: "Contact Us", content: <ContactView /> },
        ]}
      />
    </>
  );
};

export default CollaborationsAndContactMockupPage;
