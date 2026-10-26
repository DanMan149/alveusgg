import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { type NextPage } from "next";
import Image from "next/image";
import {
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
import IconEnvelope from "@/icons/IconEnvelope";
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
    <li
      id={collaboration.slug}
      className="flex scroll-mt-20 flex-col overflow-hidden rounded-xl border border-alveus-green-200 bg-alveus-tan-50"
    >
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
    </li>
  );
};

const CollaborationsView = () => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const searchId = useId();

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
      />

      <Section className="grow pt-8">
        <div className="mb-8 flex flex-col gap-2">
          <label htmlFor={searchId} className="font-semibold">
            Search by collaborator name
          </label>
          <div className="flex max-w-xl items-center rounded-lg border border-alveus-green/40 bg-alveus-tan-50 focus-within:outline-2 focus-within:outline-alveus-green-700">
            <IconSearch className="ml-3 size-4 shrink-0 text-alveus-green-700" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              autoComplete="off"
              className="min-w-0 grow bg-transparent px-3 py-2 outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mr-1 rounded-md p-2 text-alveus-green-700 hover:bg-alveus-green-100"
              >
                <IconX className="size-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
          <p aria-live="polite" className="text-sm text-alveus-green-700">
            {trimmed
              ? `${count.toLocaleString()} of ${collaborations.length.toLocaleString()} collaborations`
              : `${collaborations.length.toLocaleString()} collaborations`}
          </p>
        </div>

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
  // Text copied from the live contact page
  description: string;
  emails: string[];
  links: { label?: string; items: ContactLink[] }[];
};

const categories: ContactCategory[] = [
  {
    key: "donors",
    name: "Donors",
    description: "For donor inquiries",
    emails: ["contact@alveussanctuary.org"],
    links: [
      {
        items: [
          { text: "Donate", href: "/donate" },
          { text: "PO Box", href: "/po-box" },
        ],
      },
    ],
  },
  {
    key: "business",
    name: "Business",
    description: "For business inquiries",
    emails: ["alveus@loaded.gg"],
    links: [],
  },
  {
    key: "merch",
    name: "Merch",
    description: "For merch inquiries",
    emails: [],
    links: [
      {
        label: "For merch inquiries:",
        items: [
          {
            text: "shop.alveussanctuary.org/pages/contact",
            href: "https://shop.alveussanctuary.org/pages/contact",
            external: true,
          },
        ],
      },
      {
        label: "For plushie inquiries:",
        items: [
          {
            text: "youtooz.com/pages/contact-us",
            href: "https://youtooz.com/pages/contact-us",
            external: true,
          },
        ],
      },
    ],
  },
  {
    key: "grants",
    name: "Grants",
    description: "For foundation & corporate grants",
    emails: ["grants@alveussanctuary.org"],
    links: [
      { items: [{ text: "Funding priorities", href: "/donate/grants" }] },
    ],
  },
  {
    key: "collaboration",
    name: "Collaboration",
    description:
      "To connect with Maya regarding collaboration or to offer support for Alveus Sanctuary",
    emails: ["mayahiga@alveussanctuary.org"],
    links: [{ items: [{ text: "Collaborations", href: "/collaborations" }] }],
  },
  {
    key: "security",
    name: "Security and tech",
    description:
      "If you discover a security vulnerability within the website, or any of our other open-source projects, please email us",
    emails: ["opensource@alveussanctuary.org"],
    links: [
      {
        label:
          "For issues with the website or Twitch extension, please open an issue on GitHub:",
        items: [
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
    ],
  },
];

const EmailRow = ({ email }: { email: string }) => {
  const { copy, statusText } = useCopyToClipboard();

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-alveus-green-800 p-4 sm:flex-row sm:items-center">
      <p className="grow font-serif text-xl font-bold break-all">{email}</p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => copy(email)}
          className="inline-flex items-center gap-2 rounded-lg border border-alveus-tan/40 px-3 py-1.5 transition-colors hover:bg-alveus-tan hover:text-alveus-green-900"
        >
          <IconClipboard className="size-4" />
          <span aria-live="polite">{statusText}</span>
          <span className="sr-only"> {email}</span>
        </button>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 rounded-lg bg-alveus-tan px-3 py-1.5 text-alveus-green-900 transition-colors hover:bg-alveus-tan-200"
        >
          <IconEnvelope className="size-4" />
          Send email
        </a>
      </div>
    </div>
  );
};

const ContactView = () => (
  <Section className="grow">
    <Heading className="text-5xl">Contact Us</Heading>

    <p
      role="note"
      className="mb-8 inline-flex items-center gap-2 rounded-lg border border-alveus-green-300 bg-alveus-green-100 px-4 py-2 text-lg font-semibold"
    >
      <IconInformationCircle className="size-5 shrink-0" />
      We are not openly hiring.
    </p>

    <TabGroup vertical>
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <TabList
          aria-label="Contact category"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-col"
        >
          {categories.map((category) => (
            <Tab
              key={category.key}
              className={({ selected }) =>
                classes(
                  "rounded-lg border px-4 py-3 text-left font-serif text-lg transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700 motion-reduce:transition-none",
                  selected
                    ? "border-alveus-green bg-alveus-green text-alveus-tan"
                    : "border-alveus-green-200 bg-alveus-tan-50 hover:border-alveus-green-400",
                )
              }
            >
              {category.name}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {categories.map((category) => (
            <TabPanel
              key={category.key}
              className="flex flex-col gap-4 rounded-2xl bg-alveus-green p-6 text-alveus-tan focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700"
            >
              <Heading level={2} className="my-0 text-3xl">
                {category.name}
              </Heading>
              <p className="text-lg">{category.description}</p>

              {category.emails.map((email) => (
                <EmailRow key={email} email={email} />
              ))}

              {category.links.map((group) => (
                <div key={group.items[0]!.href}>
                  {group.label && <p className="mb-2">{group.label}</p>}
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {group.items.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          external={link.external}
                          dark
                          className="inline-flex items-center gap-1 text-lg"
                        >
                          {link.text}
                          {!link.external && (
                            <IconArrowRight className="size-4" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </TabPanel>
          ))}
        </TabPanels>
      </div>
    </TabGroup>
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
