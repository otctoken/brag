import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { loadBetHistory } from "./betHistory";
import "./data.css";
import suilogo from "./assets/suilogo.svg";
import usdclogo from "./assets/usdclogo.svg";

function formatMilliseconds(ms: number): string {
  const date = new Date(ms);
  const pad = (value: number) => String(value).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate())
    + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
}

const MyTable: React.FC = () => {
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState("all");
  const { data: sampleData = [], isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ["brag", "mainnet", "bet-history"],
    queryFn: ({ signal }) => loadBetHistory(signal),
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: 1,
  });
  const handleTabChange = (tab: string) => setActiveTab(tab);
  const rowsToShow = activeTab === "all"
    ? sampleData
    : sampleData.filter(bet => bet.player === account?.address);

  return (
    <div>
      <div className="tabs">
        <button
          onClick={() => handleTabChange("all")}
          className={activeTab === "all" ? "active" : ""}
        >
          All bets
        </button>
        <button
          onClick={() => handleTabChange("mine")}
          className={activeTab === "mine" ? "active" : ""}
        >
          My bets
        </button>
      </div>
      {isError && (
        <p role="alert">
          Unable to load recent bets. {sampleData.length > 0 && "Showing previously loaded records. "}
          <button onClick={() => void refetch()} disabled={isFetching}>Retry</button>
        </p>
      )}
      <div className="table-container" aria-busy={isFetching}>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Player</th>
              <th>Game</th>
              <th>Wager</th>
              <th>Multiplier</th>
              <th>Winnings</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {rowsToShow.length === 0 && (
              <tr><td colSpan={7} role="status">
                {isPending ? "Loading recent bets…"
                  : isError ? "History is currently unavailable. Please retry."
                  : activeTab === "mine" && !account ? "Connect your wallet to see your bets."
                  : "No bets found."}
              </td></tr>
            )}
            {rowsToShow.map((bet) => (
              <tr
                key={bet.id}
                className={`${bet.link ? "" : "empty-row"} ${bet.profit !== "0.00" && bet.profit !== "--"
                  ? "non-zero-profit"
                  : ""
                  }`}
              >
                <td>{formatMilliseconds(bet.time)}</td>
                <td>{bet.player}</td>
                <td>
                  {bet.game}
                  <img
                    src={bet.type == "sui" ? suilogo : usdclogo}
                    alt="logo"
                    style={{
                      width: "20px",
                      height: "20px",
                      marginLeft: "4px",
                      verticalAlign: "middle",
                    }}
                  />
                </td>
                <td>{bet.wager}</td>
                <td>{bet.multiplier}</td>
                <td>{bet.profit}</td>
                <td>
                  <a
                    href={`https://suiscan.xyz/mainnet/tx/${bet.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "rgb(148, 146, 146)", // 11
                    }}
                  >
                    {bet.link}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTable;

