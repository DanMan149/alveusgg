import { type NextPage } from "next";
import { type ReactNode, useCallback, useMemo, useState } from "react";

import events, { type Event } from "@/data/events";

import { classes } from "@/utils/classes";
import { formatDateTime } from "@/utils/datetime";
import { convertToSlug } from "@/utils/slugs";

import useGrouped, { type GroupedItems, type Options } from "@/hooks/grouped";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import InPageNav from "@/components/content/InPageNav";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Select from "@/components/content/Select";
import ImagePlaceholder from "@/components/mockups/ImagePlaceholder";
import MockupNotice from "@/components/mockups/MockupNotice";

import IconArrowRight from "@/icons/IconArrowRight";

// Link that becomes a feature card inside the event instead of inline text
const donorTreesLink = "/about/events/donor-trees";

// Same text as the live page, with two changes:
// - Art Auction 2024: no links on Chips and Nilla (no longer ambassadors)
// - Fund-a-thon 2021: the donor trees link moves into a feature card
const infoOverrides: Record<string, ReactNode> = {
  "art-auction-2024": (
    <>
      <p>
        Hosted in the Session Yard at Alveus once again, the annual Art Auction
        returned and was a great success. 35 unique paintings created by the
        ambassadors and the staff at the sanctuary were up for auction, with
        livestream viewers able to bid on them. Viewers could also participate
        in the fundraising by donating $25 or more to receive a signed postcard
        as a memento of the event -- by the end of the 4-hour-long event, 499
        postcards were sent out to donors.
      </p>
      <p>
        Maya was the most successful artist this year, with her two paintings
        raising a total of $2,666. Our most successful ambassador artists though
        were Chips and Nilla, our rats, who raised $2,500 with their two
        paintings. In total, we were able to raise $44,181 for Alveus Sanctuary
        during the event. Thank you to everyone who watched and supported this
        event!
      </p>
    </>
  ),
  "fund-a-thon-2021": (
    <p>
      The event that started it all! A 20-hour-long mega-stream with a bunch of
      donation goals along the way, aiming to raise as much money as possible to
      kick-start Alveus. Each donor that donated $100 or more got their name
      engraved on a golden leaf that form part of six donor trees now affixed to
      the walls of the Emu enclosure. The final goal for the stream was that at
      $500k raised Maya would shave her head, and we were able to reach that
      goal with $573,004 raised for Alveus over the whole stream. Thank you to
      all the leafers, everyone that donated and everyone that watched!
    </p>
  ),
};

const parseAmount = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

const isPostcardStat = (title: string) => /postcard/i.test(title);

const getType = (event: Event) => event.name.replace(/\s+\d{4}$/, "");

// Leaderboard figures, taken from the text of each art auction
const leaderboards: Record<
  string,
  { pieces?: [string, string][]; donors?: [string, string][] }
> = {
  "art-auction-2026": {
    pieces: [
      ["Painting of a serval by Maya, won by Emiru", "$30,000"],
      ["Winnie's two paintings", "$5,500"],
      ["Painting of Stompy by ipaintbirbs", "$3,666"],
      ["Lukas' painting of Push Pop", "$3,500"],
      ["Tico and Miley's joint painting", "$2,501"],
    ],
    donors: [
      ["Emiru", "$30,000"],
      ["crownedeye", "$7,111"],
      ["sarahnova__", "$6,750"],
      ["dnomaids", "$3,150"],
      ["brokenrobotart", "$3,000"],
    ],
  },
  "art-auction-2025": {
    pieces: [
      ["Stompy's painting and foot casting", "Over $12,000"],
      ["Top painting, by Maya", "$11,111"],
    ],
  },
  "art-auction-2024": {
    pieces: [
      ["Maya's two paintings", "$2,666"],
      ["Chips and Nilla's two paintings", "$2,500"],
    ],
  },
  "art-auction-2023": {
    pieces: [["Georgie's four paintings", "$4,225"]],
  },
};

const summary = {
  raised: events.reduce(
    (sum, event) =>
      sum +
      (event.stats.totalDonations
        ? parseAmount(event.stats.totalDonations.stat)
        : 0),
    0,
  ),
  count: events.length,
  postcards: events.reduce(
    (sum, event) =>
      sum +
      Object.values(event.stats)
        .filter((stat) => isPostcardStat(stat.title))
        .reduce((acc, stat) => acc + parseAmount(stat.stat), 0),
    0,
  ),
};

const groupBy = (items: Event[], key: (event: Event) => string) =>
  items.reduce<GroupedItems<Event>>((map, event) => {
    const name = key(event);
    const group = convertToSlug(name);
    map.set(group, {
      name,
      items: [...(map.get(group)?.items || []), event],
    });
    return map;
  }, new Map());

const sortByOptions = {
  newest: {
    label: "Newest first",
    sort: (items) =>
      groupBy(items, (event) => event.date.getUTCFullYear().toString()),
  },
  type: {
    label: "Event type",
    sort: (items) => groupBy(items, getType),
  },
} as const satisfies Options<Event>;

const Leaderboard = ({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) => (
  <div>
    <Heading level={4} className="my-0 mb-2 text-lg">
      {title}
    </Heading>
    <ol className="divide-y divide-alveus-green-200">
      {items.map(([name, amount], idx) => (
        <li key={name} className="flex items-baseline gap-3 py-1.5">
          <span className="w-4 shrink-0 text-right text-sm text-alveus-green-600 tabular-nums">
            {idx + 1}
          </span>
          <span className="grow">{name}</span>
          <span className="shrink-0 font-semibold tabular-nums">{amount}</span>
        </li>
      ))}
    </ol>
  </div>
);

const EventCard = ({
  event,
  expanded,
  onToggle,
}: {
  event: Event;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const info = infoOverrides[event.slug] ?? event.info;
  const board = leaderboards[event.slug];
  const descriptionId = `${event.slug}-description`;

  return (
    <article
      id={event.slug}
      className="scroll-mt-20 rounded-2xl border border-alveus-green-200 bg-alveus-tan-50 p-4 md:p-6"
    >
      <div className="grid gap-6 md:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <ImagePlaceholder
          label="Image placeholder: event photo"
          className="aspect-4/3 w-full"
        />

        <div className="flex min-w-0 flex-col gap-2">
          <Heading level={3} className="my-0 text-3xl">
            {event.name}
          </Heading>
          <p className="text-alveus-green-700">
            {formatDateTime(event.date, { style: "long" })}
          </p>

          <div
            id={descriptionId}
            className={classes(
              "mt-1 flex flex-col gap-3 text-alveus-green-900",
              !expanded && "[&>p:first-child]:line-clamp-2 [&>p~p]:hidden",
            )}
          >
            {info}
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={descriptionId}
            className="self-start text-red-600 underline transition-colors hover:text-blue-600"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        </div>

        <dl className="grid grid-cols-2 content-start gap-2 md:col-span-2 md:grid-cols-4 xl:col-span-1 xl:grid-cols-2">
          {Object.entries(event.stats).map(([key, stat]) => (
            <div
              key={key}
              className="flex flex-col-reverse justify-end rounded-lg bg-alveus-green-100 px-3 py-2"
            >
              <dt className="text-sm text-balance text-alveus-green-700">
                {stat.title}
              </dt>
              <dd
                className={classes(
                  "font-serif text-2xl font-bold tabular-nums",
                  key === "totalDonations" && "text-red-700",
                )}
              >
                {stat.stat}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {board && (
        <div
          className={classes(
            "mt-6 grid gap-6 border-t border-alveus-green-200 pt-4",
            board.pieces && board.donors && "md:grid-cols-2",
          )}
        >
          {board.pieces && (
            <Leaderboard title="Top pieces" items={board.pieces} />
          )}
          {board.donors && (
            <Leaderboard title="Top donors" items={board.donors} />
          )}
        </div>
      )}

      {event.slug === "fund-a-thon-2021" && (
        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-alveus-green p-4 text-alveus-tan md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <Heading level={4} className="my-0 text-2xl">
              Donor trees
            </Heading>
            <p className="mt-1 max-w-2xl">
              Each donor that donated $100 or more got their name engraved on a
              golden leaf that form part of six donor trees now affixed to the
              walls of the Emu enclosure.
            </p>
          </div>
          <Button
            href={donorTreesLink}
            dark
            className="inline-flex shrink-0 items-center gap-2"
          >
            Find your name on the donor trees
            <IconArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </article>
  );
};

const EventsMockupPage: NextPage = () => {
  const { option, result, update, dropdown } = useGrouped({
    items: events,
    options: sortByOptions,
    initial: "newest",
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const allExpanded = events.every((event) => expanded[event.slug]);
  const toggleAll = useCallback(() => {
    setExpanded(
      allExpanded
        ? {}
        : Object.fromEntries(events.map((event) => [event.slug, true])),
    );
  }, [allExpanded]);

  const navItems = useMemo(
    () =>
      [...result.entries()].map(([key, value]) => ({
        id: `${option}:${key}`,
        label: value.name,
      })),
    [result, option],
  );

  return (
    <>
      <Meta
        title="Events | Mockup"
        description="Design mockup of the events page."
        noindex
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <MockupNotice>Text and stats are from the live events page.</MockupNotice>

      <Section dark className="py-16">
        <div className="w-full lg:w-3/5">
          <Heading>Our Events</Heading>
          <p className="text-lg">
            We host one-off fundraising events to increase awareness of our
            conservation missions and to encourage donations to support Alveus.
          </p>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Raised across all events",
              value: `$${summary.raised.toLocaleString("en-US")}`,
            },
            {
              title: "Events hosted",
              value: summary.count.toLocaleString("en-US"),
            },
            {
              title: "Signed postcards sent to donors*",
              value: summary.postcards.toLocaleString("en-US"),
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className="flex flex-col-reverse rounded-xl bg-alveus-green-800 px-5 py-4"
            >
              <dt className="text-alveus-green-100">{stat.title}</dt>
              <dd className="font-serif text-4xl font-bold tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-alveus-green-100">
          * Signed postcards only. Signed prints, carnival tickets and polaroids
          are not included.
        </p>
      </Section>

      <InPageNav
        items={navItems}
        label={option === "newest" ? "Event years" : "Event types"}
      >
        <button
          type="button"
          onClick={toggleAll}
          className="text-red-600 underline transition-colors hover:text-blue-600"
        >
          {allExpanded ? "Collapse all text" : "Expand all text"}
        </button>
        <Select
          options={dropdown}
          value={option}
          onChange={(val) => update(val, null)}
          label={<span className="sr-only">Sort by</span>}
          align="right"
          className="mt-0 min-w-44"
        />
      </InPageNav>

      <Section className="grow pt-8">
        {[...result.entries()].map(([key, group], idx) => {
          const raised = group.items.reduce(
            (sum, event) =>
              sum +
              (event.stats.totalDonations
                ? parseAmount(event.stats.totalDonations.stat)
                : 0),
            0,
          );

          return (
            <section
              key={key}
              aria-labelledby={`${option}:${key}`}
              className={idx > 0 ? "mt-16" : undefined}
            >
              <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b-2 border-alveus-green-300/25 pb-2">
                <Heading
                  level={2}
                  id={`${option}:${key}`}
                  className="my-0 scroll-mt-20 text-4xl text-alveus-green-800"
                >
                  {group.name}
                </Heading>
                <p className="text-alveus-green-700">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "event" : "events"}
                  {raised > 0 && (
                    <>{` · $${raised.toLocaleString("en-US")} raised`}</>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {group.items.map((event) => (
                  <EventCard
                    key={event.slug}
                    event={event}
                    expanded={!!expanded[event.slug]}
                    onToggle={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [event.slug]: !prev[event.slug],
                      }))
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </Section>
    </>
  );
};

export default EventsMockupPage;
