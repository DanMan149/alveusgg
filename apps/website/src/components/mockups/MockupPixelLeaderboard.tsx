// Mockup copy of components/institute/PixelLeaderboard.tsx
// Adds a two-column layout and an optional pre-fetched list.
import { useQuery } from "@tanstack/react-query";

import type { MuralId } from "@/data/murals";

import { classes } from "@/utils/classes";

import Link from "@/components/content/Link";

import IconLoading from "@/icons/IconLoading";

import type { Leaderboard } from "@/app/api/pixels/[mural]/leaderboard/route";

const LeaderboardTable = ({
  rows,
  offset,
  muralId,
  showLinks,
  className,
}: {
  rows: Leaderboard;
  offset: number;
  muralId: MuralId;
  showLinks: boolean;
  className?: string;
}) => (
  <table className={classes("-mx-1 table-auto", className)}>
    <thead>
      <tr>
        <th className="p-1 text-right font-bold">#</th>
        <th className="p-1 text-left font-bold">Name</th>
        <th className="p-1 font-bold">Pixels</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(([identifier, count], index) => (
        <tr key={identifier} className="border-t border-current/10">
          <td className="px-1 py-0.5 text-right tabular-nums">
            {offset + index + 1}
          </td>
          <td className="w-full px-1 py-0.5">
            {showLinks ? (
              <Link
                dark
                href={`/institute/pixels/${muralId}?s=${encodeURIComponent(identifier)}`}
              >
                {identifier}
              </Link>
            ) : (
              identifier
            )}
          </td>
          <td className="px-1 py-0.5 text-right tabular-nums">
            {count.toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default function MockupPixelLeaderboard({
  muralId,
  showLinks = false,
  columns = 1,
  data,
}: {
  muralId: MuralId;
  showLinks?: boolean;
  // Split the list into two side-by-side columns on wider screens
  columns?: 1 | 2;
  // Pre-fetched leaderboard to show instead of querying the API
  data?: Leaderboard;
}) {
  const query = useQuery<Leaderboard>({
    queryKey: ["pixel-leaderboard", muralId],
    queryFn: async () => {
      const response = await fetch(`/api/pixels/${muralId}/leaderboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch pixel leaderboard");
      }
      return response.json();
    },
    refetchInterval: 30 * 1000, // 30 seconds
    enabled: !data,
  });

  if (!data && query.isLoading) {
    return (
      <div className="flex flex-row gap-4">
        <IconLoading className="size-4" /> Loading leaderboard…
      </div>
    );
  }

  if (!data && query.isError) {
    return <div>Error loading leaderboard: {query.error.message}</div>;
  }

  const rows = data ?? query.data ?? [];

  if (columns === 2) {
    const half = Math.ceil(rows.length / 2);
    return (
      <div className="grid gap-x-8 sm:grid-cols-2">
        <LeaderboardTable
          rows={rows.slice(0, half)}
          offset={0}
          muralId={muralId}
          showLinks={showLinks}
          className="w-full"
        />
        <LeaderboardTable
          rows={rows.slice(half)}
          offset={half}
          muralId={muralId}
          showLinks={showLinks}
          className="w-full max-sm:[&_thead]:hidden"
        />
      </div>
    );
  }

  return (
    <LeaderboardTable
      rows={rows}
      offset={0}
      muralId={muralId}
      showLinks={showLinks}
    />
  );
}
