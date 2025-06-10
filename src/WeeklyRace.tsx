import React, { useState, useEffect, useRef } from "react";

interface AProps {
  onGetbalan: () => void; // 定义 props 类型
}
const WeeklyRace: React.FC<AProps> = ({ onGetbalan }) => {
  return (
    <div>
      <h1 className="titleyue">WeeklyRace</h1>
      <div className="grid-container-game">
        Weekly reward 1000SUI(coming soon)
      </div>
    </div>
  );
};
export default WeeklyRace;
