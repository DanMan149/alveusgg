import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { type NextPage } from "next";
import Image from "next/image";
import {
  type ComponentType,
  type ReactNode,
  isValidElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import reactToText from "react-to-text";

import staff, { type Staff, type departments } from "@/data/staff";

import { classes } from "@/utils/classes";
import { formatPartialDateString } from "@/utils/datetime-partial";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import { MayaImage } from "@/components/content/Maya";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import MockupNotice from "@/components/mockups/MockupNotice";
import ViewTabs, { underlineTabClassName } from "@/components/mockups/ViewTabs";

import { type IconProps } from "@/icons/BaseIcon";
import IconArrowRight from "@/icons/IconArrowRight";
import IconBolt from "@/icons/IconBolt";
import IconBox from "@/icons/IconBox";
import IconChevronDown from "@/icons/IconChevronDown";
import IconDollar from "@/icons/IconDollar";
import IconUserGroup from "@/icons/IconUserGroup";
import IconX from "@/icons/IconX";

import { history } from "@/pages/about";

/* ---------- History ---------- */

type Category = "build" | "fundraiser" | "team" | "milestone";

const categories: Record<
  Category,
  { label: string; icon: ComponentType<IconProps> }
> = {
  build: { label: "Build", icon: IconBox },
  fundraiser: { label: "Fundraiser", icon: IconDollar },
  team: { label: "Team", icon: IconUserGroup },
  milestone: { label: "Milestone", icon: IconBolt },
};

// Category for each entry on the live history timeline
const categoryByKey: Record<string, Category> = {
  idea: "build",
  "fencing-pasture": "build",
  "parrot-aviary": "build",
  "crow-aviary": "build",
  "chicken-coop": "build",
  "training-center": "build",
  "fox-enclosure": "build",
  "falcon-aviary": "build",
  "marmoset-enclosure": "build",
  "wolf-enclosure": "build",
  "new-studio": "build",
  "fund-a-thon": "fundraiser",
  "halloween-fundraiser": "fundraiser",
  "art-auction": "fundraiser",
  "valentines-day-2023": "fundraiser",
  "art-auction-2023": "fundraiser",
  "summer-camp-2023": "fundraiser",
  "fall-carnival-2023": "fundraiser",
  "valentines-day-2024": "fundraiser",
  "art-auction-2024": "fundraiser",
  "summer-camp-2024": "fundraiser",
  "fall-carnival-2024": "fundraiser",
  "art-auction-2025": "fundraiser",
  "summer-camp-2025": "fundraiser",
  "art-auction-2026": "fundraiser",
};

const getCategory = (key: string, title: string): Category =>
  categoryByKey[key] ?? (/\bjoins?\b/i.test(title) ? "team" : "milestone");

// e.g. "Over $573,000 USD raised" -> "Over $573,000"
const parseAmount = (text: string) => {
  const match = text.match(/(over\s+)?\$([\d,]+)/i);
  if (!match) return null;
  return `${match[1] ? "Over " : ""}$${match[2]}`;
};

// Same order as the live history: oldest first
const entries = history
  .flatMap((section) => ("items" in section ? section.items : []))
  .map((item) => {
    const [title, ...paragraphs] = item.content;
    const category = getCategory(item.key, title);
    return {
      key: item.key,
      year: item.date.slice(0, 4),
      date: formatPartialDateString(item.date),
      title,
      paragraphs,
      link: item.link,
      category,
      amount:
        category === "fundraiser" ? parseAmount(paragraphs.join(" ")) : null,
    };
  });

type Entry = (typeof entries)[number];

const historyYears = [...new Set(entries.map((entry) => entry.year))];

// The live history puts video blocks (tours, recap) between the dated entries.
// Keep each one right after the entry that comes before it on the live page.
type HistoryBlock = {
  key: string;
  year: string;
  afterKey: string;
  content: ReactNode;
};

const historyBlocks = history.reduce<{
  blocks: HistoryBlock[];
  previous?: { key: string; date: string };
}>(
  (acc, section) => {
    if ("items" in section) return { ...acc, previous: section.items.at(-1) };
    if (!acc.previous) return acc;
    return {
      ...acc,
      blocks: [
        ...acc.blocks,
        {
          key: section.key,
          year: acc.previous.date.slice(0, 4),
          afterKey: acc.previous.key,
          content: section.cta,
        },
      ],
    };
  },
  { blocks: [] },
).blocks;

// Same markup as the dark Section used for these blocks on the live page
const HistoryVideoBlock = ({ block }: { block: HistoryBlock }) => (
  <li className="relative z-10 overflow-clip rounded-xl bg-alveus-green px-4 py-10 text-alveus-tan md:px-8">
    {block.content}
  </li>
);

const HistoryCard = ({
  entry,
  side,
}: {
  entry: Entry;
  side: "left" | "right";
}) => {
  const { icon: Icon, label } = categories[entry.category];
  const milestone = entry.category === "milestone";

  return (
    <li className="relative pl-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
      <span
        aria-hidden="true"
        className={classes(
          "absolute top-4 left-5 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-alveus-tan md:left-1/2",
          milestone
            ? "bg-alveus-green-900 text-alveus-tan"
            : "bg-alveus-green text-alveus-tan",
        )}
      >
        <Icon size={18} />
      </span>

      <div
        className={classes(
          "rounded-xl p-5",
          side === "right" && "md:col-start-2",
          milestone
            ? "bg-alveus-green-900 text-alveus-tan"
            : "border border-alveus-green-200 bg-alveus-tan-50",
        )}
      >
        <p
          className={classes(
            "text-sm font-semibold tracking-wide uppercase",
            milestone ? "text-alveus-green-200" : "text-alveus-green-600",
          )}
        >
          {entry.date} &middot; {label}
        </p>
        <Heading
          level={4}
          className={classes("mt-1 mb-0", milestone ? "text-2xl" : "text-xl")}
        >
          {entry.title}
        </Heading>
        {entry.amount && (
          <p className="mt-1 font-serif text-3xl font-bold text-red-700 tabular-nums">
            {entry.amount}
          </p>
        )}
        {entry.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mt-2">
            {paragraph}
          </p>
        ))}
        {entry.link && (
          <p className="mt-2">
            <Link
              href={entry.link.href}
              external={!entry.link.href.startsWith("/")}
              dark={milestone}
              className="inline-flex items-center gap-1"
            >
              {entry.link.text}
              {entry.link.href.startsWith("/") && (
                <IconArrowRight className="size-4" />
              )}
            </Link>
          </p>
        )}
      </div>
    </li>
  );
};

const HistoryView = () => {
  // 2020 and 2021 are open, the rest start collapsed
  const [open, setOpen] = useState<Record<string, boolean>>({
    "2020": true,
    "2021": true,
  });
  const [visible, setVisible] = useState<Record<Category, boolean>>({
    build: true,
    fundraiser: true,
    team: true,
    milestone: true,
  });

  return (
    <>
      {/* First block of the live history, copied from the about page */}
      <Section dark>
        <div className="flex flex-wrap-reverse items-center">
          <div className="basis-full pt-8 md:basis-1/2 md:pt-0 md:pr-8">
            <MayaImage className="mx-auto h-auto w-full max-w-lg lg:mr-0" />
          </div>

          <div className="basis-full md:basis-1/2 md:px-4">
            <Heading level={2} className="italic">
              Maya Higa founded Alveus in February 2021
            </Heading>
            <p>
              She is one of the top female streamers on Twitch and has amassed a
              large following on YouTube and other social platforms. She has
              experience as a licensed falconer, wildlife rehabilitator,
              zookeeper, and conservation outreach educator.
            </p>

            <Button href="/about/staff" dark className="mt-8">
              Learn more about Maya and the team at Alveus
            </Button>
          </div>
        </div>
      </Section>

      <Section className="grow">
        {/* Heading on the left, filters and Collapse all on the right */}
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Heading className="my-0">Alveus&apos; History</Heading>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div
              role="group"
              aria-label="Filter by type"
              className="flex flex-wrap items-center gap-2"
            >
              {(Object.keys(categories) as Category[]).map((key) => {
                const { label, icon: Icon } = categories[key];
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={visible[key]}
                    onClick={() =>
                      setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                    className={classes(
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700 motion-reduce:transition-none",
                      visible[key]
                        ? "border-alveus-green bg-alveus-green text-alveus-tan"
                        : "border-alveus-green-300 bg-transparent text-alveus-green-700 line-through",
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setOpen({})}
              className="text-red-600 underline transition-colors hover:text-blue-600"
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Spine, with a fill that follows the scroll position */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-5 w-1 -translate-x-1/2 overflow-clip rounded-full bg-alveus-green-200 md:left-1/2"
          >
            <div className="sticky inset-x-0 -top-1 bottom-0 mt-[-50vh] h-[calc(50vh+0.25rem)] bg-alveus-green" />
          </div>

          {historyYears.map((year) => {
            const allYearEntries = entries.filter(
              (entry) => entry.year === year,
            );
            const yearEntries = allYearEntries.filter(
              (entry) => visible[entry.category],
            );
            const sideIndex = new Map(
              yearEntries.map((entry, idx) => [entry.key, idx]),
            );
            const yearBlocks = historyBlocks.filter(
              (block) => block.year === year,
            );
            const isOpen = !!open[year];
            const panelId = `history-${year}-panel`;

            return (
              <section key={year} className="relative mb-6">
                <Heading
                  level={2}
                  id={`history-${year}`}
                  className="relative z-10 my-0 scroll-mt-4 pl-14 md:pl-0 md:text-center"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpen((prev) => ({ ...prev, [year]: !prev[year] }))
                    }
                    className="group inline-flex items-center gap-3 rounded-xl bg-alveus-tan px-4 py-2 focus-visible:outline-2 focus-visible:outline-alveus-green-700"
                  >
                    <span className="text-5xl text-alveus-green-800 tabular-nums">
                      {year}
                    </span>
                    <span className="font-sans text-base font-normal text-alveus-green-700">
                      {yearEntries.length}{" "}
                      {yearEntries.length === 1 ? "event" : "events"}
                    </span>
                    <IconChevronDown
                      className={classes(
                        "size-5 text-alveus-green-700 transition-transform motion-reduce:transition-none",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </Heading>

                <div id={panelId} hidden={!isOpen} className="pt-4">
                  {(yearEntries.length > 0 || yearBlocks.length > 0) && (
                    <ol className="flex flex-col gap-6">
                      {allYearEntries.flatMap((entry) => {
                        const block = yearBlocks.find(
                          (item) => item.afterKey === entry.key,
                        );
                        const idx = sideIndex.get(entry.key);
                        return [
                          idx !== undefined && (
                            <HistoryCard
                              key={entry.key}
                              entry={entry}
                              side={idx % 2 ? "right" : "left"}
                            />
                          ),
                          block && (
                            <HistoryVideoBlock key={block.key} block={block} />
                          ),
                        ];
                      })}
                    </ol>
                  )}
                  {yearEntries.length === 0 && (
                    <p className="mt-6 pl-14 text-alveus-green-700 md:pl-0 md:text-center">
                      No events match the current filter.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </Section>
    </>
  );
};

/* ---------- Team ---------- */

type DepartmentKey = Exclude<keyof typeof departments, "leadership">;
type DepartmentFilter = "all" | DepartmentKey;

const departmentKeys: DepartmentKey[] = [
  "operations",
  "animalCare",
  "facilities",
];

const staffEntries = Object.entries(staff);

// Some bios are components (e.g. <MayaText />), which reactToText can't see
// inside, so render simple function components to get their text
const descriptionText = (node: ReactNode): string => {
  if (
    isValidElement<Record<string, unknown>>(node) &&
    typeof node.type === "function"
  ) {
    const render = node.type as (props: Record<string, unknown>) => ReactNode;
    return descriptionText(render(node.props));
  }
  return reactToText(node);
};

// Same classes as the photo swap in components/content/People.tsx
const teamImageClasses =
  "aspect-square h-auto w-full rounded-2xl bg-alveus-green object-cover";

const bioButtonId = (key: string) => `${key}-bio-button`;

// Photo with the hover swap, copied from components/content/People.tsx;
// group-focus-within adds the swap for keyboard focus on the bio button
const TeamPhoto = ({
  person,
  swap = true,
}: {
  person: Staff;
  swap?: boolean;
}) => (
  <div className="relative aspect-square h-auto w-full overflow-clip rounded-2xl">
    {Array.isArray(person.image) ? (
      <>
        <Image
          src={person.image[1]}
          width={320}
          alt=""
          className={teamImageClasses}
        />
        <Image
          src={person.image[0]}
          width={320}
          alt=""
          className={classes(
            teamImageClasses,
            "absolute inset-x-0 top-0 drop-shadow-[0_-10px_15px_rgba(0,0,0,0.2)]",
            swap &&
              "transition-[top] duration-500 group-focus-within:top-[90%] group-focus-within:duration-1000 group-hover:top-[90%] group-hover:duration-1000 group-focus:top-[90%] group-focus:duration-1000 motion-reduce:transition-none",
          )}
        />
      </>
    ) : (
      <Image
        src={person.image}
        width={320}
        alt=""
        className={teamImageClasses}
      />
    )}

    <div className="absolute inset-0 rounded-2xl border-4 border-alveus-green/75" />
  </div>
);

// Same labels as the live team page's departments (src/data/staff.tsx),
// without the abbreviation tooltip, since the full name sits beside it
const departmentLabels: Record<keyof typeof departments, string | null> = {
  leadership: null,
  animalCare: "Animal Care (ACS)",
  facilities: "Facilities and Infrastructure (FAID)",
  operations: "Operations (OPS)",
};

const DepartmentLabel = ({ person }: { person: Staff }) =>
  departmentLabels[person.department] ? (
    <p className="font-sans text-base text-alveus-green-600 uppercase">
      {departmentLabels[person.department]}
    </p>
  ) : null;

const TeamCard = ({
  id,
  person,
  onOpen,
}: {
  id: string;
  person: Staff;
  onOpen: () => void;
}) => (
  <li id={id} className="group flex scroll-mt-4 flex-col" tabIndex={-1}>
    <div className="mx-auto w-full max-w-xs">
      <TeamPhoto person={person} />
    </div>

    <div className="flex grow flex-col pt-4">
      <Heading level={3} className="my-0 text-3xl">
        {person.name}
      </Heading>
      <Heading level={4} className="my-1 text-xl">
        {person.title}
      </Heading>
      <DepartmentLabel person={person} />

      <p className="mt-3 line-clamp-3 text-gray-500">
        {descriptionText(person.description)}
      </p>

      <button
        type="button"
        id={bioButtonId(id)}
        aria-haspopup="dialog"
        onClick={onOpen}
        className="mt-auto inline-flex items-center gap-1 self-start pt-3 text-red-600 underline transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alveus-green-700"
      >
        Read full bio<span className="sr-only"> of {person.name}</span>
        <IconArrowRight className="size-4" />
      </button>
    </div>
  </li>
);

// Same Headless UI dialog and backdrop as components/content/Lightbox.tsx
const BioDialog = ({
  openKey,
  onClose,
}: {
  openKey?: string;
  onClose: () => void;
}) => {
  const person = openKey ? staff[openKey] : undefined;

  return (
    <Dialog open={!!person} onClose={onClose} className="relative z-100">
      <DialogBackdrop className="fixed inset-0 bg-black/75" />

      <div className="fixed inset-0 overflow-y-auto p-4 md:p-8">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="w-full max-w-3xl">
            {person && (
              <Box className="p-6 md:p-8">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-3 right-3 z-20 rounded-full p-2 text-alveus-green-900 transition-colors hover:text-alveus-green-600 focus-visible:outline-2 focus-visible:outline-alveus-green-700"
                >
                  <IconX size={24} />
                </button>

                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="w-40 shrink-0 sm:w-48">
                    <TeamPhoto person={person} swap={false} />
                  </div>
                  <div className="pr-8">
                    <DialogTitle
                      as="h3"
                      className="font-serif text-3xl font-bold md:text-4xl"
                    >
                      {person.name}
                    </DialogTitle>
                    <Heading level={4} className="my-1 text-xl">
                      {person.title}
                    </Heading>
                    <DepartmentLabel person={person} />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 text-gray-500">
                  {person.description}
                </div>
              </Box>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

const TeamView = ({ initialOpen }: { initialOpen?: string }) => {
  const [department, setDepartment] = useState<DepartmentFilter>("all");
  const [open, setOpen] = useState<string | undefined>(initialOpen);

  // Deep link: bring the card behind the dialog into view
  useEffect(() => {
    if (!initialOpen) return;
    document.getElementById(initialOpen)?.scrollIntoView({ block: "center" });
  }, [initialOpen]);

  const openBio = useCallback((key: string) => {
    setOpen(key);
    window.history.replaceState(null, "", `#${key}`);
  }, []);

  const closeBio = useCallback(() => {
    const key = open;
    setOpen(undefined);
    window.history.replaceState(null, "", "#team");
    // Return focus to the card's button (also after a deep link, when
    // nothing had focus before the dialog opened)
    if (key) {
      requestAnimationFrame(() =>
        document.getElementById(bioButtonId(key))?.focus(),
      );
    }
  }, [open]);

  const filtered = staffEntries.filter(
    ([, person]) => department === "all" || person.department === department,
  );

  return (
    <>
      <Section dark className="py-12">
        <Heading className="my-0">Alveus Team</Heading>
      </Section>

      <Section className="grow">
        <Heading level={2} id="staff" className="mt-0">
          Alveus Staff
        </Heading>
        <p className="max-w-3xl text-lg">
          The staff at Alveus all work at our facility in Texas, providing care
          to our animal ambassadors on a daily basis, cleaning enclosures and
          maintaining the property, and ensuring we can provide the best online
          education experience for livestream viewers.
        </p>

        <div
          role="group"
          aria-label="Filter by department"
          className="mt-6 mb-10 flex flex-wrap items-center border-b border-alveus-green-200"
        >
          {(["all", ...departmentKeys] as const).map((key, idx) => {
            const count = staffEntries.filter(
              ([, person]) => key === "all" || person.department === key,
            ).length;
            return (
              <span key={key} className="flex items-center">
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-px bg-alveus-green-300"
                  />
                )}
                <button
                  type="button"
                  aria-pressed={department === key}
                  onClick={() => setDepartment(key)}
                  className={underlineTabClassName(department === key)}
                >
                  {key === "all" ? "All" : departmentLabels[key]}{" "}
                  <span className="font-sans text-sm text-alveus-green-600">
                    ({count})
                  </span>
                </button>
              </span>
            );
          })}
        </div>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(([key, person]) => (
            <TeamCard
              key={key}
              id={key}
              person={person}
              onOpen={() => openBio(key)}
            />
          ))}
        </ul>

        <BioDialog openKey={open} onClose={closeBio} />
      </Section>
    </>
  );
};

/* ---------- Page ---------- */

const AboutMockupPage: NextPage = () => {
  const [view, setView] = useState(0);
  const [deepLink, setDeepLink] = useState<string>();

  // #kayla style links open that bio on the team view
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash in staff) {
      setView(1);
      setDeepLink(hash);
    } else if (hash === "team") {
      setView(1);
    }
  }, []);

  return (
    <>
      <Meta
        title="About | Mockup"
        description="Design mockup of the about and team pages."
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <MockupNotice>
        Text comes from the live about and team pages.
      </MockupNotice>

      <ViewTabs
        label="About views"
        selected={view}
        onChange={setView}
        tabs={[
          { key: "history", label: "History", content: <HistoryView /> },
          {
            key: "team",
            label: "Team",
            content: <TeamView key={deepLink} initialOpen={deepLink} />,
          },
        ]}
      />
    </>
  );
};

export default AboutMockupPage;
