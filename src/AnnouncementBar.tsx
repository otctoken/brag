import React, { useState } from "react";
import "./App.css"; // 导入 CSS 样式

const AnnouncementBar: React.FC = () => {
  const [show, setShow] = useState(true); // 控制公告条显示的状态

  // 动画结束时触发隐藏公告条
  const handleAnimationEnd = () => {
    setShow(false);
  };

  if (!show) return null; // 如果公告条隐藏，则返回 null

  return (
    <div
      id="container"
      className="announcement-container"
      style={{
        animation: "neon 3s infinite",
      }}
    >
      <div
        id="announcement"
        className="announcement-content"
        onAnimationEnd={handleAnimationEnd} // 监听动画结束事件
      >
        Brag is an exciting two-player gambling game with gameplay nearly identical to the classic British card game
        Three Card Brag, offering thrilling, fun, and exhilarating experiences.
        This game is deployed on SuiNetwork
        and uses a draw-sign-encrypt-verify mechanism to ensure fairness.
        For more details, please refer to the Docs.
        {/* Play the SUIWIN game to get an NFT airdrop. Limited quantity, first
        come, first served! */}
      </div>
    </div>
  );
};

export default AnnouncementBar;
