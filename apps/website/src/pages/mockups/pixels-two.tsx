import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { type GetStaticProps, type NextPage } from "next";
import Image from "next/image";
import { Fragment } from "react";

import murals from "@/data/murals";

import { PixelProvider } from "@/hooks/pixels";

import Box from "@/components/content/Box";
import Button from "@/components/content/Button";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import PixelsDescription from "@/components/institute/PixelsDescription";
import PixelsDonate from "@/components/institute/PixelsDonate";
import PixelsDownload from "@/components/institute/PixelsDownload";
import PixelsProgress from "@/components/institute/PixelsProgress";
import PixelsSearch from "@/components/institute/PixelsSearch";
import MockupNotice from "@/components/mockups/MockupNotice";
import MockupPixelLeaderboard from "@/components/mockups/MockupPixelLeaderboard";
import MockupWolves from "@/components/mockups/MockupWolves";
import { underlineTabClassName } from "@/components/mockups/ViewTabs";

import IconArrowRight from "@/icons/IconArrowRight";
import IconPencil from "@/icons/IconPencil";

import leafLeftImage3 from "@/assets/floral/leaf-left-3.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";
import buildingHeroImage from "@/assets/institute/hero/building.png";
import usfwsRedWolfWalkingImage from "@/assets/institute/usfws-red-wolf-walking.jpg";

import type { Leaderboard } from "@/app/api/pixels/[mural]/leaderboard/route";

const muralId = "two";
const mural = murals[muralId];

type PixelsMockupProps = { leaderboard: Leaderboard | null };

// The preview has no database, so read the public leaderboard from the live site
export const getStaticProps: GetStaticProps<PixelsMockupProps> = async () => {
  try {
    const response = await fetch(
      "https://www.alveussanctuary.org/api/pixels/two/leaderboard",
    );
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const leaderboard = (await response.json()) as Leaderboard;
    return { props: { leaderboard }, revalidate: 300 };
  } catch {
    return { props: { leaderboard: null }, revalidate: 300 };
  }
};

const PixelsTwoMockupPage: NextPage<PixelsMockupProps> = ({ leaderboard }) => (
  <PixelProvider muralId={muralId}>
    <Meta
      title="Pixel Project 2 | Mockup"
      description={mural.description}
      image={buildingHeroImage.src}
      noindex
    />

    {/* Nav background */}
    <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

    <MockupNotice>
      {leaderboard
        ? "Leaderboard from alveussanctuary.org."
        : "Live leaderboard unavailable in this preview."}
    </MockupNotice>

    <Section
      dark
      containerClassName="flex flex-col gap-4 lg:flex-row lg:gap-8 items-start lg:items-center"
    >
      <div className="shrink grow text-balance">
        <Heading>Alveus Research & Recovery Institute {mural.name}</Heading>
        <p>{mural.description}</p>
      </div>
      <Button
        href="/institute"
        dark
        className="flex items-center gap-2 text-nowrap"
      >
        <IconArrowRight className="size-5 -scale-x-100" />
        Learn More About the Institute
      </Button>
    </Section>

    {/* Grow the last section to cover the page */}
    <Section
      className="grow overflow-hidden py-8"
      containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3 items-stretch"
    >
      {/* Counter, moved above the mural */}
      <Box
        dark
        className="col-span-full flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
      >
        <PixelsDescription className="shrink-0 font-serif text-3xl font-bold" />
        <PixelsProgress className="grow" />
      </Box>

      <PixelsSearch className="col-span-full">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute bottom-0 left-full -z-10 h-3/4 max-h-64 w-auto -translate-x-2 -scale-x-100 drop-shadow-md select-none"
        />
        <Image
          src={leafLeftImage3}
          alt=""
          className="pointer-events-none absolute top-full left-0 -z-10 h-2/5 max-h-48 w-auto -translate-x-2/5 -translate-y-1/3 -scale-x-100 drop-shadow-md select-none"
        />
      </PixelsSearch>

      {/* Saving Animals card, aligned with the donation card */}
      <Box
        dark
        className="flex flex-col items-start gap-4 max-lg:order-last lg:h-full xl:col-span-2"
      >
        <Heading level={2} className="my-0">
          Saving Animals From Extinction
        </Heading>

        <p className="text-lg">
          While all pixels have been claimed on our original Pixel Project
          mural, we still need your help! That&apos;s why we&apos;re excited to
          announce the launch of Pixel Project 2 - another 10,000 pixels waiting
          to be unlocked by your donations, supporting the continued development
          of the Alveus Research & Recovery Institute and taking the Alveus
          approach to the wild.
        </p>

        <p className="text-lg">
          Each donation of $100 or more unlocks a pixel on our mural, displaying
          your name and denoting you as one of the 10,000 vital supporters of
          the institute as part of this mural. More pixels can be unlocked for
          each additional $100 included in your donation.
        </p>

        <Link
          href="/institute/pixels/one"
          dark
          className="flex items-center gap-2 text-balance"
        >
          <IconArrowRight className="mt-0.5 size-4 -scale-x-100" />
          Explore the Original Pixel Project Mural
        </Link>

        <MockupWolves
          image={{
            src: usfwsRedWolfWalkingImage,
            alt: "Red wolf, Hillebrand, Steve/USFWS, Public Domain, https://www.fws.gov/media/just-little-closer",
          }}
        >
          <p className="text-lg">
            The Alveus Research & Recovery Institute is aiming to create a
            conservation breeding program for the critically endangered Mexican
            Gray and Red wolves, helping to maintain a population under human
            care with the end goal of reintroducing these incredible animals
            back into the wild.
          </p>

          <Link href="/institute" dark className="flex items-center gap-2">
            <IconArrowRight className="mt-0.5 size-4 -scale-x-100" />
            Learn More About the Institute
          </Link>
        </MockupWolves>

        <p className="mt-auto text-xs text-balance opacity-75">
          Alveus Sanctuary will use all donations as part of the {mural.name} to
          fund the initial development of the institute.
          <br />
          In the event that more funds are raised than are needed for the
          project, additional funds will be allocated to the operations of the
          institute.
        </p>
      </Box>

      {/* Donation embed, unchanged */}
      <div className="flex flex-col">
        <PixelsDonate className="w-full grow" />
      </div>

      {/* Leaderboard, below the Saving Animals card */}
      <Box dark className="h-full xl:col-span-2">
        <Heading level={2} className="mt-0 text-xl">
          Leaderboard
        </Heading>
        <MockupPixelLeaderboard
          showLinks
          muralId={muralId}
          columns={2}
          data={leaderboard ?? undefined}
        />
      </Box>

      {/* Help, as tabs, under the donation card */}
      <Box dark className="h-full">
        <TabGroup>
          <TabList
            aria-label="Pixel help"
            className="-mx-3 -mt-3 mb-4 flex flex-wrap items-center border-b border-alveus-green-600"
          >
            {["Can't find your pixel?", "Want a different name?"].map(
              (label, idx) => (
                <Fragment key={label}>
                  {idx > 0 && (
                    <span
                      aria-hidden="true"
                      className="h-4 w-px bg-alveus-green-600"
                    />
                  )}
                  <Tab
                    className={({ selected }) =>
                      underlineTabClassName(selected, true)
                    }
                  >
                    {label}
                  </Tab>
                </Fragment>
              ),
            )}
          </TabList>
          <TabPanels>
            <TabPanel className="focus:outline-none">
              <Heading level={2} className="mt-0 text-xl">
                Can&apos;t find your pixel?
              </Heading>
              <p>
                If you donated via Twitch Charity, your pixel will show your
                Twitch username and you can search using that. If you donated
                via PayPal or Giving Block directly, your pixel will show your
                first name but you can also search using your donation email
                address.
              </p>
            </TabPanel>
            <TabPanel className="focus:outline-none">
              <Heading level={2} className="mt-0 text-xl">
                Want a different name on the mural?
              </Heading>
              <p>
                You can log in with Twitch, or submit your PayPal or Giving
                Block donation details, to change your name on any of the pixels
                you have unlocked on the mural.
              </p>
              <Button
                href={`/institute/pixels/${muralId}/rename`}
                dark
                className="mt-4 inline-flex items-center gap-2"
              >
                <IconPencil className="size-4" />
                Rename your pixels
              </Button>
            </TabPanel>
          </TabPanels>
        </TabGroup>

        <PixelsDownload />
      </Box>
    </Section>
  </PixelProvider>
);

export default PixelsTwoMockupPage;
