// Mockup copy of components/institute/Wolves.tsx
// The wild population numbers are shown as deliberate digit counters.
import type { ImageProps } from "next/image";
import Image from "next/image";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";

// Each digit in its own tile, leading zeros kept but dimmed
const Counter = ({ value, digits }: { value: number; digits: number }) => {
  const padded = value.toString().padStart(digits, "0");
  const firstSignificant = padded.search(/[1-9]/);

  return (
    <span className="mr-3 inline-flex gap-1 align-middle">
      <span className="sr-only">{value}</span>
      {padded.split("").map((digit, idx) => (
        <span
          // eslint-disable-next-line @eslint-react/no-array-index-key -- Digits are positional.
          key={idx}
          aria-hidden="true"
          className={
            idx < firstSignificant
              ? "inline-block w-[1.1em] rounded-md bg-red-900 py-1 text-center font-serif text-5xl leading-none text-red-100/30 tabular-nums"
              : "inline-block w-[1.1em] rounded-md bg-red-900 py-1 text-center font-serif text-5xl leading-none text-white tabular-nums"
          }
        >
          {digit}
        </span>
      ))}
    </span>
  );
};

const MockupWolves = ({
  children,
  image,
}: {
  children?: React.ReactNode;
  image: { src: ImageProps["src"]; alt: string };
}) => (
  <>
    <div className="@container relative my-4 grid w-full auto-rows-fr grid-cols-1 gap-4">
      <Image
        src={image.src}
        width={240}
        alt={image.alt}
        className="pointer-events-none absolute top-1/2 right-0 z-10 aspect-square size-40 translate-x-1/2 -translate-y-1/2 rounded-full border-12 border-alveus-green object-cover @md:size-60 @md:border-16"
      />

      <div className="relative flex items-center rounded-r-xl bg-red py-3 pr-20 before:absolute before:inset-y-0 before:-left-full before:w-full before:bg-red @md:pr-30">
        <Heading level={-1} className="my-0 flex items-center">
          <Counter value={21} digits={3} />
          <span>
            Red wolves exist in the wild today.{" "}
            <Link
              href="#wolf-sources"
              custom
              className="text-xs opacity-50 transition-colors hover:text-blue-300 hover:underline"
            >
              [1]
            </Link>
          </span>
        </Heading>
      </div>

      <div className="relative flex items-center rounded-r-xl bg-red py-3 pr-20 before:absolute before:inset-y-0 before:-left-full before:w-full before:bg-red @md:pr-30">
        <Heading level={-1} className="my-0 flex items-center">
          <Counter value={319} digits={3} />
          <span>
            Mexican Gray wolves exist in the wild today.{" "}
            <Link
              href="#wolf-sources"
              custom
              className="text-xs opacity-50 transition-colors hover:text-blue-300 hover:underline"
            >
              [2]
            </Link>
          </span>
        </Heading>
      </div>
    </div>

    {children}

    <ul className="mt-4 text-left text-xs opacity-75" id="wolf-sources">
      <li className="mb-1">
        [1]{" "}
        <Link
          external
          href="https://www.fws.gov/project/red-wolf-recovery-program"
          dark
        >
          U.S. Fish & Wildlife Service Red Wolf Recovery Program Update - August
          2026
        </Link>
      </li>
      <li className="mb-1">
        [2]{" "}
        <Link
          external
          href="https://read.dgf.nm.gov/mexican-wolf-population-survey-reveals-a-minimum-of-319-mexican-wolves-distributed-across-arizona-and-new-mexico"
          dark
        >
          New Mexico Department of Wildlife and Arizona Game & Fish Department -
          February 2026
        </Link>
      </li>
    </ul>
  </>
);

export default MockupWolves;
