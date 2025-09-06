import React, { useState, useEffect, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  getmyAll,
  getTop10,
  getTop10_all,
  gettop10_lastweek,
  getweekMy,
  updatapoint,
} from "./pointfunction";
// @ts-ignore
import logo from "./assets/Logo.jpg"; //
// @ts-ignore
import LV1 from "./assets/tie.png"; //
// @ts-ignore
import LV2 from "./assets/tong.png"; //
// @ts-ignore
import LV3 from "./assets/yin.png"; //
// @ts-ignore
import LV4 from "./assets/jin.png"; //
// @ts-ignore
import LV5 from "./assets/baijin.png"; //
// @ts-ignore
import LV6 from "./assets/zhuanshi.png"; //
// @ts-ignore
import LV7 from "./assets/dashi.png"; //
// @ts-ignore
import LV8 from "./assets/wangzhe.png"; //

const LV_logo = [LV1, LV2, LV3, LV4, LV5, LV6, LV7, LV8];

interface AProps {
  onGetbalan: () => void; // 定义 props 类型
}
function getAvatarURL(address) {
  // 先将地址字符串转换为整数
  const sum = address.substring(2, 10);
  const numericStr = sum.replace(/\D/g, ""); // 移除所有非数字字符
  const num = Number(numericStr);
  let num1 = num % 10000;
  if (num1 < 1) {
    num1 = 1;
  }

  const num2 = num1.toString().padStart(4, "0");

  // 将两个数相加并对10000取模
  return `https://www.cryptopunks.app/images/cryptopunks/punk${num2}.png`;
}

function getLv(nb) {
  if (nb > level_points[7]) {
    return 7;
  } else if (nb > level_points[6]) {
    return 6;
  } else if (nb > level_points[5]) {
    return 5;
  } else if (nb > level_points[4]) {
    return 4;
  } else if (nb > level_points[3]) {
    return 3;
  } else if (nb > level_points[2]) {
    return 2;
  } else if (nb > level_points[1]) {
    return 1;
  } else {
    return 0;
  }
}

const level_points = [0, 1000, 10000, 50000, 150000, 300000, 600000, 1200000];
const level_name = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "King",
];
const Weekly_rebate = ["--", "--", "0.5‰", "1‰", "2‰", "3‰", "4‰", "5‰"];
const Irregular_airdrops = [
  "--",
  "--",
  "--",
  "--",
  "--",
  "random coin",
  "random coin",
  "random coin、NFT",
];
const columns = [
  { key: "id", label: "", sortable: false },
  { key: "logo", label: "", sortable: false },
  { key: "name", label: "LV", sortable: false },
  { key: "vol0", label: "points", sortable: false },
  { key: "vol", label: "Weekly rebate", sortable: false },
  { key: "vol2", label: "Irregular airdrops", sortable: false },
];
interface DataRow {
  id: number;
  logo: string;
  name: string;
  vol0: string;
  vol: string;
  vol2: string;
}

const sampleData: DataRow[] = [
  // 这里添加更多的数据
];

for (let i = 0; i < 8; i++) {
  sampleData.push({
    id: i,
    logo: LV_logo[i],
    name: level_name[i],
    vol0: `${level_points[i]}+`,
    vol: Weekly_rebate[i],
    vol2: Irregular_airdrops[i],
  });
}

const PointsRebate: React.FC<AProps> = ({ onGetbalan }) => {
  const [avatar, setAvatar] = useState("https://i.imgur.com/q2BJwpV.png");
  const [point, setPoint] = useState<string>("0");
  const [adder, setAdder] = useState<string>("");
  const [lv_nb, setlv_nb] = useState(0);
  const [percentage, setpercentage] = useState(1);
  const [NX_lv, setNX_lv] = useState(1);

  const account = useCurrentAccount();

  useEffect(() => {
    if (account) {
      const fetchData = async () => {
        const getpoint = await getmyAll(account.address);
        if (getpoint != 0) {
          const mypoint = (getpoint.fen / 100).toFixed(2);
          const lv_ = getLv(Number(mypoint));
          setlv_nb(lv_);
          setPoint(mypoint);
          if (lv_ < 7) {
            setNX_lv(lv_ + 1);
          } else {
            setNX_lv(lv_);
          }
        }
      };
      setAvatar(getAvatarURL(account.address));
      fetchData();
      // setpercentage(getpointfen / level_points[NX_lv]);
      setAdder(account.address);
    } else {
      setlv_nb(0);
      setPoint("");
      setAdder("");
      setAvatar("https://i.imgur.com/q2BJwpV.png");
    }

    // Cleanup function if needed
  }, [account?.address]);

  useEffect(() => {
    setpercentage((Number(point) * 100) / level_points[NX_lv]);
  }, [point]);

  return (
    <div>
      <h1 className="titleyue">Pointsre Bate</h1>
      <div className="grid-container-game">
        <div className="grid-item-H">
          <img
            src={LV_logo[lv_nb]}
            alt="Image"
            style={{
              width: "100%", // 图片在小屏幕上自动缩放
              maxWidth: "130px", // 最大宽度为 200px
              height: "auto", // 高度根据宽度自动调整
            }}
          />
          <div className="grid-item">
            <h1 style={{ textAlign: "left", width: "100%" }}>
              <img
                src={avatar}
                loading="lazy"
                alt="Small"
                className="small-image"
                style={{
                  backgroundColor: "#638596",
                  borderRadius: "3px",
                }} // 设置小一些的尺寸
              />
              <span
                style={{
                  color: "#FFD700", // 修改文字颜色为橙红色
                  position: "relative", // 相对定位
                  top: "-5px", // 向上移动
                  fontWeight: "bold", // 加粗显示
                  fontSize: "1.1em", // 调整字体大小
                }}
              >
                {point}
              </span>
            </h1>
            <div
              style={{
                width: "100%", // 父容器宽度
                height: "15px",
                backgroundColor: "#484848",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative", // 确保文字可以定位
                boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* 进度条 */}
              <div
                style={{
                  width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                  height: "100%",
                  backgroundColor: "rgb(10, 172, 83)",
                  transition: "width 0.3s ease",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a8a8a8",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {Number(point)}/{level_points[NX_lv]}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <h1 className="Gametitle" style={{ marginLeft: "0px" }}>
                {level_name[lv_nb]}
              </h1>
            </div>
            <h1
              className="Gametitle"
              style={{
                marginTop: "10px",
                color: "#a8a8a8",
                wordBreak: "break-word", // 自动换行
                whiteSpace: "normal", // 确保文本正常换行
                overflowWrap: "break-word", // 对长单词进行换行
              }}
            >
              {adder}
            </h1>
          </div>
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "#999999",
            textAlign: "center",
            display: "block",
          }}
        >
          1SUI=1 point, the rebate will be calculated based on the betting
          amount of the week, and the betting amount of the week must be greater
          than 2000SUI. Each week starts on Tuesday at 0:00 UTC.
        </p>
      </div>
      <div>
        <div className="grid-item">
          <table style={{ tableLayout: "fixed", width: "100%" }}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{
                      width:
                        column.key === "id" || column.key === "logo"
                          ? "30px"
                          : column.key === "name"
                          ? "90px"
                          : "auto", // id 和 logo 列宽度为 50px，name 列宽度为 80px，其他自动分配
                      textAlign: "center",
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row) => (
                <tr
                  key={row.id}
                  className="hoverable-row" // 添加类名
                  style={{ height: "55px" }}
                >
                  <td style={{ width: "55px", textAlign: "center" }}>
                    {row.id}
                  </td>
                  {/* 固定 id 列宽为 50px */}
                  <td style={{ width: "55px", textAlign: "center" }}>
                    <img
                      src={row.logo}
                      alt="logo"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </td>
                  {/* 固定 logo 列宽为 50px */}
                  <td style={{ width: "120px", textAlign: "center" }}>
                    {row.name}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontSize: "clamp(10px, 1vw, 16px)", // 动态调整字体大小
                      width: "100%", // 允许宽度填充
                      color: "#a8a8a8",
                    }}
                  >
                    {row.vol0}
                  </td>
                  {/* 固定 name 列宽为 80px */}
                  <td
                    style={{
                      textAlign: "center",
                      fontSize: "clamp(10px, 1vw, 16px)", // 动态调整字体大小
                      width: "100%", // 允许宽度填充
                      color: "#a8a8a8",
                    }}
                  >
                    {row.vol}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      fontSize: "clamp(10px, 1vw, 16px)", // 动态调整字体大小
                      width: "100%", // 允许宽度填充
                      color: "#a8a8a8",
                    }}
                  >
                    {row.vol2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default PointsRebate;
