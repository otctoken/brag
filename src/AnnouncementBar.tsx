import React, { useEffect, useState } from "react";
import "./App.css";

const AnnouncementBar: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Always play the requested single scroll; remove the bar even if the
    // browser cancels or never dispatches animationend.
    const timeout = window.setTimeout(() => setShow(false), 21000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!show) return null;

  return (
    <div className="announcement-container">
      <div
        className="announcement-content"
        onAnimationEnd={event => {
          if (event.target === event.currentTarget && event.animationName === 'scroll-left') setShow(false);
        }}
      >
        Brag is an exciting two-player gambling game with gameplay nearly identical to the classic British card game
        Three Card Brag, offering thrilling, fun, and exhilarating experiences.
        This game is deployed on SuiNetwork
        and uses a draw-sign-encrypt-verify mechanism to ensure fairness.
        For more details, please refer to the Docs.
      </div>
    </div>
  );
};

export default AnnouncementBar;
