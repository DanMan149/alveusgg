import { type NextPage } from "next";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

const mockups = [
  {
    href: "/mockups/navigation-and-cards",
    title: "Navigation and cards",
    description:
      "Shared in-page nav with dividers, home page featured ambassador modes, and How to Help cards.",
  },
  {
    href: "/mockups/ambassadors",
    title: "Ambassadors",
    description:
      "Ambassador grid with Did you know? previews, and a fuller ambassador page.",
  },
  {
    href: "/mockups/pixels-two",
    title: "Pixel Project 2",
    description:
      "Counter above the mural, split blocks, two-column leaderboard and help tabs.",
  },
  {
    href: "/mockups/about",
    title: "About",
    description:
      "History timeline with year nav and filters, In The News frames, and team cards with inline bios.",
  },
  {
    href: "/mockups/annual-reports",
    title: "Annual reports",
    description:
      "Cards and table layouts with key stats, and a direct link to the Form 990.",
  },
  {
    href: "/mockups/collaborations-and-contact",
    title: "Collaborations and contact",
    description:
      "Collaborator search with year nav, and a category picker for contact details.",
  },
  {
    href: "/mockups/events",
    title: "Events",
    description:
      "Summary stats, year nav with sorting, stat tiles and art auction leaderboards.",
  },
];

const MockupsPage: NextPage = () => (
  <>
    <Meta
      title="Design mockups"
      description="Design mockups for review."
      noindex
    />

    {/* Nav background */}
    <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

    <Section dark className="py-12">
      <Heading className="my-0">Design mockups</Heading>
      <p className="mt-2 text-lg">
        Previews for review on GitHub. These pages are not linked from the site
        and are not indexed.
      </p>
    </Section>

    <Section className="grow">
      <ol className="flex max-w-3xl flex-col divide-y divide-alveus-green-200">
        {mockups.map((mockup, idx) => (
          <li key={mockup.href} className="flex gap-4 py-4">
            <span className="w-6 shrink-0 pt-1 text-right font-serif text-lg text-alveus-green-600 tabular-nums">
              {idx + 1}.
            </span>
            <div>
              <Heading level={2} className="my-0 text-2xl">
                <Link href={mockup.href}>{mockup.title}</Link>
              </Heading>
              <p className="text-alveus-green-700">{mockup.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  </>
);

export default MockupsPage;
