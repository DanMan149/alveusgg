import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { type NextPage } from "next";
import { Fragment, type ReactNode } from "react";

import { reportYears } from "@/data/annual-reports";

import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import MockupNotice from "@/components/mockups/MockupNotice";
import { underlineTabClassName } from "@/components/mockups/ViewTabs";

import IconArrowRight from "@/icons/IconArrowRight";
import IconDocument from "@/icons/IconDocument";

type KeyStats = {
  summary: ReactNode;
  income: string;
  expenses: string;
  net: string | null;
  reach: { value: string; label: string } | null;
};

// Figures from each report page (rounded to the nearest dollar)
const stats: Record<number, KeyStats> = {
  2024: {
    summary:
      "Alveus hosted over 30 content creators for collaborations that reached millions of people around the world.",
    income: "$1,592,716",
    expenses: "$901,591",
    net: "$691,126",
    reach: { value: "Over 100M", label: "people reached across all platforms" },
  },
  2023: {
    summary:
      "We also hosted 20 content collaborations with creators from across the United States.",
    income: "$891,597",
    expenses: "$570,027",
    net: "$321,570",
    reach: { value: "319M", label: "minutes watched on Twitch" },
  },
  2022: {
    summary: (
      <span className="rounded-sm bg-yellow-200 px-1">
        Placeholder summary: the 2022 report has no summary sentence.
      </span>
    ),
    income: "$300,067",
    expenses: "$285,839",
    net: "$14,228",
    reach: { value: "50.3M", label: "minutes watched" },
  },
  2021: {
    summary:
      "In 2021, the majority (67.30%) of funds were dedicated to development of the facility.",
    income: "$763,380",
    expenses: "$144,412",
    net: null,
    reach: null,
  },
};

// PLACEHOLDER: replace with the real Form 990 URL once supplied
const form990PlaceholderUrl = "#form-990-placeholder";

const reports = reportYears.map((year) => ({
  year,
  ...stats[year]!,
}));

const LatestBadge = () => (
  <span className="rounded-md bg-alveus-green px-2 py-0.5 font-sans text-sm font-semibold text-alveus-tan">
    Latest
  </span>
);

const NotAvailable = () => (
  <span className="text-alveus-green-600">
    n/a<span className="sr-only"> (not in this report)</span>
  </span>
);

const AnnualReportsMockupPage: NextPage = () => (
  <>
    <Meta
      title="Annual Reports | Mockup"
      description="Design mockup of the annual reports page."
      noindex
    />

    {/* Nav background */}
    <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

    <MockupNotice />

    <Section dark>
      <Heading>Annual Reports</Heading>
      <p>
        Each year we publish a report that covers key stats on the growth and
        current status of Alveus, the impact we&apos;ve made toward our
        continued mission, and an in-depth breakdown of the financials behind
        the sanctuary.
      </p>
    </Section>

    <Section className="grow">
      <div className="mb-10 flex flex-col gap-4 rounded-xl border border-alveus-green-200 border-l-alveus-green bg-alveus-tan-50 p-5 md:flex-row md:items-center md:justify-between md:border-l-8">
        <div>
          <Heading level={2} className="my-0 text-2xl">
            Form 990
          </Heading>
          <p className="mt-1">
            <span className="rounded-sm bg-yellow-200 px-1 text-sm">
              Placeholder link: the real Form 990 URL is still to be supplied.
            </span>
          </p>
        </div>
        <Button
          href={form990PlaceholderUrl}
          filled
          className="inline-flex shrink-0 items-center gap-2"
        >
          <IconDocument className="size-5" />
          View our Form 990
        </Button>
      </div>

      <TabGroup>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-alveus-green-200">
          <Heading level={2} className="my-0 pb-2 text-3xl">
            All reports
          </Heading>
          <TabList aria-label="Layout" className="flex items-center">
            {["Cards", "Table"].map((label, idx) => (
              <Fragment key={label}>
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-px bg-alveus-green-300"
                  />
                )}
                <Tab
                  className={({ selected }) => underlineTabClassName(selected)}
                >
                  {label}
                </Tab>
              </Fragment>
            ))}
          </TabList>
        </div>

        <TabPanels>
          <TabPanel className="focus:outline-none">
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {reports.map((report, idx) => (
                <li
                  key={report.year}
                  className={
                    idx === 0
                      ? "flex flex-col gap-4 rounded-2xl border-2 border-alveus-green bg-alveus-tan-50 p-5"
                      : "flex flex-col gap-4 rounded-2xl border border-alveus-green-200 bg-alveus-tan-50 p-5"
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <Heading
                      level={3}
                      className="my-0 text-5xl text-alveus-green-800 tabular-nums"
                    >
                      {report.year}
                    </Heading>
                    {idx === 0 && <LatestBadge />}
                  </div>

                  <p>{report.summary}</p>

                  <dl className="divide-y divide-alveus-green-200 border-y border-alveus-green-200">
                    <div className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="text-sm text-alveus-green-700">
                        {report.year === 2021
                          ? "Total raised (donations)"
                          : "Total income"}
                      </dt>
                      <dd className="font-serif text-xl font-bold tabular-nums">
                        {report.income}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="text-sm text-alveus-green-700">
                        Net income
                      </dt>
                      <dd className="font-serif text-xl font-bold tabular-nums">
                        {report.net ?? <NotAvailable />}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="text-sm text-alveus-green-700">
                        Reach
                        {report.reach && (
                          <span className="block">{report.reach.label}</span>
                        )}
                      </dt>
                      <dd className="font-serif text-xl font-bold tabular-nums">
                        {report.reach?.value ?? <NotAvailable />}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/about/annual-reports/${report.year}`}
                    className="mt-auto inline-flex items-center gap-1 text-lg"
                  >
                    Read report
                    <span className="sr-only"> for {report.year}</span>
                    <IconArrowRight className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </TabPanel>

          <TabPanel className="focus:outline-none">
            <div className="overflow-x-auto rounded-2xl border border-alveus-green-200 bg-alveus-tan-50">
              <table className="w-full min-w-3xl text-left">
                <caption className="sr-only">
                  Key stats from each annual report
                </caption>
                <thead className="bg-alveus-green-100 text-sm text-alveus-green-800">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Year
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Summary
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Total income
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Expenses
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Net income
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Reach
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <span className="sr-only">Links</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-alveus-green-200">
                  {reports.map((report, idx) => (
                    <tr key={report.year} className="align-top">
                      <th
                        scope="row"
                        className="p-4 font-serif text-2xl text-alveus-green-800 tabular-nums"
                      >
                        <span className="flex flex-col items-start gap-1">
                          {report.year}
                          {idx === 0 && <LatestBadge />}
                        </span>
                      </th>
                      <td className="max-w-xs p-4">{report.summary}</td>
                      <td className="p-4 text-right tabular-nums">
                        {report.income}
                        {report.year === 2021 && (
                          <span className="block text-sm text-alveus-green-700">
                            donations
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right tabular-nums">
                        {report.expenses}
                        {report.year === 2022 && "*"}
                      </td>
                      <td className="p-4 text-right tabular-nums">
                        {report.net ?? <NotAvailable />}
                      </td>
                      <td className="p-4">
                        {report.reach ? (
                          <>
                            <span className="tabular-nums">
                              {report.reach.value}
                            </span>
                            <span className="block text-sm text-alveus-green-700">
                              {report.reach.label}
                            </span>
                          </>
                        ) : (
                          <NotAvailable />
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <Link href={`/about/annual-reports/${report.year}`}>
                          Read report
                          <span className="sr-only"> for {report.year}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <p className="mt-6 max-w-4xl text-sm text-alveus-green-700">
        Figures are taken from each report and rounded to the nearest dollar.
        The 2021 report lists donations raised rather than total income, and has
        no net income or reach figure. * 2022 expenses are total income minus
        net income, which matches the Total Expenses line in the report. Reach
        uses a different measure each year because the reports do.
      </p>
    </Section>
  </>
);

export default AnnualReportsMockupPage;
