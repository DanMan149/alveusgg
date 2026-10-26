import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

import { classes } from "@/utils/classes";

export type ViewTab = {
  key: string;
  label: ReactNode;
  content: ReactNode;
};

export const underlineTabClassName = (selected: boolean, dark = false) =>
  classes(
    "border-b-3 px-3 pt-3 pb-2.5 font-serif text-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none",
    dark
      ? "focus-visible:outline-alveus-tan"
      : "focus-visible:outline-alveus-green-700",
    selected
      ? dark
        ? "border-alveus-tan"
        : "border-alveus-green-700"
      : dark
        ? "border-transparent hover:border-alveus-green-400"
        : "border-transparent hover:border-alveus-green-300",
  );

// Plain underline tabs (keyboard arrows, ARIA tabs) for switching between views
const ViewTabs = ({
  tabs,
  selected,
  onChange,
  label,
  listClassName,
}: {
  tabs: ViewTab[];
  selected: number;
  onChange: (index: number) => void;
  label: string;
  listClassName?: string;
}) => (
  <TabGroup selectedIndex={selected} onChange={onChange}>
    <div
      className={classes(
        "border-b border-alveus-green-700 bg-alveus-green-900 text-alveus-tan",
        listClassName,
      )}
    >
      <TabList
        aria-label={label}
        className="container mx-auto scrollbar-none flex items-center overflow-x-auto px-1"
      >
        {tabs.map((tab, idx) => (
          <Fragment key={tab.key}>
            {idx > 0 && (
              <span
                aria-hidden="true"
                className="h-4 w-px shrink-0 bg-alveus-green-600"
              />
            )}
            <Tab
              className={({ selected }) =>
                underlineTabClassName(selected, true)
              }
            >
              {tab.label}
            </Tab>
          </Fragment>
        ))}
      </TabList>
    </div>
    <TabPanels>
      {tabs.map((tab) => (
        <TabPanel key={tab.key} className="focus:outline-none">
          {tab.content}
        </TabPanel>
      ))}
    </TabPanels>
  </TabGroup>
);

export default ViewTabs;
