import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { getmyAll } from "./pointfunction";
import { SuiClient } from "@mysten/sui.js/client";
import Home from "./components/Home";
import Dosc from "./components/Dosc";
import MyTable from "./data";
import "./App.css";

import TeenPatti from "./components/TeenPatti";
import PointsRebate from "./PointsRebate";
import WeeklyRace from "./WeeklyRace";

// @ts-ignore
import logo from "./assets/Logo.jpg"; //
// @ts-ignore
import suilogo from "./assets/suilogo.svg";
// @ts-ignore
import usdclogo from "./assets/usdclogo.svg";
// @ts-ignore
import Telegram from "./assets/Telegram.png";
// @ts-ignore
import suiwinmeme from "./assets/suiwinmeme.png";
// @ts-ignore
import Xpng from "./assets/x.png";

const neting = "main";
const usdcTYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
function getAvatarURL(address: string) {
  const sum = address.substring(2, 10);
  const numericStr = sum.replace(/\D/g, ""); // 1
  const num = Number(numericStr);
  let num1 = num % 10000;
  if (num1 < 1) {
    num1 = 1;
  }

  const num2 = num1.toString().padStart(4, "0");

  return `https://cryptopunks.app/public/images/cryptopunks/punk${num2}.png`;
}

const App: React.FC = () => {
  const client = new SuiClient({
    url: "https://rpc-mainnet.suiscan.xyz:443",
  });

  const [avatar, setAvatar] = useState("https://i.imgur.com/q2BJwpV.png");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1400);
  const account = useCurrentAccount();

  const [balance, setBalance] = useState<string>("");
  const [balanceusdc, setBalanceusdc] = useState<string>("");
  const [point, setPoint] = useState<string>("");

  const location = useLocation();

  useEffect(() => {
    const subscribeToTransaction = async () => {
      try {
        const fetchData = async () => {
          try {
            if (account) {
              const { sui, usdc } = await getbalan(account.address);
              setBalance(sui);
              setBalanceusdc(usdc);

              if (account.chains[0].includes(neting)) {
                console.log("Link wallet!!!");
              } else {
                window.alert(`Link wallet to ${neting}!!`);
              }
            } else {
              setBalance("");
              setBalanceusdc("");
              setPoint("");
            }
          } catch (error) {
            console.error("Error fetching balance:", error);
          }
        };
        if (account) {
          fetchData();
        } else {
          setBalance("");
          setPoint("");
        }
      } catch (error) {
        console.error("Error subscribing to transaction:", error);
      }
    };

    subscribeToTransaction();
    if (account) {
      setAvatar(getAvatarURL(account.address));
    } else {
      setAvatar("https://i.imgur.com/q2BJwpV.png");
    }
  }, [account?.address]);

  const getbalan = async (address: string) => {
    const [suiBal, usdcBal] = await Promise.all([
      client.getBalance({
        owner: address,
      }),
      client.getBalance({
        owner: address,
        coinType: usdcTYPE,
      }),
    ]);

    const sui = (parseFloat(suiBal.totalBalance) / 1e9).toFixed(2); // SUI 1
    const usdc = (parseFloat(usdcBal.totalBalance) / 1e6).toFixed(2); // USDC 1
    return { sui, usdc };
  };

  const getbalangolbal = async () => {
    if (account) {
      try {
        const [suiBal, usdcBal] = await Promise.all([
          client.getBalance({
            owner: account.address,
          }),
          client.getBalance({
            owner: account.address,
            coinType: usdcTYPE,
          }),
        ]);

        const sui = (parseFloat(suiBal.totalBalance) / 1e9).toFixed(2); // SUI 1
        const usdc = (parseFloat(usdcBal.totalBalance) / 1e6).toFixed(2); // USDC 1
        setBalance(sui);
        setBalanceusdc(usdc);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        alert(
          "Unable to fetch balance. Please check your network connection and try again."
        );
      }
    } else {
      console.log("Account is not available");
    }
  };

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth > 1400);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="app">
      <AnnouncementBar />
      <header className="app-bar">
        {!isLargeScreen && (
          <button className="menu-button" onClick={handleDrawerToggle}>
            ☰
          </button>
        )}
        <h1 className="title">
          Welcome To BRAG! Provably Fair Blockchain casino games!
        </h1>
        <div className="header-right">
          <img
            src={avatar}
            loading="lazy"
            alt="Small"
            className="small-image"
            style={{ backgroundColor: "#638596", borderRadius: "8px" }}
          />
          <h1
            className="titleyue"
            style={{ fontSize: "1.2rem", color: "#56ca7f" }}
          >
            {point}
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%", // 1
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1px",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <img
                src={suilogo}
                loading="lazy"
                alt="Small"
                className="small-image"
                style={{
                  width: "1.2em", // 1
                  height: "1.2em",
                  objectFit: "contain",
                }}
              />
              {balance !== "" && (
                <h1 className="titleyue" style={{ fontSize: "1.2rem" }}>
                  {balance}
                </h1>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1px",
                width: "100%",
                justifyContent: "center",
                marginTop: "1px", //1
              }}
            >
              <img
                src={usdclogo}
                loading="lazy"
                alt="Small"
                className="small-image"
                style={{
                  width: "1.2em",
                  height: "1.2em",
                  objectFit: "contain",
                }}
              />
              {balance !== "" && (
                <h1 className="titleyue" style={{ fontSize: "1.2rem" }}>
                  {balanceusdc}
                </h1>
              )}
            </div>
          </div>

          <nav>
            <ConnectButton />
          </nav>
        </div>
      </header>
      <div className={`sidebar ${mobileOpen || isLargeScreen ? "open" : ""}`}>
        <img src={logo} loading="lazy" alt="Logo" className="logo" />
        <nav>
          <ul>
            {[
              { name: "Home", path: "/" },
              { name: "Brag", path: "/brag" },

              { name: "Docs", path: "/Docs" },
            ].map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                })}
              >
                <li
                  style={{
                    backgroundColor:
                      location.pathname === item.path
                        ? "#2b3c32"
                        : "transparent",
                    padding: "3px",
                  }}
                >
                  {item.name}
                </li>
              </NavLink>
            ))}
          </ul>
        </nav>

        <a
          href="https://t.me/+qEPSdbDtO1c0ZjE1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            style={{
              marginTop: "40px",
              marginBottom: "20px",
              marginLeft: "20px",
              marginRight: "20px",
            }}
            src={Telegram}
            loading="lazy"
            alt="Telegram Logo"
            className="tglogo"
          />
        </a>

        <a
          href="https://x.com/brag_game"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            style={{
              marginRight: "20px",
              marginTop: "40px",
              marginBottom: "20px",
              marginLeft: "20px",
            }}
            src={Xpng}
            loading="lazy"
            alt="X Logo"
            className="tglogo"
          />
        </a>
      </div>

      <div className={`content ${mobileOpen ? "shift" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Dosc" element={<Dosc />} />
          <Route
            path="/brag"
            element={<TeenPatti onGetbalan={getbalangolbal} />}
          />
          <Route
            path="/PointsRebate"
            element={<PointsRebate onGetbalan={getbalangolbal} />}
          />
          <Route
            path="/WeeklyRace"
            element={<WeeklyRace onGetbalan={getbalangolbal} />}
          />
          {/* Home */}
          <Route path="*" element={<Home />} />
        </Routes>
        <div className="content-data">
          <MyTable />
        </div>
        <div className="footer"> ©2025 All rights reserved</div>
      </div>
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
