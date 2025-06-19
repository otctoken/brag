import React, { useState, useEffect } from "react";
import "./data.css"; // 假设你有一个 CSS 文件来进行样式处理

import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { useCurrentAccount } from "@mysten/dapp-kit";
// @ts-ignore
import suilogo from "./assets/suilogo.svg";
// @ts-ignore
import usdclogo from "./assets/usdclogo.svg";
//...................................................随机网络.................................
//..随..........
const urls = ["https://fullnode.testnet.sui.io:443"];
const randomUrl = urls[Math.floor(Math.random() * urls.length)];

const client2 = new SuiClient({ url: randomUrl });

// ......................................................................
const gamelist = ["Coin Flip", "Blind Box", "Dice"];
// const PackageA =
//   "0x866040bf37b4b3c5d9485b19ed6b05b96485a51474c2f244e1700517778a4fc1::suiwin::Outcome";
// const PackageA_21 =
//   "0x866040bf37b4b3c5d9485b19ed6b05b96485a51474c2f244e1700517778a4fc1::suiwin::Outcome21";
// const PackageA_Baccarat =
//   "0x866040bf37b4b3c5d9485b19ed6b05b96485a51474c2f244e1700517778a4fc1::suiwin::Outcome_Baccarat";

const Package_TeenPatti =
  "0xfda4e2a81a22af6533fd7e8e3e85dd6116548831ffef32d7a1a303daac8b65e7::brag::Gvol";
const CoinSui = "0x2::sui::SUI";
const CoinUsdc =
  "0xdacf78cf79c12c8fd19f45d4ee37634523836995c63b67e2b9d79ee188012aab::usdc::USDC";

// const PackageFOMO =
//   "0x7215f3f0d67be7611e0df20ddc8c10f5e67ff83d2964f29aa040a77bc2d2cdaa::suiwin::Outcome";
// const PackageFOMOPrize =
//   "0x7215f3f0d67be7611e0df20ddc8c10f5e67ff83d2964f29aa040a77bc2d2cdaa::suiwin::OutcomePrize";

function formatNumber(value: number): string {
  // 检查是否为整数
  if (Number.isInteger(value)) {
    return value.toString();
  }
  // 保留两位小数并转换为字符串
  return value.toFixed(2);
}
function calculateAndFormatString(str1, dism) {
  // 将字符串转换为浮点数
  const num1 = parseFloat(str1);

  // 进行一些运算，例如相加
  const result = num1 / dism;
  if (result > 0) {
    let truncatedResult = Math.floor(result * 100) / 100;
    return truncatedResult.toFixed(2);
  } else {
    return result.toFixed(2);
  }
  // 将结果格式化为保留两位小数的字符串
}
function formatMilliseconds(ms: number): string {
  if (ms != 0) {
    const date = new Date(ms);

    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  } else {
    return "";
  }
}
interface Bet {
  time: number;
  player: string;
  game: string;
  wager: string;
  multiplier: string;
  profit: string;
  link: string;
  type: string;
}

let initialData: Bet[] = [];
let dictlet = {} as Bet;

async function queryEvents_TeenPatti() {
  try {
    let res: any = await client2.queryEvents({
      query: {
        MoveEventType: `${Package_TeenPatti}<${CoinSui}>`,
      },
      limit: 120,
    });
    let list: Bet[] = [];
    for (var key in res.data) {
      let dict = {} as Bet; // 使用言
      dict.time = parseInt(res.data[key]["timestampMs"], 10);
      dict.player = res.data[key]["parsedJson"]["player"];
      dict.game = "Brag";
      if (res.data[key]["parsedJson"]["expendORincome"]) {
        dict.profit = calculateAndFormatString(
          res.data[key]["parsedJson"]["vol"],
          1e9
        );
        dict.wager = "--";
      } else {
        dict.wager = calculateAndFormatString(
          res.data[key]["parsedJson"]["vol"],
          1e9
        );
        dict.profit = "--";
      }

      dict.multiplier = "--";
      dict.type = "sui";
      dict.link = res.data[key]["id"]["txDigest"];
      list.push(dict);
    }
    list = list.filter((bet) => bet.multiplier !== "");
    return list;
  } catch (error) {
    console.error("Error querying events:", error);
    let list: Bet[] = [];
    return list;
  }
}

async function queryEvents_TeenPatti_USDC() {
  try {
    let res: any = await client2.queryEvents({
      query: {
        MoveEventType: `${Package_TeenPatti}<${CoinUsdc}>`,
      },
      limit: 120,
    });
    let list: Bet[] = [];
    for (var key in res.data) {
      let dict = {} as Bet; // 使用言
      dict.time = parseInt(res.data[key]["timestampMs"], 10);
      dict.player = res.data[key]["parsedJson"]["player"];
      dict.game = "Brag";
      if (res.data[key]["parsedJson"]["expendORincome"]) {
        dict.profit = calculateAndFormatString(
          res.data[key]["parsedJson"]["vol"],
          1e6
        );
        dict.wager = "--";
      } else {
        dict.wager = calculateAndFormatString(
          res.data[key]["parsedJson"]["vol"],
          1e6
        );
        dict.profit = "--";
      }

      dict.multiplier = "--";
      dict.type = "usdc";
      dict.link = res.data[key]["id"]["txDigest"];
      list.push(dict);
    }
    list = list.filter((bet) => bet.multiplier !== "");
    return list;
  } catch (error) {
    console.error("Error querying events:", error);
    let list: Bet[] = [];
    return list;
  }
}

const MyTable: React.FC = () => {
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState("all");
  const [sampleData, setData] = useState<Bet[]>(initialData);
  function Betplayer() {
    if (account) {
      return account.address;
    } else {
      return "0x0";
    }
  }

  useEffect(() => {
    // 定义要每隔5秒执行的函数
    const fetchData = async () => {
      let elementALLTeenPatti = await queryEvents_TeenPatti();
      let elementALLTeenPatti_usdc = await queryEvents_TeenPatti_USDC();

      if (
        elementALLTeenPatti.length == 0 &&
        elementALLTeenPatti_usdc.length == 0
      ) {
        let list: Bet[] = [];
        let dict = {} as Bet; // 使用言
        dict.time = 999;
        dict.profit = "--";
        dict.player = "0x0";
        dict.game = "Brag";
        dict.profit = "0";
        dict.wager = "--";
        dict.multiplier = "--";
        dict.link = "--";
        list.push(dict);
        elementALLTeenPatti = list;
      }

      let combinedList: Bet[] = [];
      combinedList = [...elementALLTeenPatti_usdc, ...elementALLTeenPatti];
      combinedList.sort((a, b) => b.time - a.time);

      if (dictlet.time != combinedList[0].time) {
        setData(combinedList);
        dictlet = combinedList[0];
      }
    };

    let Fedatatime = 5000;

    const intervalId = setInterval(fetchData, Fedatatime);

    // 清理定时器以避免内存泄漏
    // @ts-ignore

    return () => clearInterval(intervalId);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const filteredData =
    activeTab === "all"
      ? sampleData
      : sampleData.filter((bet) => bet.player === Betplayer()); //Betplayer()
  const rowsToShow =
    filteredData.length < 0
      ? [
          ...filteredData,
          ...Array(15 - filteredData.length).fill({
            time: "",
            player: "",
            game: "",
            wager: "",
            multiplier: "",
            profit: "",
            link: "",
          }),
        ]
      : filteredData;

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
      <div className="table-container">
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
            {rowsToShow.map((bet, index) => (
              <tr
                key={index}
                className={`${bet.link ? "" : "empty-row"} ${
                  bet.profit !== "0.00" && bet.profit !== "--"
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
                      color: "rgb(148, 146, 146)", // 设置点击前后的颜色
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
