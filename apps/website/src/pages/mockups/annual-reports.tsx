import { type NextPage } from "next";
import { type ReactNode } from "react";

import { getReport, reportYears } from "@/data/annual-reports";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import MockupNotice from "@/components/mockups/MockupNotice";

import IconDownload from "@/icons/IconDownload";

type KeyStats = {
  summary: ReactNode | null;
  income: string;
  expenses: string;
  net: string;
  // Where the money figures come from, when not the report itself
  source?: string;
  reach: { value: string; label: string } | null;
};

// Figures from each report page (rounded to the nearest dollar). The 2021
// report has no total income or net income, so 2021 uses Part I of its 990.
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
    // The 2022 report has no summary sentence
    summary: null,
    income: "$300,067",
    expenses: "$285,839",
    net: "$14,228",
    reach: { value: "50.3M", label: "minutes watched" },
  },
  2021: {
    summary:
      "In 2021, the majority (67.30%) of funds were dedicated to development of the facility.",
    income: "$763,380",
    expenses: "$156,899",
    net: "$606,481",
    source: "Form 990",
    reach: null,
  },
};

const reports = reportYears.map((year) => ({
  year,
  filing: getReport(year).filing,
  ...stats[year]!,
}));

const LatestBadge = () => (
  <span className="rounded-md bg-alveus-green px-2 py-0.5 font-sans text-sm font-semibold text-alveus-tan">
    Latest
  </span>
);

const NotAvailable = ({ what }: { what: string }) => (
  <span className="text-alveus-green-600">
    n/a<span className="sr-only"> ({what})</span>
  </span>
);

const Source = ({ source }: { source?: string }) =>
  source ? (
    <span className="block text-sm text-alveus-green-700">per {source}</span>
  ) : null;

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
      <Heading
        level={2}
        className="mt-0 mb-6 border-b border-alveus-green-200 pb-2 text-3xl"
      >
        All reports
      </Heading>

      <div className="relative overflow-x-auto rounded-2xl border border-alveus-green-200 bg-alveus-tan-50">
        <table className="w-full min-w-4xl text-left">
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
                <td className="max-w-xs p-4">
                  {report.summary ?? (
                    <NotAvailable what="no summary in this report" />
                  )}
                </td>
                <td className="p-4 text-right tabular-nums">
                  {report.income}
                  <Source source={report.source} />
                </td>
                <td className="p-4 text-right tabular-nums">
                  {report.expenses}
                  <Source source={report.source} />
                </td>
                <td className="p-4 text-right tabular-nums">
                  {report.net}
                  <Source source={report.source} />
                </td>
                <td className="p-4">
                  {report.reach ? (
                    <>
                      <span className="tabular-nums">{report.reach.value}</span>
                      <span className="block text-sm text-alveus-green-700">
                        {report.reach.label}
                      </span>
                    </>
                  ) : (
                    <NotAvailable what="not in this report" />
                  )}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <ul className="flex flex-col gap-2">
                    <li>
                      <Link href={`/about/annual-reports/${report.year}`}>
                        Read report
                        <span className="sr-only"> for {report.year}</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={report.filing}
                        download={`alveus-sanctuary-990-${report.year}.pdf`}
                        className="inline-flex items-center gap-1"
                      >
                        Download {report.year} 990 Filing
                        <IconDownload size={16} />
                      </Link>
                    </li>
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  </>
);

export default AnnualReportsMockupPage;
