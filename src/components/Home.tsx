
// @ts-ignore
import OKX from "../assets/ok.jfif"; // Import your logo imagesrc\assets\dict.jpg

// @ts-ignore
import teen from "../assets/teenBjt.png"; // Import your logo image

import React from "react";
import { useNavigate } from "react-router-dom";
// interface Props {
//   onPageChange: (page: string) => void;
// }

const Home: React.FC = () => {
  const navigate = useNavigate();
  const handlePlayButtonClick = (page: string) => {
    navigate(`/${page}`);
  };
  return (
    <div className="grid-container">
      <div className="grid-item">
        <img src={teen} loading="lazy" alt="Logo" className="logo" />
        <button
          className="paly-button shift"
          onClick={() => handlePlayButtonClick("brag")}
        >
          Play
        </button>
      </div>
      <div className="grid-item">
        <a
          href="https://www.okx.com/join/94053402"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={OKX} loading="lazy" alt="Logo" className="logo" />
        </a>
      </div>
    </div>
  );
};
export default Home;
