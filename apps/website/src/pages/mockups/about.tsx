import { type NextPage } from "next";
import Image from "next/image";
import {
  type ComponentType,
  type ReactNode,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import reactToText from "react-to-text";

import { env } from "@/env";

import staff, { type Staff } from "@/data/staff";

import { classes } from "@/utils/classes";
import { formatPartialDateString } from "@/utils/datetime-partial";

import Heading from "@/components/content/Heading";
import InPageNav from "@/components/content/InPageNav";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import {
  StreamEmbed,
  StreamPreview,
  getStreamUrlIframe,
} from "@/components/content/Stream";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";
import MockupNotice from "@/components/mockups/MockupNotice";
import ViewTabs, { underlineTabClassName } from "@/components/mockups/ViewTabs";

import { type IconProps } from "@/icons/BaseIcon";
import IconArrowRight from "@/icons/IconArrowRight";
import IconBolt from "@/icons/IconBolt";
import IconBox from "@/icons/IconBox";
import IconChevronDown from "@/icons/IconChevronDown";
import IconDollar from "@/icons/IconDollar";
import IconUserGroup from "@/icons/IconUserGroup";

import { history, news } from "@/pages/about";

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
  })
  .reverse();

type Entry = (typeof entries)[number];

const historyYears = [...new Set(entries.map((entry) => entry.year))];

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
  const [open, setOpen] = useState<Record<string, boolean>>({
    [historyYears[0]!]: true,
  });
  const [visible, setVisible] = useState<Record<Category, boolean>>({
    build: true,
    fundraiser: true,
    team: true,
    milestone: true,
  });

  const openYear = useCallback((id: string) => {
    const year = id.replace("history-", "");
    setOpen((prev) => ({ ...prev, [year]: true }));
  }, []);

  return (
    <>
      <Section dark className="py-12">
        <Heading className="my-0">Alveus&apos; History</Heading>
      </Section>

      <InPageNav
        label="History years"
        items={historyYears.map((year) => ({
          id: `history-${year}`,
          label: year,
        }))}
        onNavigate={openYear}
      />

      <Section className="grow">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
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

        <div className="relative mx-auto max-w-6xl">
          {/* Spine, with a fill that follows the scroll position */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-5 w-1 -translate-x-1/2 overflow-clip rounded-full bg-alveus-green-200 md:left-1/2"
          >
            <div className="sticky inset-x-0 -top-1 bottom-0 mt-[-50vh] h-[calc(50vh+0.25rem)] bg-alveus-green" />
          </div>

          {historyYears.map((year) => {
            const yearEntries = entries.filter(
              (entry) => entry.year === year && visible[entry.category],
            );
            const isOpen = !!open[year];
            const panelId = `history-${year}-panel`;

            return (
              <section key={year} className="relative mb-6">
                <Heading
                  level={2}
                  id={`history-${year}`}
                  className="relative z-10 my-0 scroll-mt-20 pl-14 md:pl-0 md:text-center"
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
                  {yearEntries.length ? (
                    <ol className="flex flex-col gap-6">
                      {yearEntries.map((entry, idx) => (
                        <HistoryCard
                          key={entry.key}
                          entry={entry}
                          side={idx % 2 ? "right" : "left"}
                        />
                      ))}
                    </ol>
                  ) : (
                    <p className="pl-14 text-alveus-green-700 md:pl-0 md:text-center">
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

/* ---------- In the news ---------- */

type NewsItem = (typeof news)[string];

const newsType = (item: NewsItem) =>
  !("video" in item)
    ? "Article"
    : item.video.type === "youtube"
      ? "Feature"
      : "Video";

const NewsView = () => {
  const [lightboxOpen, setLightboxOpen] = useState<string>();
  const lightboxItems = useMemo(
    () =>
      Object.entries(news).reduce<Record<string, ReactNode>>(
        (acc, [key, item]) => {
          if (!("video" in item)) return acc;
          return {
            ...acc,
            [key]:
              item.video.type === "stream" ? (
                <StreamEmbed src={item.video} caption={item.title} controls />
              ) : (
                <YouTubeEmbed videoId={item.video.id} caption={item.title} />
              ),
          };
        },
        {},
      ),
    [],
  );

  return (
    <>
      <Section dark className="py-12">
        <Heading className="my-0">In The News</Heading>
      </Section>

      <Section className="grow bg-alveus-green-100">
        <ul className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(news).map(([key, item]) => {
            const type = newsType(item);
            const videoHref =
              "video" in item
                ? item.video.type === "stream"
                  ? getStreamUrlIframe(item.video, {
                      title: `Alveus Sanctuary: ${item.title}`,
                      link: `${env.NEXT_PUBLIC_BASE_URL}/about#news`,
                    })
                  : `https://www.youtube.com/watch?v=${encodeURIComponent(item.video.id)}`
                : null;

            return (
              <li
                key={key}
                className="flex flex-col overflow-hidden rounded-xl border border-alveus-green-200 bg-alveus-tan-50"
              >
                <div className="relative aspect-video overflow-hidden bg-alveus-green-800">
                  {"video" in item ? (
                    <Link
                      href={videoHref!}
                      external
                      custom
                      onClick={(e) => {
                        e.preventDefault();
                        setLightboxOpen(key);
                      }}
                      className="group/trigger block size-full"
                    >
                      {item.video.type === "stream" ? (
                        <StreamPreview
                          src={item.video}
                          alt={item.title}
                          className="size-full rounded-none object-cover"
                        />
                      ) : (
                        <YouTubePreview
                          videoId={item.video.id}
                          alt={item.title}
                          className="aspect-video size-full object-cover"
                        />
                      )}
                    </Link>
                  ) : (
                    <Link
                      href={item.href}
                      external
                      custom
                      className="flex size-full items-center justify-center p-8"
                    >
                      <Image
                        src={item.logo}
                        alt={item.title}
                        width={480}
                        className="h-12 w-auto max-w-full object-contain"
                      />
                    </Link>
                  )}
                  <span className="pointer-events-none absolute top-3 left-3 rounded-md bg-alveus-tan px-2 py-0.5 text-sm font-semibold text-alveus-green-900">
                    {type}
                  </span>
                </div>

                <div className="flex grow flex-col gap-2 p-5">
                  <Heading level={2} className="my-0 text-2xl">
                    {item.title}
                  </Heading>
                  {item.quote && (
                    <blockquote className="text-lg text-alveus-green-800 italic">
                      {item.quote}
                    </blockquote>
                  )}
                  {item.href && (
                    <Link href={item.href} external className="mt-auto pt-2">
                      {type === "Article" ? "Read the article" : "View source"}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <Lightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(undefined)}
          items={lightboxItems}
        />
      </Section>
    </>
  );
};

/* ---------- Team ---------- */

type Department = "all" | "operations" | "animalCare" | "facilities";

const departmentLabels: Record<Exclude<Department, "all">, string> = {
  operations: "Operations",
  animalCare: "Animal Care",
  facilities: "Facilities and Infrastructure",
};

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

const TeamCard = ({
  id,
  person,
  open,
  onToggle,
}: {
  id: string;
  person: Staff;
  open: boolean;
  onToggle: () => void;
}) => {
  const text = descriptionText(person.description);
  const hasMore = text.length > 120;
  const department =
    person.department !== "leadership"
      ? departmentLabels[person.department]
      : null;
  const bioId = `${id}-bio`;

  return (
    <li
      id={id}
      data-team-card
      className={classes(
        "group flex scroll-mt-20 flex-col gap-3 rounded-xl border bg-alveus-tan-50 p-4",
        open
          ? "col-span-full border-alveus-green md:grid md:grid-cols-[16rem_minmax(0,1fr)] md:gap-x-8"
          : "border-alveus-green-200",
      )}
      tabIndex={-1}
    >
      {/* Photo swap copied from components/content/People.tsx; group-focus-within adds keyboard focus */}
      <div
        className={classes(
          "relative aspect-square h-auto w-full self-start overflow-clip rounded-2xl",
          open && "md:row-span-6",
        )}
      >
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
                "absolute inset-x-0 top-0 drop-shadow-[0_-10px_15px_rgba(0,0,0,0.2)] transition-[top] duration-500 group-focus-within:top-[90%] group-focus-within:duration-1000 group-hover:top-[90%] group-hover:duration-1000 group-focus:top-[90%] group-focus:duration-1000 motion-reduce:transition-none",
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
      <div>
        <Heading level={3} className="my-0 text-2xl">
          {person.name}
        </Heading>
        <p className="font-semibold">{person.title}</p>
        {department && (
          <p className="text-sm tracking-wide text-alveus-green-600 uppercase">
            {department}
          </p>
        )}
      </div>

      {open ? (
        <div id={bioId} className="flex flex-col gap-3 text-lg">
          {person.description}
        </div>
      ) : (
        <p className="line-clamp-2 text-alveus-green-800">{text}</p>
      )}

      {hasMore && (
        <button
          type="button"
          data-bio-toggle
          aria-expanded={open}
          aria-controls={open ? bioId : undefined}
          onClick={onToggle}
          className="mt-auto inline-flex items-center gap-1 self-start text-red-600 underline transition-colors hover:text-blue-600"
        >
          {open ? "Show less" : "Read full bio"}
          <IconChevronDown
            className={classes("size-4", open && "rotate-180")}
          />
        </button>
      )}
    </li>
  );
};

const TeamView = ({ initialOpen }: { initialOpen?: string }) => {
  const [department, setDepartment] = useState<Department>("all");
  const [open, setOpen] = useState<string | undefined>(initialOpen);

  // Deep link: scroll the opened card into view
  useEffect(() => {
    if (!initialOpen) return;
    document.getElementById(initialOpen)?.scrollIntoView({ block: "start" });
  }, [initialOpen]);

  // Close on Escape or a click outside the open card
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(undefined);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      // Bio toggles handle themselves (opening one closes the previous)
      if (target.closest("[data-bio-toggle]")) return;
      const card = document.getElementById(open);
      if (card && !card.contains(target)) setOpen(undefined);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
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
          className="mt-6 mb-8 flex flex-wrap items-center border-b border-alveus-green-200"
        >
          {(["all", "operations", "animalCare", "facilities"] as const).map(
            (key, idx) => {
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
                    onClick={() => {
                      setDepartment(key);
                      setOpen(undefined);
                    }}
                    className={underlineTabClassName(department === key)}
                  >
                    {key === "all" ? "All" : departmentLabels[key]}{" "}
                    <span className="font-sans text-sm text-alveus-green-600">
                      ({count})
                    </span>
                  </button>
                </span>
              );
            },
          )}
        </div>

        <ul className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(([key, person]) => (
            <TeamCard
              key={key}
              id={key}
              person={person}
              open={open === key}
              onToggle={() =>
                setOpen((prev) => (prev === key ? undefined : key))
              }
            />
          ))}
        </ul>
      </Section>
    </>
  );
};

/* ---------- Page ---------- */

const AboutMockupPage: NextPage = () => {
  const [view, setView] = useState(0);
  const [deepLink, setDeepLink] = useState<string>();

  // #kayla style links open that bio on the team view, #news opens the news view
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash in staff) {
      setView(2);
      setDeepLink(hash);
    } else if (hash === "news") {
      setView(1);
    } else if (hash === "team") {
      setView(2);
    }
  }, []);

  return (
    <>
      <Meta
        title="About | Mockup"
        description="Design mockup of the about, in the news and team pages."
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
          { key: "news", label: "In The News", content: <NewsView /> },
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
