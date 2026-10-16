import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { getmyAll } from "./pointfunction";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { client } from "./suiClient";
import Home from "./components/Home";
import Docs from "./components/Docs";
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

  return `https://www.cryptopunks.app/images/cryptopunks/punk${num2}.png`;
}

const App: React.FC = () => {

  const [avatar, setAvatar] = useState(logo);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1400);
  const account = useCurrentAccount();
  const addressRef = useRef(account?.address);
  addressRef.current = account?.address;

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
              if (addressRef.current !== account.address) return;
              setBalance(sui);
              setBalanceusdc(usdc);

              if (account.chains.some(chain => chain === 'sui:mainnet')) {
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
          setBalanceusdc("");
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
      setAvatar(logo);
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

    const sui = (parseFloat(suiBal.balance.balance) / 1e9).toFixed(2); // SUI 1
    const usdc = (parseFloat(usdcBal.balance.balance) / 1e6).toFixed(2); // USDC 1
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

        const sui = (parseFloat(suiBal.balance.balance) / 1e9).toFixed(2); // SUI 1
        const usdc = (parseFloat(usdcBal.balance.balance) / 1e6).toFixed(2); // USDC 1
        if (addressRef.current !== account.address) return;
        setBalance(sui);
        setBalanceusdc(usdc);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
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

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="app">
      <AnnouncementBar />
      <header className="app-bar">
        {!isLargeScreen && (
          <button className="menu-button" aria-label="Toggle navigation" aria-expanded={mobileOpen} onClick={handleDrawerToggle}>
            ☰
          </button>
        )}
        <h1 className="title">
          BRAG · On-chain poker
        </h1>
        <div className="header-right">
          <img
            src={avatar}
            onError={(event) => { event.currentTarget.src = logo; }}
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
              display: account ? "flex" : "none",
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
      {mobileOpen && !isLargeScreen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
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
          <Route path="/Docs" element={<Docs />} />
          <Route
            path="/brag"
            element={<TeenPatti key={account?.address ?? 'disconnected'} onGetbalan={getbalangolbal} />}
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
        <div className="footer"> ©2026 All rights reserved</div>
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


