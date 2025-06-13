import React, { useState, useEffect, useRef } from "react";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { bls12_381 } from "@noble/curves/bls12-381";
// import { updatapoint } from "../pointfunction";
// @ts-ignore
import suilogo from "../assets/suilogo8.svg";
// @ts-ignore
import usdclogo from "../assets/usdclogo.svg";
// @ts-ignore
import viplogo from "../assets/vip.gif";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  getFullnodeUrl,
  SuiClient,
  SuiHTTPTransport,
} from "@mysten/sui.js/client";

const MINcoin = 10000;
const MAXcoin = 1000000000000000;
const neting = "mainnet";
const Package_Te =
  "0x5379778ca89cb2c375718776cf152b9e407530fa3d7c58f0c83276bd8b076a32";
const Package_TeenPatti =
  "0x5379778ca89cb2c375718776cf152b9e407530fa3d7c58f0c83276bd8b076a32::brag::";
const Gamedata =
  "0xf6ea769b52a4935174ad3813b99ac583fefb823033b62b112c6e79134ea92e8c";
const Gamedata_USDC =
  "0x68ea08020885dca9930e56fbcf33f7803886e6f5ffb11e9a17c47d5709b0804e";
const CoinSui = "0x2::sui::SUI";
const CoinUsdc =
  "0xdacf78cf79c12c8fd19f45d4ee37634523836995c63b67e2b9d79ee188012aab::usdc::USDC";
const NFTOB =
  "0xf960a968fcbaf25d69cdaf53db17cab5fd1070a047468244311fe53abbf46194::my_hero::Hero";
const clockob = "0x6";

const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });

// @ts-ignore
import bjt from "../assets/TeenPattibj.jpg"; // Import your background image
// @ts-ignore
import chips from "../assets/chips.png"; // Import your background image
// @ts-ignore
import a0 from "../assets/pokerpng/0.png"; // Import your background image
// @ts-ignore
import C1 from "../assets/pokerpng/1C.png";
// @ts-ignore
import D1 from "../assets/pokerpng/1D.png";
// @ts-ignore
import H1 from "../assets/pokerpng/1H.png";
// @ts-ignore
import S1 from "../assets/pokerpng/1S.png";
// @ts-ignore
import C2 from "../assets/pokerpng/2C.png";
// @ts-ignore
import D2 from "../assets/pokerpng/2D.png";
// @ts-ignore
import H2 from "../assets/pokerpng/2H.png";
// @ts-ignore
import S2 from "../assets/pokerpng/2S.png";
// @ts-ignore
import C3 from "../assets/pokerpng/3C.png";
// @ts-ignore
import D3 from "../assets/pokerpng/3D.png";
// @ts-ignore
import H3 from "../assets/pokerpng/3H.png";
// @ts-ignore
import S3 from "../assets/pokerpng/3S.png";
// @ts-ignore
import C4 from "../assets/pokerpng/4C.png";
// @ts-ignore
import D4 from "../assets/pokerpng/4D.png";
// @ts-ignore
import H4 from "../assets/pokerpng/4H.png";
// @ts-ignore
import S4 from "../assets/pokerpng/4S.png";
// @ts-ignore
import C5 from "../assets/pokerpng/5C.png";
// @ts-ignore
import D5 from "../assets/pokerpng/5D.png";
// @ts-ignore
import H5 from "../assets/pokerpng/5H.png";
// @ts-ignore
import S5 from "../assets/pokerpng/5S.png";
// @ts-ignore
import C6 from "../assets/pokerpng/6C.png";
// @ts-ignore
import D6 from "../assets/pokerpng/6D.png";
// @ts-ignore
import H6 from "../assets/pokerpng/6H.png";
// @ts-ignore
import S6 from "../assets/pokerpng/6S.png";
// @ts-ignore
import C7 from "../assets/pokerpng/7C.png";
// @ts-ignore
import D7 from "../assets/pokerpng/7D.png";
// @ts-ignore
import H7 from "../assets/pokerpng/7H.png";
// @ts-ignore
import S7 from "../assets/pokerpng/7S.png";
// @ts-ignore
import C8 from "../assets/pokerpng/8C.png";
// @ts-ignore
import D8 from "../assets/pokerpng/8D.png";
// @ts-ignore
import H8 from "../assets/pokerpng/8H.png";
// @ts-ignore
import S8 from "../assets/pokerpng/8S.png";
// @ts-ignore
import C9 from "../assets/pokerpng/9C.png";
// @ts-ignore
import D9 from "../assets/pokerpng/9D.png";
// @ts-ignore
import H9 from "../assets/pokerpng/9H.png";
// @ts-ignore
import S9 from "../assets/pokerpng/9S.png";
// @ts-ignore
import C10 from "../assets/pokerpng/10C.png";
// @ts-ignore
import D10 from "../assets/pokerpng/10D.png";
// @ts-ignore
import H10 from "../assets/pokerpng/10H.png";
// @ts-ignore
import S10 from "../assets/pokerpng/10S.png";
// @ts-ignore
import C11 from "../assets/pokerpng/11C.png";
// @ts-ignore
import D11 from "../assets/pokerpng/11D.png";
// @ts-ignore
import H11 from "../assets/pokerpng/11H.png";
// @ts-ignore
import S11 from "../assets/pokerpng/11S.png";
// @ts-ignore
import C12 from "../assets/pokerpng/12C.png";
// @ts-ignore
import D12 from "../assets/pokerpng/12D.png";
// @ts-ignore
import H12 from "../assets/pokerpng/12H.png";
// @ts-ignore
import S12 from "../assets/pokerpng/12S.png";
// @ts-ignore
import C13 from "../assets/pokerpng/13C.png";
// @ts-ignore
import D13 from "../assets/pokerpng/13D.png";
// @ts-ignore
import H13 from "../assets/pokerpng/13H.png";
// @ts-ignore
import S13 from "../assets/pokerpng/13S.png";

let GlbPcardsID = 0;
let GlbDcardsID = 0;
let GlbDatatime = null;
let GlbStage = null;

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
  return `https://cryptopunks.app/public/images/cryptopunks/punk${num2}.png`;
}
function shortAddress(str) {
  if (str.length <= 16) {
    return str; // 如果字符串长度小于或等于16，直接返回原字符串
  }
  let start = str.slice(0, 8); // 取前8位
  let end = str.slice(-8); // 取后8位
  return `${start}....${end}`;
}

function removeDuplicatesByKey(array, key) {
  const seen = new Set();
  return array.filter((item) => {
    const duplicate = seen.has(item[key]);
    seen.add(item[key]);
    return !duplicate;
  });
}

function removeMatchingRows(table1, table2) {
  // 遍历表二的每一行
  table2.forEach((table2Row) => {
    // 在表一中查找是否存在与表二相同的a，并且time较小的行
    table1 = table1.filter((table1Row) => {
      return !(
        table1Row.num === table2Row.num && table1Row.time < table2Row.time
      );
    });
  });

  return table1;
}
interface RoomList {
  time: number;
  num: number;
  vol: number;
  maxvol: number;
  bo: number;
  cointype: string;
}

async function queryRoom(type) {
  try {
    let res: any = await client.queryEvents({
      query: {
        MoveEventType: `${Package_TeenPatti}GnumberOpen<${type}>`,
      },
      limit: 120,
    });

    let list: RoomList[] = [];

    for (var key in res.data) {
      let dict = {} as RoomList;
      dict.time = parseInt(res.data[key]["timestampMs"], 10);
      dict.num = parseInt(res.data[key]["parsedJson"]["result"], 10);
      dict.vol = parseInt(res.data[key]["parsedJson"]["vol"], 10);
      dict.maxvol = parseInt(res.data[key]["parsedJson"]["maxvol"], 10);
      dict.bo = 0; //0是新建房，1是继续游戏的房
      dict.cointype = type;
      list.push(dict);
    }

    let res1: any = await client.queryEvents({
      query: {
        MoveEventType: `${Package_TeenPatti}GnumberCont<${type}>`,
      },
      limit: 120,
    });

    let list1: RoomList[] = [];
    for (var key in res1.data) {
      let dict = {} as RoomList;
      dict.time = parseInt(res1.data[key]["timestampMs"], 10);
      dict.num = parseInt(res1.data[key]["parsedJson"]["result"], 10);
      dict.vol = parseInt(res1.data[key]["parsedJson"]["vol"], 10);
      dict.maxvol = 0;
      dict.bo = 1; //0是新建房，1是继续游戏的房
      dict.cointype = type;
      list1.push(dict);
    }

    const list11 = [...list1, ...list];
    list11.sort((a, b) => b.time - a.time);

    const uniqueList1 = removeDuplicatesByKey(list11, "num");

    let res2: any = await client.queryEvents({
      query: {
        MoveEventType: `${Package_TeenPatti}GnumberClose<${type}>`,
      },
      limit: 120,
    });
    let list2: RoomList[] = [];

    for (var key in res2.data) {
      let dict2 = {} as RoomList;
      dict2.time = parseInt(res2.data[key]["timestampMs"], 10);
      dict2.num = parseInt(res2.data[key]["parsedJson"]["result"], 10);
      dict2.vol = 0;
      dict2.maxvol = 0;
      dict2.bo = 0; //0是新建房，1是继续游戏的房
      dict2.cointype = type;
      list2.push(dict2);
    }
    // 找到 list_B 中最小的 num 值
    const minNumB = Math.min(...list2.map((item) => item.num));
    const uniqueList = uniqueList1.slice(0, 10);

    // 过滤 list_A，删除 num 小于 list_B 中最小 num 的元素
    // const filteredListA = uniqueList.filter((item) => item.num >= minNumB);
    // console.log("4", filteredListA)
    const list23 = removeMatchingRows(uniqueList, list2);

    const list8 = list23.slice(0, 8);

    return list8;
  } catch (error) {
    console.error("Error querying events:", error);
    let list: RoomList[] = [];
    return list;
  }
}
function getRandomKey() {
  const hexChars = "0123456789abcdef";
  let privateKey = "";

  for (let i = 0; i < 64; i++) {
    // 每次随机选择一个十六进制字符并添加到私钥字符串中
    privateKey += hexChars[Math.floor(Math.random() * 16)];
  }

  return privateKey;
}

function getRandomPoker() {
  // 创建 1 到 52 的数组
  let firstPart = Array.from({ length: 52 }, (_, i) => i + 1);
  let secondPart = Array.from({ length: 52 }, (_, i) => i);

  // 打乱数组的顺序（Fisher-Yates Shuffle 算法）
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  // 打乱前 52 个数字
  firstPart = shuffle(firstPart);

  // 打乱 0 到 51 的数组，并截取前 3 个元素，然后排序
  secondPart = shuffle(secondPart)
    .slice(0, 3)
    .sort((a, b) => a - b);

  // 将前 52 个数字和后 3 个数字合并
  const fullList = [...firstPart, ...secondPart];

  return fullList;
}

//...................................删除21点的.......................................

// 定义牌字典的类型
interface StringMap {
  [key: string]: string;
}

interface AProps {
  onGetbalan: () => void; // 定义 props 类型
}

async function getCointype(addr, Cointype) {
  try {
    const { data: coins } = await client.getCoins({
      owner: addr,
      coinType: Cointype,
    });
    return coins;
  } catch (error) {
    console.error("Error callGetGamePlayerAndDiv:", error);
  }
}

// 定义牌字典
const cardDictionary: StringMap = {
  "0": a0,
  "1C": C1,
  "1D": D1,
  "1H": H1,
  "1S": S1,
  "2C": C2,
  "2D": D2,
  "2H": H2,
  "2S": S2,
  "3C": C3,
  "3D": D3,
  "3H": H3,
  "3S": S3,
  "4C": C4,
  "4D": D4,
  "4H": H4,
  "4S": S4,
  "5C": C5,
  "5D": D5,
  "5H": H5,
  "5S": S5,
  "6C": C6,
  "6D": D6,
  "6H": H6,
  "6S": S6,
  "7C": C7,
  "7D": D7,
  "7H": H7,
  "7S": S7,
  "8C": C8,
  "8D": D8,
  "8H": H8,
  "8S": S8,
  "9C": C9,
  "9D": D9,
  "9H": H9,
  "9S": S9,
  "10C": C10,
  "10D": D10,
  "10H": H10,
  "10S": S10,
  "11C": C11,
  "11D": D11,
  "11H": H11,
  "11S": S11,
  "12C": C12,
  "12D": D12,
  "12H": H12,
  "12S": S12,
  "13C": C13,
  "13D": D13,
  "13H": H13,
  "13S": S13,
};

const cardType = [
  "High Card",
  "Pair",
  "Flush",
  "Straight",
  "Straight Flush",
  "Three of a Kind",
];

function getCardsType(cards) {
  const sui = ["H", "S", "C", "D"];
  if (cards.length !== 3) {
    console.log("Exactly three cards must be provided.");
  }

  // 提取花色和点数
  const suits = cards.map((card) => (card - 1) % 4);
  const suit = suits.map((card) => sui[card]);
  const values = cards.map((card) => Math.floor((card - 1) / 4) + 1);

  // 检查是否是豹子 (三张相同的牌)
  if (values[0] === values[1] && values[1] === values[2]) {
    return [values, suit, 5];
  }

  // 对点数进行排序
  values.sort((a, b) => a - b);

  // 检查是否是同花 (三张牌的花色相同)
  const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

  // 检查是否是顺子 (点数连续)
  const isStraight =
    (values[2] - values[0] === 2 && values[2] - values[1] === 1) ||
    (values[0] === 1 && values[1] === 12 && values[2] === 13); // A, Q, K

  // 检查是否是同花顺 (同花且顺子)
  if (isFlush && isStraight) {
    return [values, suit, 4];
  }

  // 检查是否是顺子 (顺子)
  if (isStraight) {
    return [values, suit, 3];
  }

  // 检查是否是清一色 (同花)
  if (isFlush) {
    return [values, suit, 2];
  }

  // 检查是否是对子 (两张相同的牌)
  if (
    values[0] === values[1] ||
    values[1] === values[2] ||
    values[0] === values[2]
  ) {
    return [values, suit, 1];
  }

  // 高牌 (其他情况)
  return [values, suit, 0];
}
// 定义列表项类型
interface ListItem {
  id: number;
  text: string;
  x: number;
  y: number;
  initialX: number;
  initialY: number;
  hasMoved: boolean; // 用于跟踪元素是否已移动
}

const TeenPatti: React.FC<AProps> = ({ onGetbalan }) => {
  // 游戏结束必须初始化的：.... ......

  // 前面的是21点的不用的删除：.... .......................................................
  const [looksui, setLooksui] = useState(true);
  const [actionAndResultP, setActionAndResultP] = useState("");
  const [actionAndResultD, setActionAndResultD] = useState("");
  const [typecards, setTypecards] = useState("");
  const [winAndBlindP, setWinAndBlindP] = useState("");
  const [winAndBlindD, setWinAndBlindD] = useState("");

  const [avatarP1, setAvatarP1] = useState("https://i.imgur.com/q2BJwpV.png");
  const [AddbetP1, setAddbetP1] = useState(0);
  const [CountdownP1, setCountdownP1] = useState(0);
  const [addrP1, setAddrP1] = useState("0x0");
  const [avatarD1, setAvatarD1] = useState("https://i.imgur.com/q2BJwpV.png");
  const [AddbetD1, setAddbetD1] = useState(0);
  const [CountdownD1, setCountdownD1] = useState(0);
  const [addrD1, setAddrD1] = useState("0x0");

  const [beforegame1, setBeforegame1] = useState(true);
  const [beforegame2, setBeforegame2] = useState(true);

  const [itemsd, setItemsd] = useState<ListItem[]>([]);
  const [itemsp, setItemsp] = useState<ListItem[]>([]);

  const [lookCard, setLookCard] = useState(false);

  const [ante, setAnte] = useState(1);
  const [maxbet, setMaxbet] = useState(10);
  const [decimals, setDecimals] = useState(1e9);
  const [selected, setSelected] = useState<"sui" | "usdc">("sui");
  const [max_vol, setMaxvol] = useState(0);
  const [kiosk, setKiosk] = useState(
    "0x26566773fe7347af393bbf8fd6937d1169b04fd2f5789125685c0291cf422569"
  );
  const [nftid, setNftid] = useState(
    "0x1029dccf8c62758943619ae5f44976340319504de1330087f77e4b4b2bccc22e"
  );
  const [betsui, setBetsui] = useState(1);
  const [betsuiVol, setBetsuiVol] = useState(1);

  const [betShow, setBetShow] = useState(1);
  const [betCall, setBetCall] = useState(1);
  const [betRasie, setBetRasie] = useState(1);

  const [lookCarditemsp, setLookCarditemsp] = useState([]);

  const [stage, setStage] = useState(0);
  const [keep, setKeep] = useState(false);

  //按钮类.........lookcard..........time.......stage..................................................................

  const [apply_look_cards, setApply_look_cards] = useState(true);
  const [reveal_look_cards, setReveal_look_cards] = useState(false);
  const [callBut, setCallBut] = useState(true);
  const [rasie, setRasie] = useState(true);
  const [applyOpenCards, setApplyOpenCards] = useState(true);
  const [OpenCards, setOpenCards] = useState(false);
  const [fold, setFold] = useState(true);
  const [get_fold_bets, setGet_fold_bets] = useState(false);
  const [get_timeout_bets, setGet_timeout_bets] = useState(false);

  //按钮类.................................................................^^^^^^...........................
  const [iputRoomNum, setIputRoomNum] = useState(0);
  const [roomNum, setRoomNum] = useState(0);

  const [randomKey, setRandomKey] = useState(() => {
    const saved = localStorage.getItem("randomKey");
    return saved !== null ? JSON.parse(saved) : ""; // 默认值为 true
  });

  const [randomPoker, setRandomPoker] = useState(() => {
    const saved = localStorage.getItem("randomPoker");
    return saved !== null ? JSON.parse(saved) : []; // 默认值为 true
  });

  const [itemsRoom, setItemsRoom] = useState<RoomList[]>([]);

  const account = useCurrentAccount();

  // useEffect(() => {
  //   console.log("AddbetP1 updated:", AddbetD1);
  // }, [AddbetD1]);

  function InitAll() {
    handleMoveAndClear();
    setBeforegame1(true);
    setBeforegame2(true);
    setAddbetP1(0);
    setCountdownP1(0);
    setAddbetD1(0);
    setAvatarD1("https://i.imgur.com/q2BJwpV.png");
    setRoomNum(0);
    setCountdownD1(0);
    setAddrD1("0x0");
    setLookCard(false);
    setKeep(false);
    setBetsuiVol(1);
    setMaxvol(0);

    setActionAndResultP("");
    setActionAndResultD("");
    setWinAndBlindD("");
    setWinAndBlindP("");
    setLookCarditemsp([]);
    setStage(0);

    setTypecards("");
  }

  // function test() {
  //   const crds = Uint8Array.from(randomPoker);
  //   const pkey = bls12_381.getPublicKey(randomKey);
  //   console.log(crds);
  //   console.log(pkey);
  // }

  function dealingCards() {
    setItemsp([]);
    setItemsd([]);
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        handleClickP(0, i, "H");
        handleClickD(0, i, "H");
      }, 500 * i); // i * 500 毫秒的延迟
    }
  }

  const { mutateAsync: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  async function getRoomlist() {
    //setItemsRoom([]);
    const [roomlist_USDC, roomlist_Sui] = await Promise.all([
      queryRoom(CoinUsdc),
      queryRoom(CoinSui),
    ]);
    const roomlist = [...roomlist_Sui, ...roomlist_USDC];
    if (
      roomlist.length !== itemsRoom.length ||
      roomlist.some(
        (item, idx) => JSON.stringify(item) !== JSON.stringify(itemsRoom[idx])
      )
    ) {
      setItemsRoom(roomlist);
    }
  }

  async function getKioskNFT(address: string) {
    // ① 关键：这里用 owner 而不是 addr
    const { data: caps } = await client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: "0x2::kiosk::KioskOwnerCap", // 只拉 KioskOwnerCap
      },
      options: { showContent: true }, // 要拿 fields
    });
    if (caps.length > 0) {
      for (let i = 0; i < caps.length; i++) {
        // @ts-ignore: 我知道这可能会出错，先跳过检查
        const kioskID = caps[i].data.content.fields.for; // i 是索引，caps[i] 是元素.fields?.for
        const suiAfter = await client.getDynamicFields({ parentId: kioskID });
        if (suiAfter.data && suiAfter.data.length > 0) {
          console.log(suiAfter.data.length);
          console.log(suiAfter.data);
          for (let y = 0; y < caps.length; y++) {
            if (suiAfter.data[y].objectType == NFTOB) {
              console.log("VIP")
            }
          }
        }
      }
    }
  }

  function rasieADD() {
    let num = Math.floor(betRasie + 1);
    const max = MAXcoin / decimals;

    if (lookCard) {
      if (num > max * 2) {
        num = max * 2;
      }
    } else {
      if (num > max) {
        num = max;
      }
    }
    setBetRasie(num);
  }

  function rasieDoule() {
    let num = Math.floor(betRasie * 2);
    const max = MAXcoin / decimals;

    if (lookCard) {
      if (num > max * 2) {
        num = max * 2;
      }
    } else {
      if (num > max) {
        num = max;
      }
    }

    setBetRasie(num);
  }
  function rasieReduce() {
    const num = Math.floor(betRasie - 1);
    if (num > betCall) {
      setBetRasie(num);
    }
  }

  function anteADD() {
    let num = ante + 1;
    const max = MAXcoin / decimals;
    if (num > max) {
      num = max;
    }

    setAnte(num);

    setBetsuiVol(num);
  }

  function anteDoule() {
    let num = ante * 2;
    const max = MAXcoin / decimals;
    if (num > max) {
      num = max;
    }

    setAnte(num);
    setBetsuiVol(num);
  }

  function anteReduce() {
    if (ante > 1) {
      const num = ante - 1;
      setAnte(num);
      setBetsuiVol(num);
    }
  }

  function MAXbetReduce() {
    if (maxbet > 1) {
      const num = maxbet - 1;
      setMaxbet(num);
    }
  }

  function MAXbetADD() {
    let num = maxbet + 1;
    setMaxbet(num);
  }

  function MAXbetDoule() {
    let num = maxbet * 2;
    setMaxbet(num);
  }

  function gettRandomKey() {
    const data = getRandomKey();
    if (data != randomKey) {
      setRandomKey(data);
      return data;
    } else {
      window.alert("Random failure, please refresh the page!");
      return data;
    }
  }

  function gettRandomPoker() {
    const data = getRandomPoker();
    if (data != randomPoker) {
      setRandomPoker(data);
      return data;
    } else {
      window.alert("Random failure, please refresh the page!");
      return data;
    }
  }

  useEffect(() => {
    if (CountdownP1 > 0) {
      const timerId = setTimeout(() => setCountdownP1(CountdownP1 - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [CountdownP1]);
  useEffect(() => {
    if (CountdownD1 > 0) {
      const timerId = setTimeout(() => setCountdownD1(CountdownD1 - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [CountdownD1]);

  function getAction(bSui, data) {
    if (bSui != Number(data.bet)) {
      return "Rasie";
    } else if (data.stage == 6) {
      return "Apply see cards";
    } else if (data.stage < 4) {
      return "Call";
    } else if (data.stage == 4) {
      return "Request a showdown";
    } else if (data.stage == 5) {
      return "Fold";
    } else {
      return "";
    }
  }

  const beforegame2Ref = useRef(beforegame2);
  const beforegame1Ref = useRef(beforegame1);
  const AddbetP1Ref = useRef(AddbetP1);
  const addrD1Ref = useRef(addrD1);
  const AddbetD1Ref = useRef(AddbetD1);
  const anteRef = useRef(ante);
  const betsuiRef = useRef(betsui);
  const winAndBlindDRef = useRef(winAndBlindD);

  useEffect(() => {
    if (lookCard && lookCarditemsp.length == 3 && randomPoker.length > 0) {
      const type = lookSeeCrads(lookCarditemsp, randomPoker);
      setWinAndBlindP(type);
    }
  }, [lookCard, lookCarditemsp, randomPoker]);

  function lookSeeCrads(listC, pokers) {
    let listB: number[] = [];
    for (let i = 0; i < 3; i++) {
      const number1 = pokers[listC[i]]; // 将字符转换为数字
      listB.push(number1); // 将数字加入数组
    }
    const [values, suit, type] = getCardsType(listB);

    const ToUpdate = GlbPcardsID - 2;
    for (let i = 0; i < 3; i++) {
      let idToUpdate = i + ToUpdate;
      let pks = `${values[i]}${suit[i]}`;
      setItemsp((prevItems) =>
        prevItems.map((item) =>
          item.id === idToUpdate ? { ...item, text: pks } : item
        )
      );
    }
    return cardType[type];
  }

  useEffect(() => {
    beforegame2Ref.current = beforegame2;
    beforegame1Ref.current = beforegame1;
    AddbetP1Ref.current = AddbetP1;
    AddbetD1Ref.current = AddbetD1;
    addrD1Ref.current = addrD1;
    anteRef.current = ante;
    betsuiRef.current = betsui;
    winAndBlindDRef.current = winAndBlindD;

    if (
      (winAndBlindD == "Blind" || winAndBlindD == "Seen") &&
      !beforegame1 &&
      !beforegame2 &&
      CountdownD1 <= 0 &&
      CountdownP1 == 0
    ) {
      setGet_timeout_bets(true);
    } else {
      setGet_timeout_bets(false); //试试
    }
    if (ante > maxbet) {
      setMaxbet(ante);
    }
  }, [
    beforegame2,
    beforegame1,
    AddbetP1,
    AddbetD1,
    addrD1,
    ante,
    betsui,
    winAndBlindD,
    CountdownD1,
    CountdownP1,
  ]);

  function SetButtonState(stage, leng) {
    if (stage == 6) {
      setApply_look_cards(false);
      setReveal_look_cards(true);
      setCallBut(false);
      setRasie(false);
      setApplyOpenCards(false);
      setOpenCards(false);
      setFold(false);
      setGet_fold_bets(false);
      setGet_timeout_bets(false);
    } else if (stage == 5) {
      setApply_look_cards(false);
      setReveal_look_cards(false);
      setCallBut(false);
      setRasie(false);
      setApplyOpenCards(false);
      setOpenCards(false);
      setFold(false);
      setGet_fold_bets(true);
      setGet_timeout_bets(false);
    } else if (stage == 4) {
      setApply_look_cards(false);
      setReveal_look_cards(false);
      setCallBut(false);
      setRasie(false);
      setApplyOpenCards(false);
      setOpenCards(true);
      setFold(false);
      setGet_fold_bets(false);
      setGet_timeout_bets(false);
    } else if (stage < 4) {
      setReveal_look_cards(false);
      setCallBut(true);
      setRasie(true);
      setApplyOpenCards(true);
      setOpenCards(false);
      setFold(true);
      setGet_fold_bets(false);
      setGet_timeout_bets(false);
      if (leng > 1) {
        setApply_look_cards(false);
      } else {
        setApply_look_cards(true);
      }
    }
  }

  function refreshData(data) {
    if (data.time != GlbDatatime || data.stage != GlbStage) {
      GlbDatatime = data.time;
      GlbStage = data.stage;

      let decimal = 1e9;
      if (selected == "usdc") {
        decimal = 1e6;
      }
      setMaxvol(data.max_bet / decimal);

      try {
        if (data.stage > 9) {
          setAddbetD1(0);
          setAddbetP1(0);
          if (data.stage == 10) {
            setBetsuiVol(ante);
            setAddbetP1(ante);
            setAddbetD1(ante);
          }
        }
        const currentTimeInMilliseconds = Date.now();
        let downTime = Math.round(
          (Number(data.time) + 60000 - currentTimeInMilliseconds) / 1000
        );
        if (downTime < 0) {
          downTime = -1;
        }
        if (
          account &&
          !beforegame2Ref.current &&
          !beforegame1Ref.current &&
          data.stage > 10 &&
          winAndBlindDRef.current != ""
        ) {
          if (data.player1 == account.address) {
            if (data.stage == 11) {
              setWinAndBlindP("WIN");
              setWinAndBlindD("LOSE");
            } else if (data.stage == 12) {
              setWinAndBlindP("LOSE");
              setWinAndBlindD("WIN");
            }
          } else if (data.player2 == account.address) {
            if (data.stage == 12) {
              setWinAndBlindP("WIN");
              setWinAndBlindD("LOSE");
            } else if (data.stage == 11) {
              setWinAndBlindP("LOSE");
              setWinAndBlindD("WIN");
            }
          }
        }
        if (
          account &&
          !beforegame2Ref.current &&
          !beforegame1Ref.current &&
          data.stage < 10
        ) {
          let decimal = 1e9;
          if (selected == "usdc") {
            decimal = 1e6;
          }
          const ban = Number(data.balance) / decimal;
          const suibet = Number(data.bet);
          setBetsuiVol(ban);
          if (betsuiRef.current != suibet) {
            setBetsui(suibet);
          }

          const addBan = ban - AddbetP1Ref.current - AddbetD1Ref.current;

          if (data.player1 == account.address) {
            if (addrD1Ref.current == "0x0") {
              setAvatarD1(getAvatarURL(data.player2));
              setAddrD1(shortAddress(data.player2));
            }
            if (data.revealcards2.length > 1) {
              if (!lookCard) {
                setLookCard(true);
                setLookCarditemsp(data.revealcards2);
              }
              if (data.revealcards2.length > 10) {
                setLookCarditemsp(data.revealcards2);
              }
            }
            if (!data.action) {
              setCountdownP1(downTime);
              setActionAndResultP("It's your turn");
              SetButtonState(data.stage, data.revealcards2.length);
              setCountdownD1(0);
              const Daction = getAction(betsuiRef.current, data);
              setActionAndResultD(Daction);

              if (addBan > 0) {
                setAddbetD1((prevAnte) => prevAnte + addBan);
              }
            } else {
              setCountdownD1(downTime);
              setCountdownP1(0);

              if (addBan > 0) {
                setAddbetP1((prevAnte) => prevAnte + addBan);
              }
            }
          } else if (data.player2 == account.address) {
            if (addrD1Ref.current == "0x0") {
              setAvatarD1(getAvatarURL(data.player1));
              setAddrD1(shortAddress(data.player1));
            }
            if (data.revealcards1.length > 1) {
              if (!lookCard) {
                setLookCard(true);
                setLookCarditemsp(data.revealcards1);
              }
              if (data.revealcards1.length > 10) {
                setLookCarditemsp(data.revealcards1);
              }
            }
            if (data.action) {
              setCountdownP1(downTime);
              setActionAndResultP("It's your turn");
              SetButtonState(data.stage, data.revealcards1.length);
              setCountdownD1(0);
              const Daction = getAction(betsuiRef.current, data);
              setActionAndResultD(Daction);
              // console.log(100000004);
              if (addBan > 0) {
                setAddbetD1((prevAnte) => prevAnte + addBan);
              }
            } else {
              setCountdownD1(downTime);
              setCountdownP1(0);

              // console.log(100000005);
              if (addBan > 0) {
                setAddbetP1((prevAnte) => prevAnte + addBan);
              }
            }
          }
        }
        if (
          beforegame2Ref.current &&
          data.sigcards2.length > 0 &&
          data.sigcards1.length > 0 &&
          account &&
          !beforegame1Ref.current &&
          data.stage < 10
        ) {
          setBeforegame2(false);
          setAddbetD1(anteRef.current);
          setBetsui(Number(data.bet));
          setBetsuiVol(Number(data.balance) / decimals);
          dealingCards();
          if (data.player1 == account.address) {
            setAvatarD1(getAvatarURL(data.player2));
            setAddrD1(shortAddress(data.player2));
            setCountdownP1(downTime);
            setActionAndResultP("It's your turn");
            setCountdownD1(0);
            // console.log(88888888);
          } else if (data.player2 == account.address) {
            setAvatarD1(getAvatarURL(data.player1));
            setAddrD1(shortAddress(data.player1));
            setCountdownD1(downTime);
            setCountdownP1(0);

            // console.log(99999999);
          }
        }
      } catch (error) {
        console.log("ERR:refreshData", error);
      }
      setStage(data.stage);
    }
  }
  useEffect(() => {
    let errEoom = 0;
    const fetchData = async () => {
      if (roomNum > 0) {
        if (selected == "sui") {
          try {
            const suiAfter = await client.getDynamicFieldObject({
              parentId: Gamedata,
              name: {
                type: "u64",
                value: String(roomNum),
              },
            });
            const data = JSON.parse(
              // @ts-ignore
              JSON.stringify(suiAfter["data"]["content"]["fields"])
            );
            // console.log(data);
            // console.log(data.sigcards1[0]);

            refreshData(data);
          } catch (error) {
            errEoom = errEoom + 1;
            if (errEoom > 6) {
              setRoomNum(0);
              errEoom = 0;
            }
            console.error("Error:", error);
          }
        } else {
          try {
            const suiAfter = await client.getDynamicFieldObject({
              parentId: Gamedata_USDC,
              name: {
                type: "u64",
                value: String(roomNum),
              },
            });
            const data = JSON.parse(
              // @ts-ignore
              JSON.stringify(suiAfter["data"]["content"]["fields"])
            );
            // console.log(data);
            // console.log(data.sigcards1[0]);

            refreshData(data);
          } catch (error) {
            errEoom = errEoom + 1;
            if (errEoom > 6) {
              setRoomNum(0);
              errEoom = 0;
            }
            console.error("Error:", error);
          }
        }
      }
    };

    fetchData(); // 初始调用

    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId); // 清理定时器
  }, [roomNum, account?.address, lookCard]);

  useEffect(() => {
    if (!account?.address) return;

    const intervalId = setInterval(() => {
      onGetbalan();
    }, 3500);

    return () => clearInterval(intervalId);
  }, [account?.address]);

  useEffect(() => {
    if (roomNum > 0) {
      setIputRoomNum(roomNum);
    }
  }, [roomNum]);
  useEffect(() => {
    if (lookCard) {
      setBetCall(betsui / decimals);
      setBetShow((betsui * 2) / decimals);
      setBetRasie(betsui / decimals);
    } else {
      const vol = parseFloat((betsui / (2 * decimals)).toFixed(2));
      setBetCall(vol);
      setBetShow(vol * 2);
      setBetRasie(vol);
    }
  }, [betsui, lookCard]);

  useEffect(() => {
    localStorage.setItem("randomKey", JSON.stringify(randomKey));
  }, [randomKey]);
  useEffect(() => {
    localStorage.setItem("randomPoker", JSON.stringify(randomPoker));
  }, [randomPoker]);

  useEffect(() => {
    if (account) {
      setAvatarP1(getAvatarURL(account.address));
      setAddrP1(shortAddress(account.address));
      getKioskNFT(account.address);
    }
  }, [account?.address]);
  useEffect(() => {
    // 组件挂载时先执行一次
    getRoomlist();

    // 每5秒执行一次
    const intervalId = setInterval(() => {
      getRoomlist();
    }, 5000);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []); // 空依赖数组确保这个 effect 只在组件挂载时运行一次

  useEffect(() => {
    if (selected == "usdc") {
      setDecimals(1e6);
    } else {
      setDecimals(1e9);
    }
  }, [selected]); // 空依赖数组确保这个 effect 只在组件挂载时运行一次

  useEffect(() => {
    // 在 useEffect 内部定义一个异步函数
    const fetchData = async () => {
      try {
        if (stage != 10 && stage != 4) {
          const result = await chaxunjieguo(); // 调用异步函数并等待结果
          if (result && account) {
            const [jieguo, addr] = result;

            if (
              jieguo != null &&
              jieguo != undefined &&
              lookCarditemsp.length > 10
            ) {
              let listOpen: number[] = [];
              let lisApp: number[] = [];
              for (let i = 0; i < 3; i++) {
                if (addr != account.address) {
                  const number1 = jieguo[randomPoker[i + 52]]; // 将字符转换为数字
                  listOpen.push(Number(number1)); // 将数字加入数组
                  const number2 = randomPoker[jieguo[i + 52]]; // 将字符转换为数字
                  lisApp.push(number2); // 将数字加入数组}
                } else {
                  const number1 = randomPoker[lookCarditemsp[i + 52]]; // 将字符转换为数字
                  listOpen.push(Number(number1)); // 将数字加入数组
                  const number2 = lookCarditemsp[randomPoker[i + 52]]; // 将字符转换为数字
                  lisApp.push(number2); // 将数字加入数组}
                }
              }
              const [valuesO, suitO, typeO] = getCardsType(listOpen);
              const [valuesA, suitA, typeA] = getCardsType(lisApp);
              getWin(
                account?.address,
                addr,
                valuesO,
                suitO,
                typeO,
                valuesA,
                suitA,
                typeA
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (stage > 10 && !keep) {
      setKeep(true);
      setCountdownD1(0);
      setCountdownP1(0);
      fetchData();
    }
  }, [stage, roomNum, randomPoker, account?.address, lookCard, lookCarditemsp]);

  function initbutton() {
    setApply_look_cards(true);
    setReveal_look_cards(false);
    setCallBut(true);
    setRasie(true);
    setApplyOpenCards(true);
    setOpenCards(false);
    setFold(true);
    setGet_fold_bets(false);
    setGet_timeout_bets(false);
  }

  function getWin(account, addr, valuesO, suitO, typeO, valuesA, suitA, typeA) {
    if (account == addr) {
      setActionAndResultP(cardType[typeO]);
      setActionAndResultD(cardType[typeA]);

      const ToUpdate = GlbPcardsID - 2;
      for (let i = 0; i < 3; i++) {
        let idToUpdate = i + ToUpdate;
        let pks = `${valuesO[i]}${suitO[i]}`;
        setItemsp((prevItems) =>
          prevItems.map((item) =>
            item.id === idToUpdate ? { ...item, text: pks } : item
          )
        );
      }
      const ToUpdate1 = GlbDcardsID - 2;
      for (let i = 0; i < 3; i++) {
        let idToUpdate = i + ToUpdate1;
        let pks = `${valuesA[i]}${suitA[i]}`;
        setItemsd((prevItems) =>
          prevItems.map((item) =>
            item.id === idToUpdate ? { ...item, text: pks } : item
          )
        );
      }
    } else {
      setActionAndResultP(cardType[typeA]);
      setActionAndResultD(cardType[typeO]);

      const ToUpdate = GlbPcardsID - 2;
      for (let i = 0; i < 3; i++) {
        let idToUpdate = i + ToUpdate;
        let pks = `${valuesA[i]}${suitA[i]}`;
        setItemsp((prevItems) =>
          prevItems.map((item) =>
            item.id === idToUpdate ? { ...item, text: pks } : item
          )
        );
      }
      const ToUpdate1 = GlbDcardsID - 2;
      for (let i = 0; i < 3; i++) {
        let idToUpdate = i + ToUpdate1;
        let pks = `${valuesO[i]}${suitO[i]}`;
        setItemsd((prevItems) =>
          prevItems.map((item) =>
            item.id === idToUpdate ? { ...item, text: pks } : item
          )
        );
      }
    }
    setRoomNum(0);
  }

  function stringToUint8Array(input) {
    const byteArray: number[] = [];
    for (let i = 0; i < input.length; i++) {
      byteArray[i] = input.charCodeAt(i); // 将每个字符转换为相应的字节值
    }
    return byteArray;
  }

  async function chaxunjieguo() {
    try {
      const suiAfter = await client.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            function: "OpenCards",
            module: "brag",
            package: Package_Te,
          },
        },
      });

      const list = JSON.parse(JSON.stringify(suiAfter.data));

      for (let i = 0; i < list.length; i++) {
        let bianhao = list[i]["digest"];

        const suiAfter2 = await client.getTransactionBlock({
          digest: bianhao,
          options: {
            showInput: true,
          },
        });
        if (suiAfter2.transaction) {
          // 使用 as any 忽略类型检查
          const transactionData = suiAfter2.transaction.data.transaction as any;
          if (Number(transactionData.inputs[1].value) == roomNum) {
            const byteArray = stringToUint8Array(
              transactionData.inputs[2].value
            );

            return [byteArray, suiAfter2.transaction.data.sender];
          }
        }

        if (i > 10) {
          break;
        }
      }
    } catch (error) {
      console.error("Error during transaction query:", error);
    }
  }

  const handleClickP = (cak, newCount, pkColor) => {
    GlbPcardsID = GlbPcardsID + 1;

    let textB = `${0}`;
    if (cak != 0) {
      textB = `${cak}${pkColor}`;
    }
    const newItem = {
      id: GlbPcardsID,
      text: textB,
      x: newCount * 35 - 72, // 生成随机X坐标
      y: 25, // 初始Y坐标
      initialX: 0, // 目标X坐标
      initialY: 0, // 目标Y坐标
      hasMoved: false, // 初始状态为未移动
    };

    setItemsp((prevItems) => [...prevItems, newItem]);

    setTimeout(() => {
      setItemsp((prevItems) =>
        prevItems.map((item) =>
          item.id === newItem.id ? { ...item, hasMoved: true } : item
        )
      );
    }, 50); // 延迟50ms触发移动
  };

  const handleClickD = (cak, newCount, pkColor) => {
    GlbDcardsID = GlbDcardsID + 1;
    let textB = `${0}`;
    if (cak != 0) {
      textB = `${cak}${pkColor}`;
    }

    const newItem = {
      id: GlbDcardsID,
      text: textB,
      x: newCount * 35 - 72, // 生成随机X坐标
      y: 5, // 初始Y坐标
      initialX: 0, // 目标X坐标
      initialY: 0, // 目标Y坐标
      hasMoved: false, // 初始状态为未移动
    };

    setItemsd((prevItems) => [...prevItems, newItem]);

    setTimeout(() => {
      setItemsd((prevItems) =>
        prevItems.map((item) =>
          item.id === newItem.id ? { ...item, hasMoved: true } : item
        )
      );
    }, 50); // 延迟50ms触发移动
    if (newCount == 2) {
      setWinAndBlindD("Blind");
    }
  };

  const handleMoveAndClear = () => {
    const keysToRemove = [GlbDcardsID - 2, GlbDcardsID - 1, GlbDcardsID];
    const keysToRemoveP = [GlbPcardsID - 2, GlbPcardsID - 1, GlbPcardsID];

    setItemsp((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        initialX: 1500, // 目标X位置
        initialY: -350, // 目标Y位置
        hasMoved: true,
      }))
    );

    setItemsd((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        initialX: 1500, // 目标X位置
        initialY: 350, // 目标Y位置
        hasMoved: true,
      }))
    );

    // 设置延迟来清空项的状态
    // setTimeout(() => {
    //   setItemsp((prevItems) =>
    //     prevItems.filter((item) => !keysToRemoveP.includes(item.id))
    //   );
    //   setItemsd((prevItems) =>
    //     prevItems.filter((item) => !keysToRemove.includes(item.id))
    //   );
    // }, 500); // 等待动画完成后清空项
  };

  //交易类...................................................................................
  const transferSui_create_game = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const randomPokerdata = gettRandomPoker();
        const randomKeydata = gettRandomKey();
        const tx = new TransactionBlock();

        const volcoin = ante * decimals;
        const maxbetcoin = maxbet * decimals;

        const signedPokerHash = bls12_381.sign(
          Uint8Array.from(randomPokerdata),
          randomKeydata
        );
        // let publicKey = bls12_381.getPublicKey(randomKey);

        if (volcoin < MINcoin || volcoin > MAXcoin) {
          window.alert(
            "The bet amount does not meet the requirements,min:0.01SUI,MAX:--SUI"
          );
        }

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        let coinObjectId = tx.gas;

        if (selected == "usdc") {
          let coins;
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
          if (account) {
            coins = await getCointype(account.address, CoinUsdc);
          }
          coinObjectId = coins[0].coinObjectId;
          if (coins.length > 1) {
            for (let i = 1; i < coins.length; i++) {
              tx.mergeCoins(tx.object(coins[0].coinObjectId), [
                tx.object(coins[i].coinObjectId),
              ]);
            }
          }
        }

        const [coin] = tx.splitCoins(coinObjectId, [volcoin]);
        const data = tx.object(Gamedatas); //data
        const mykiosk = tx.object(kiosk);

        tx.moveCall({
          target: `${Package_TeenPatti}create_game`,
          typeArguments: [typeArgument],
          arguments: [
            tx.pure(Array.from(signedPokerHash)),
            tx.pure(maxbetcoin),
            coin,
            data,
            mykiosk,
            tx.pure(nftid),
          ],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            // @ts-ignore
            let data = JSON.parse(
              // @ts-ignore
              JSON.stringify(response.events[0]["parsedJson"])
            );
            setRoomNum(parseInt(data["result"]));
            setLooksui(looksui);
            setBeforegame1(false);
            setAddbetP1(ante);
            setLookCard(false);
            setKeep(false);
            initbutton();
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };
  const transferSui_join = async (bet, num, bo, type) => {
    if (looksui) {
      setLooksui(false);

      try {
        const randomPokerdata = gettRandomPoker();
        const randomKeydata = gettRandomKey();
        const tx = new TransactionBlock();
        const clock = tx.object(clockob);

        let join = "join_game";
        if (bo > 0) {
          join = "join_playing";
        }

        const signedPokerHash = bls12_381.sign(
          Uint8Array.from(randomPokerdata),
          randomKeydata
        );
        // let publicKey = bls12_381.getPublicKey(randomKey);

        if (bet < MINcoin || bet > MAXcoin) {
          window.alert(
            "The bet amount does not meet the requirements,min:0.01SUI,MAX:--SUI"
          );
        }

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        let coinObjectId = tx.gas;

        if (type?.toUpperCase().includes("USDC")) {
          let coins;
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
          if (account) {
            coins = await getCointype(account.address, CoinUsdc);
          } else {
            window.alert(`Link wallet to ${neting}!!`);
          }
          coinObjectId = coins[0].coinObjectId;
          if (coins.length > 1) {
            for (let i = 1; i < coins.length; i++) {
              tx.mergeCoins(tx.object(coins[0].coinObjectId), [
                tx.object(coins[i].coinObjectId),
              ]);
            }
          }
          setAnte(bet / 1e6);
        } else {
          setAnte(bet / 1e9);
        }

        const [coin] = tx.splitCoins(coinObjectId, [bet]);
        const data = tx.object(Gamedatas); //data
        const mykiosk = tx.object(kiosk);

        tx.moveCall({
          target: `${Package_TeenPatti}${join}`,
          typeArguments: [typeArgument],
          arguments: [
            tx.pure(num),
            tx.pure(Array.from(signedPokerHash)),
            coin,
            clock,
            data,
            mykiosk,
            tx.pure(nftid),
          ],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            if (type?.toUpperCase().includes("USDC")) {
              setSelected("usdc");
            } else {
              setSelected("sui");
            }

            setLooksui(looksui);
            setBeforegame1(false);
            setBeforegame2(false);
            setRoomNum(num);
            setAddbetP1(ante);
            setLookCard(false);
            setKeep(false);
            initbutton();
            setCountdownD1(59);

            //玩家扑克..............................
            //对手扑克............................
            dealingCards();
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_apply_look_cards = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();

        const clock = tx.object(clockob);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        if (selected == "usdc") {
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
        }
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}apply_look_cards`,
          typeArguments: [typeArgument],
          arguments: [tx.pure(roomNum), clock, data],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });
        if (response.events) {
          if (response.events.length !== 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);

            setActionAndResultP("Apply see cards");
            setApply_look_cards(false);
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_reveal_look_cards = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const cardThree = Uint8Array.from(randomPoker.slice(-3));
        const tx = new TransactionBlock();
        const clock = tx.object(clockob);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        if (selected == "usdc") {
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
        }
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}reveal_look_cards`,
          typeArguments: [typeArgument],
          arguments: [
            tx.pure(roomNum),
            tx.pure(Array.from(cardThree)),
            clock,
            data,
          ],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length !== 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setActionAndResultP("Reveal cards");
            setWinAndBlindD("Seen");
            setReveal_look_cards(false);
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_call = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();
        let bet = 0;
        if (lookCard) {
          bet = betsui;
        } else {
          bet = Math.floor(betsui / 2);
        }
        const clock = tx.object(clockob);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        let coinObjectId = tx.gas;

        if (selected == "usdc") {
          let coins;
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
          if (account) {
            coins = await getCointype(account.address, CoinUsdc);
          }
          coinObjectId = coins[0].coinObjectId;
          if (coins.length > 1) {
            for (let i = 1; i < coins.length; i++) {
              tx.mergeCoins(tx.object(coins[0].coinObjectId), [
                tx.object(coins[i].coinObjectId),
              ]);
            }
          }
        }

        const [coin] = tx.splitCoins(coinObjectId, [bet]);
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}call`,
          typeArguments: [typeArgument],
          arguments: [tx.pure(roomNum), coin, clock, data],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setActionAndResultP("Call");
            // updatapoint(response.digest);
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_rasie = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();
        const bet = betRasie * decimals;
        const clock = tx.object(clockob);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        let coinObjectId = tx.gas;

        if (selected == "usdc") {
          let coins;
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
          if (account) {
            coins = await getCointype(account.address, CoinUsdc);
          }
          coinObjectId = coins[0].coinObjectId;
          if (coins.length > 1) {
            for (let i = 1; i < coins.length; i++) {
              tx.mergeCoins(tx.object(coins[0].coinObjectId), [
                tx.object(coins[i].coinObjectId),
              ]);
            }
          }
        }

        const [coin] = tx.splitCoins(coinObjectId, [bet]);
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}rasie`,
          typeArguments: [typeArgument],
          arguments: [tx.pure(roomNum), coin, clock, data],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setActionAndResultP("Rasie");
            // updatapoint(response.digest);
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_applyOpenCards = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();
        let bet = 0;
        if (lookCard) {
          bet = betsui * 2;
        } else {
          bet = betsui;
        }
        const crds = Uint8Array.from(randomPoker);
        const pkey = bls12_381.getPublicKey(randomKey);
        const clock = tx.object(clockob);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        let coinObjectId = tx.gas;

        if (selected == "usdc") {
          let coins;
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
          if (account) {
            coins = await getCointype(account.address, CoinUsdc);
          }
          coinObjectId = coins[0].coinObjectId;
          if (coins.length > 1) {
            for (let i = 1; i < coins.length; i++) {
              tx.mergeCoins(tx.object(coins[0].coinObjectId), [
                tx.object(coins[i].coinObjectId),
              ]);
            }
          }
        }

        const [coin] = tx.splitCoins(coinObjectId, [bet]);
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}applyOpenCards`,
          typeArguments: [typeArgument],
          arguments: [
            tx.pure(roomNum),
            tx.pure(Array.from(crds)),
            tx.pure(Array.from(pkey)),
            coin,
            clock,
            data,
          ],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setActionAndResultP("Request a showdown");
            setApply_look_cards(false);
            setReveal_look_cards(false);
            setCallBut(false);
            setRasie(false);
            setApplyOpenCards(false);
            setOpenCards(false);
            setFold(false);
            setGet_fold_bets(false);
            setGet_timeout_bets(false);
            setLookCarditemsp(randomPoker);
            // updatapoint(response.digest);
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_OpenCards = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();

        const crds = Uint8Array.from(randomPoker);
        const pkey = bls12_381.getPublicKey(randomKey);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        if (selected == "usdc") {
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
        }

        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}OpenCards`,
          typeArguments: [typeArgument],
          arguments: [
            tx.pure(roomNum),
            tx.pure(Array.from(crds)),
            tx.pure(Array.from(pkey)),
            data,
          ],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setApply_look_cards(false);
            setReveal_look_cards(false);
            setCallBut(false);
            setRasie(false);
            setApplyOpenCards(false);
            setOpenCards(false);
            setFold(false);
            setGet_fold_bets(false);
            setGet_timeout_bets(false);
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };
  const transferSui_fold = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();
        const clock = tx.object(clockob);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        if (selected == "usdc") {
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
        }
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}fold`,
          typeArguments: [typeArgument],
          arguments: [tx.pure(roomNum), clock, data],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length !== 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setActionAndResultP("Fold");
            setApply_look_cards(false);
            setReveal_look_cards(false);
            setCallBut(false);
            setRasie(false);
            setApplyOpenCards(false);
            setOpenCards(false);
            setFold(false);
            setGet_fold_bets(false);
            setGet_timeout_bets(false);
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_get_fold_bets = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();

        const crds = Uint8Array.from(randomPoker);
        const pkey = bls12_381.getPublicKey(randomKey);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        if (selected == "usdc") {
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
        }

        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}get_fold_bets`,
          typeArguments: [typeArgument],
          arguments: [
            tx.pure(roomNum),
            tx.pure(Array.from(crds)),
            tx.pure(Array.from(pkey)),
            data,
          ],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setApply_look_cards(false);
            setReveal_look_cards(false);
            setCallBut(false);
            setRasie(false);
            setApplyOpenCards(false);
            setOpenCards(false);
            setFold(false);
            setGet_fold_bets(false);
            setGet_timeout_bets(false);
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_get_timeout_bets = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();
        const clock = tx.object(clockob);

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        if (selected == "usdc") {
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
        }
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}get_timeout_bets`,
          typeArguments: [typeArgument],
          arguments: [tx.pure(roomNum), clock, data],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setRoomNum(0);
            InitAll();
            getRoomlist();
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_go_on_playing____ = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const randomPokerdata = gettRandomPoker();
        const randomKeydata = gettRandomKey();
        const tx = new TransactionBlock();
        const volcoin = ante * decimals;

        const signedPokerHash = bls12_381.sign(
          Uint8Array.from(randomPokerdata),
          randomKeydata
        );
        // let publicKey = bls12_381.getPublicKey(randomKey);

        if (volcoin < MINcoin || volcoin > MAXcoin) {
          window.alert(
            "The bet amount does not meet the requirements,min:0.01SUI,MAX:--SUI"
          );
        }

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        let coinObjectId = tx.gas;
        if (selected == "usdc") {
          let coins;
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
          if (account) {
            coins = await getCointype(account.address, CoinUsdc);
          }
          coinObjectId = coins[0].coinObjectId;
          if (coins.length > 1) {
            for (let i = 1; i < coins.length; i++) {
              tx.mergeCoins(tx.object(coins[0].coinObjectId), [
                tx.object(coins[i].coinObjectId),
              ]);
            }
          }
        }

        const [coin] = tx.splitCoins(coinObjectId, [volcoin]);
        const data = tx.object(Gamedatas); //data

        tx.moveCall({
          target: `${Package_TeenPatti}go_on_playing`,
          typeArguments: [typeArgument],
          arguments: [
            tx.pure(iputRoomNum),
            tx.pure(Array.from(signedPokerHash)),
            coin,
            data,
          ],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setRoomNum(iputRoomNum);
            setLooksui(looksui);
            setBeforegame1(false);
            setBeforegame2(true);
            setAddbetP1(ante);
            setLookCard(false);
            setKeep(false);
            initbutton();

            //对手扑克............................
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const transferSui_join_playing____ = async () => {
    if (looksui) {
      setLooksui(false);
      try {
        const randomPokerdata = gettRandomPoker();
        const randomKeydata = gettRandomKey();
        const tx = new TransactionBlock();
        const clock = tx.object(clockob);

        const signedPokerHash = bls12_381.sign(
          Uint8Array.from(randomPokerdata),
          randomKeydata
        );
        const bet = ante * decimals;
        // let publicKey = bls12_381.getPublicKey(randomKey);

        if (bet < MINcoin || bet > MAXcoin) {
          window.alert(
            "The bet amount does not meet the requirements,min:0.01SUI,MAX:--SUI"
          );
        }

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        let coinObjectId = tx.gas;
        if (selected == "usdc") {
          let coins;
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
          if (account) {
            coins = await getCointype(account.address, CoinUsdc);
          }
          coinObjectId = coins[0].coinObjectId;
          if (coins.length > 1) {
            for (let i = 1; i < coins.length; i++) {
              tx.mergeCoins(tx.object(coins[0].coinObjectId), [
                tx.object(coins[i].coinObjectId),
              ]);
            }
          }
        }
        const [coin] = tx.splitCoins(coinObjectId, [bet]);
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}join_playing`,
          typeArguments: [typeArgument],
          arguments: [
            tx.pure(iputRoomNum),
            tx.pure(Array.from(signedPokerHash)),
            coin,
            clock,
            data,
          ],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            setRoomNum(iputRoomNum);
            setAddbetP1(ante);
            setAddbetD1(ante);
            setKeep(false);

            initbutton();

            //玩家扑克..............................
            //对手扑克............................
            // dealingCards();
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };

  const Keep_playing = async () => {
    handleMoveAndClear();
    setBeforegame2(true);
    setAddbetP1(0);
    setCountdownP1(0);
    setAddbetD1(0);
    setAvatarD1("https://i.imgur.com/q2BJwpV.png");
    setRoomNum(0);
    setCountdownD1(0);
    setAddrD1("0x0");
    setLookCard(false);

    setBetsuiVol(ante);

    setActionAndResultP("");
    setActionAndResultD("");
    setWinAndBlindD("");
    setWinAndBlindP("");
    setLookCarditemsp([]);
    setStage(0);

    setTypecards("");

    let data; // Declare data outside the try block

    try {
      let gamedatas = Gamedata;
      if (selected == "usdc") {
        gamedatas = Gamedata_USDC;
      }
      const suiAfter = await client.getDynamicFieldObject({
        parentId: gamedatas,
        name: {
          type: "u64",
          value: String(iputRoomNum),
        },
      });
      data = JSON.parse(
        // @ts-ignore
        JSON.stringify(suiAfter["data"]["content"]["fields"])
      );
    } catch (error) {
      console.error("Error:", error);
    }

    if (data) {
      if (data.stage == 10) {
        transferSui_join(data.min_bet, iputRoomNum, 1, selected);
      } else if (data.stage > 10) {
        transferSui_go_on_playing____();
      }
    } else {
      window.alert("Please try again later");
    }
  };

  const transferSui_leave_game = async () => {
    if (looksui) {
      setLooksui(false);

      try {
        const tx = new TransactionBlock();

        let typeArgument = CoinSui;
        let Gamedatas = Gamedata;
        if (selected == "usdc") {
          typeArgument = CoinUsdc;
          Gamedatas = Gamedata_USDC;
        }
        const data = tx.object(Gamedatas); //data
        tx.moveCall({
          target: `${Package_TeenPatti}leave_game`,
          typeArguments: [typeArgument],
          arguments: [tx.pure(roomNum), data],
        });

        // Sign and execute the transaction block
        const response = await signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showEffects: true,
            showBalanceChanges: true,
            showEvents: true,
          },
        });

        if (response.events) {
          if (response.events.length == 0) {
            setLooksui(looksui);
            window.alert("Transaction failed  OR  Insufficient balance");
          } else {
            setLooksui(looksui);
            InitAll();
          }
        }
      } catch (error) {
        setLooksui(looksui);
        console.log(error);
        if (error instanceof Error && error.message.includes("wallet")) {
          window.alert(`Link wallet to ${neting}!!`);
        }
        //
      }
    }
  };
  //...........................................................................................................
  return (
    <div>
      <div
        className="grid-container-game"
        style={{ marginBottom: 0, paddingBottom: 0 }}
      >
        <div
          className="grid-item"
          style={{ marginBottom: 0, paddingBottom: 0 }}
        >
          <div
            className="grid-item"
            style={{
              height: "580px",
              backgroundImage: `url(${bjt})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start", // 改为 flex-start 或 center
              alignItems: "center",
              overflow: "hidden",
              gap: "0px", // 确保子元素之间的间距为零
              padding: "2px",
            }}
          >
            <span
              style={{ fontSize: "12px", color: "#899999", padding: "0px" }}
            >
              {addrD1}
            </span>
            <div
              className="grid-item-avatar "
              style={{
                height: "40px",
                width: "220px",
                // ............头像.....................................................................
                position: "relative",
                padding: "1px",
              }}
            >
              <span
                style={{
                  color: "#199999",

                  width: "90px",
                  fontSize: "25px", // 动态调整字体大小
                  textAlign: "center", // 使文本居中
                }}
              >
                {AddbetD1 !== 0 ? AddbetD1 : null}
              </span>
              <img
                src={avatarD1}
                style={{
                  width: "40px",
                  height: "38px",
                }}
              />
              <span
                style={{
                  width: "90px",
                  fontSize: "40px",
                  color: "rgb(255, 191, 0)",
                  fontFamily: "Lcd, sans-serif",

                  textAlign: "center", // 使文本居中
                }}
              >
                {CountdownD1 !== 0 ? CountdownD1 : null}
              </span>
            </div>
            <div
              className="grid-item"
              style={{
                height: "250px",
                backgroundColor: "rgba(0, 0, 0, 0)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute", // 使用 absolute 定位在容器
                  top: "33%", // 固定在容器的顶部
                  left: "50%", // 水平居中
                  transform: "translateX(-50%)", // 使元素在容器中水平居中
                  zIndex: 1, // 确保在容器内所有元素之上
                  backgroundColor:
                    winAndBlindD === ""
                      ? "rgba(0, 0, 0, 0)"
                      : "rgba(0, 0, 0, 0.8)",
                  color:
                    winAndBlindD == "LOSE"
                      ? "rgb(246,138,143)"
                      : "rgb(10, 172, 83)",
                  padding: "2px 2px",
                  fontSize: "30px",
                  borderRadius: "5px",
                  textAlign: "center",
                  display: "inline-block", // 设置为 inline-block，使宽度根据文本内容自动调整
                  whiteSpace: "nowrap", // 防止文本换行（可选，如果需要强制单行）
                }}
              >
                {winAndBlindD}
              </div>
              <div
                style={{
                  position: "absolute", // 绝对定位
                  top: "60%", // 距离容器顶部的距离
                  left: "50%", // 水平居中
                  transform: "translateX(-50%)", // 水平居中对齐
                  zIndex: 1, // 确保在容器内所有元素之上
                  backgroundColor:
                    actionAndResultD === ""
                      ? "rgba(0, 0, 0, 0)"
                      : "rgba(0, 0, 0, 0.5)", // 根据 valueP 动态设置背景色
                  color: "#e7e7e7", // 文本颜色
                  padding: "2px 2px",
                  fontSize: "20px",
                  borderRadius: "5px",
                  textAlign: "center",
                  display: "inline-block", // 设置为 inline-block，使宽度根据文本内容自动调整
                  whiteSpace: "nowrap", // 防止文本换行（可选，如果需要强制单行）
                }}
              >
                {actionAndResultD}
              </div>
              <div>
                {beforegame1 && beforegame2 ? (
                  itemsRoom.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "20px",
                        color: "#fff",
                        paddingTop: "70px", // 增加顶部填充距离
                      }}
                    >
                      There is currently no game room, please click below to
                      create one!
                    </div>
                  ) : (
                    <div
                      className="grid-container-game-21-5"
                      style={{
                        padding: "2px",
                      }}
                    >
                      {itemsRoom.map((item) => {
                        const isUSDC = item.cointype === CoinUsdc; // ✅ 是否 USDC
                        const divisor = isUSDC ? 1e6 : 1e9; // ✅ 不同币种的精度
                        const displayVol = parseFloat(
                          (item.vol / divisor).toFixed(2)
                        );
                        const displaymaxVol = parseFloat(
                          (item.maxvol / divisor).toFixed(2)
                        );

                        return (
                          <div
                            key={item.num}
                            className="grid-item"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.5)",
                              padding: "2px",
                            }}
                          >
                            {/* ante 标签 */}
                            <span style={{ color: "rgb(144,238,144)" }}>
                              ante
                            </span>

                            {/* 数值行：行间距压缩到 1px */}
                            <span
                              style={{
                                display: "block",
                                margin: "1px 0",
                                fontSize: "20px",
                                color: "rgb(144,238,144)",
                                padding: "1px",
                              }}
                            >
                              {displayVol}
                            </span>
                            <span
                              style={{
                                display: "block",
                                margin: "1px 0",
                                fontSize: "12px",
                                color: "rgb(144,238,144)",
                                padding: "5px",
                              }}
                            >
                              Max Single Bet: {displaymaxVol}
                            </span>

                            {/* 币种标签（USDC=金色，其余=蓝色） */}
                            <span
                              style={{
                                fontSize: "12px",
                                color: isUSDC ? "#6495ED" : "#87CEFA",
                              }}
                            >
                              {isUSDC ? "USDC" : "SUI"}
                            </span>

                            {/* Play / send.. 按钮 */}
                            <button
                              className="paly-button shift"
                              style={{
                                width: "90px",
                                height: "40px",
                                padding: "2px",
                              }}
                              onClick={() =>
                                transferSui_join(
                                  item.vol,
                                  item.num,
                                  item.bo,
                                  item.cointype
                                )
                              }
                            >
                              {looksui ? "Play" : "send.."}
                            </button>

                            {/* 房间号 */}
                            <span
                              style={{ fontSize: "12px", color: "#999999" }}
                            >
                              Room&nbsp;No.{item.num % 1000}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : beforegame2 ? (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "40px",
                      color: "#fff",
                      padding: "20px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    Waiting for players to join the game...
                  </div>
                ) : null}
                {itemsd.map((item) => (
                  <img
                    key={item.id}
                    src={cardDictionary[item.text]}
                    alt={item.text}
                    className="imagetransition"
                    style={{
                      position: "absolute",
                      top: item.y,
                      left: item.x,
                      transform: `translate(${
                        item.hasMoved ? item.initialX : -1500
                      }px, ${item.hasMoved ? item.initialY : 350}px)`,
                      transition:
                        "transform 0.8s ease, left 0.8s ease, top 0.8s ease",
                      width: "auto",
                      height: "160px",
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              className="grid-container-game-21-5"
              style={{
                height: "80px",
                gap: "10px",
                padding: "2px",
              }}
            >
              {
                stage > 10 || keep ? (
                  <button
                    style={{
                      marginTop: "1px",
                      width: "120px",
                    }}
                    className="paly-button shift"
                    onClick={() => {
                      Keep_playing();
                    }}
                  >
                    Keep playing
                  </button> // 如果 A > 10，渲染该值
                ) : null // 否则，渲染 null（什么也不渲染）
              }

              {winAndBlindD !== "" && (
                <img
                  src={chips}
                  style={{
                    width: "auto",
                    height: "40px",
                  }}
                />
              )}
              {winAndBlindD !== "" && (
                <h1
                  className="Gametitle"
                  style={{
                    fontSize: "40px",
                    color: "#a8a8a8",
                  }}
                >
                  {betsuiVol}
                </h1>
              )}
              {winAndBlindD !== "" && (
                <img
                  src={selected == "usdc" ? usdclogo : suilogo}
                  alt="coin icon"
                  style={{ width: "30px", height: "30px" }}
                />
              )}
              {
                stage > 10 || keep || stage == -1 ? (
                  <button
                    style={{
                      marginTop: "1px",
                      width: "120px",
                    }}
                    className="paly-button-red"
                    onClick={() => {
                      InitAll();
                      getRoomlist();
                    }}
                  >
                    Exit room
                  </button>
                ) : null // 否则，渲染 null（什么也不渲染）
              }
            </div>
            <div
              className="grid-item"
              style={{
                height: "250px",
                backgroundColor: "rgba(0, 0, 0, 0)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute", // 使用 absolute 定位在容器
                  top: "25%", // 固定在容器的顶部
                  left: "50%", // 水平居中
                  transform: "translateX(-50%)", // 使元素在容器中水平居中
                  zIndex: 1, // 确保在容器内所有元素之上
                  backgroundColor:
                    typecards === ""
                      ? "rgba(0, 0, 0, 0)"
                      : "rgba(0, 0, 0, 0.8)",
                  color: "rgb(10, 172, 83)", // 文字颜色
                  padding: "2px 4px", // 内边距调整为左右对称
                  fontSize: "20px", // 字体大小
                  whiteSpace: "nowrap", // 防止文本换行
                  borderRadius: "4px", // 可选：为背景添加圆角
                }}
              >
                {typecards}
              </div>
              <div
                style={{
                  position: "absolute", // 使用 absolute 定位在容器
                  top: "43%", // 固定在容器的顶部
                  left: "50%", // 水平居中
                  transform: "translateX(-50%)", // 使元素在容器中水平居中
                  zIndex: 1, // 确保在容器内所有元素之上
                  backgroundColor:
                    winAndBlindP === ""
                      ? "rgba(0, 0, 0, 0)"
                      : "rgba(0, 0, 0, 0.8)",
                  color:
                    winAndBlindP == "LOSE" || winAndBlindP == "Bust"
                      ? "rgb(246,138,143)"
                      : "rgb(10, 172, 83)",
                  padding: "2px 2px",
                  fontSize: "30px",
                  borderRadius: "5px",
                  textAlign: "center",
                  display: "inline-block", // 设置为 inline-block，使宽度根据文本内容自动调整
                  whiteSpace: "nowrap", // 防止文本换行（可选，如果需要强制单行）
                }}
              >
                {winAndBlindP}
              </div>
              <div
                style={{
                  position: "absolute", // 绝对定位
                  top: "70%", // 距离容器顶部的距离
                  left: "50%", // 水平居中
                  transform: "translateX(-50%)", // 水平居中对齐
                  zIndex: 1, // 确保在容器内所有元素之上
                  backgroundColor:
                    actionAndResultP === ""
                      ? "rgba(0, 0, 0, 0)"
                      : "rgba(0, 0, 0, 0.5)", // 根据 valueP 动态设置背景色
                  color: "#e7e7e7", // 文本颜色
                  padding: "2px 2px",
                  fontSize: "20px",
                  borderRadius: "5px",
                  textAlign: "center",
                  display: "inline-block", // 设置为 inline-block，使宽度根据文本内容自动调整
                  whiteSpace: "nowrap", // 防止文本换行（可选，如果需要强制单行）
                }}
              >
                {actionAndResultP}
              </div>
              <div>
                {beforegame1 && beforegame2 ? (
                  <div
                    className="grid-item"
                    style={{
                      backgroundColor: "rgba(0, 0,0, 0.5)",
                      padding: "5px", // 这里设置 align-items 为 flex-start
                      height: "auto", // 使父元素高度自适应
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "20px",
                          color: "#FFD700",
                          display: "inline-flex", // 使用 inline-flex
                          alignItems: "center", // 垂直居中对齐
                        }}
                      >
                        Ante {ante}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <input
                              type="radio"
                              name="coin"
                              value="sui"
                              checked={selected === "sui"}
                              onChange={() => setSelected("sui")}
                            />
                            <img
                              src={suilogo}
                              alt="SUI"
                              style={{
                                width: "22px",
                                height: "22px",
                                marginLeft: "5px",
                              }}
                            />
                          </label>
                          <label
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <input
                              type="radio"
                              name="coin"
                              value="usdc"
                              checked={selected === "usdc"}
                              onChange={() => setSelected("usdc")}
                            />
                            <img
                              src={usdclogo}
                              alt="USDC"
                              style={{
                                width: "22px",
                                height: "22px",
                                marginLeft: "5px",
                              }}
                            />
                          </label>
                        </div>
                      </span>
                    </div>
                    <button
                      onClick={() => anteReduce()}
                      style={{
                        width: "60px",
                        height: "30px",
                        backgroundColor: "#9c9c9c",
                        color: "#191c1a",
                        fontSize: "16px",
                        textAlign: "center" as const, // 'as const' to narrow the type
                        marginTop: "1px",
                        cursor: "pointer",
                        padding: "1px", // 这里设置 align-items 为 flex-start
                        fontWeight: "bold", // 设置文本为粗体
                      }}
                    >
                      —
                    </button>
                    <button
                      onClick={() => anteDoule()}
                      style={{
                        width: "60px",
                        height: "30px",
                        backgroundColor: "#9c9c9c",
                        color: "#191c1a",
                        fontSize: "16px",
                        textAlign: "center" as const, // 'as const' to narrow the type
                        marginTop: "1px",
                        cursor: "pointer",
                        padding: "1px", // 这里设置 align-items 为 flex-start
                        fontWeight: "bold", // 设置文本为粗体
                      }}
                    >
                      X2
                    </button>
                    <button
                      onClick={() => anteADD()}
                      style={{
                        width: "60px",
                        height: "30px",
                        backgroundColor: "#9c9c9c",
                        color: "#191c1a",
                        fontSize: "16px",
                        textAlign: "center" as const, // 'as const' to narrow the type
                        marginTop: "1px",
                        cursor: "pointer",
                        fontWeight: "bold", // 设置文本为粗体
                      }}
                    >
                      <span
                        style={{
                          transform: "scale(1.5)",
                          display: "inline-block",
                        }}
                      >
                        +
                      </span>
                    </button>
                    <div>
                      <div>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#FFD700",
                            display: "inline-flex", // 使用 inline-flex
                            alignItems: "center", // 垂直居中对齐
                          }}
                        >
                          Max single blind bet {maxbet} {selected.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => MAXbetReduce()}
                        style={{
                          width: "60px",
                          height: "30px",
                          backgroundColor: "#9c9c9c",
                          color: "#191c1a",
                          fontSize: "16px",
                          textAlign: "center" as const, // 'as const' to narrow the type
                          marginTop: "1px",
                          cursor: "pointer",
                          padding: "1px", // 这里设置 align-items 为 flex-start
                          fontWeight: "bold", // 设置文本为粗体
                        }}
                      >
                        —
                      </button>
                      <button
                        onClick={() => MAXbetDoule()}
                        style={{
                          width: "60px",
                          height: "30px",
                          backgroundColor: "#9c9c9c",
                          color: "#191c1a",
                          fontSize: "16px",
                          textAlign: "center" as const, // 'as const' to narrow the type
                          marginTop: "1px",
                          cursor: "pointer",
                          padding: "1px", // 这里设置 align-items 为 flex-start
                          fontWeight: "bold", // 设置文本为粗体
                        }}
                      >
                        X2
                      </button>
                      <button
                        onClick={() => MAXbetADD()}
                        style={{
                          width: "60px",
                          height: "30px",
                          backgroundColor: "#9c9c9c",
                          color: "#191c1a",
                          fontSize: "16px",
                          textAlign: "center" as const, // 'as const' to narrow the type
                          marginTop: "1px",
                          cursor: "pointer",
                          fontWeight: "bold", // 设置文本为粗体
                        }}
                      >
                        <span
                          style={{
                            transform: "scale(1.5)",
                            display: "inline-block",
                          }}
                        >
                          +
                        </span>
                      </button>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#FFD700",
                          display: "inline-flex", // 使用 inline-flex
                          alignItems: "center", // 垂直居中对齐
                        }}
                      >
                        Max single bet after seeing {maxbet * 2}{" "}
                        {selected.toUpperCase()}
                      </span>
                    </div>

                    <button
                      style={{
                        marginTop: "1px",
                      }}
                      className="paly-button shift"
                      onClick={() => {
                        transferSui_create_game();
                      }}
                    >
                      {looksui ? "Create room" : "sending.."}
                    </button>
                  </div>
                ) : beforegame2 ? (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "40px",
                      color: "#fff",
                      padding: "20px",
                    }}
                  >
                    {" "}
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#999999",
                        textAlign: "center",
                        display: "block",
                      }}
                    >
                      return bet
                    </span>
                    <button
                      style={{
                        marginTop: "1px",
                      }}
                      className="paly-button-red"
                      onClick={() => {
                        transferSui_leave_game();
                      }}
                    >
                      {looksui ? "Exit room" : "sending.."}
                    </button>
                  </div>
                ) : null}
                {itemsp.map((item) => (
                  <img
                    key={item.id}
                    src={cardDictionary[item.text]}
                    alt={item.text}
                    className="imagetransition"
                    style={{
                      position: "absolute",
                      top: item.y,
                      left: item.x,
                      transform: `translate(${
                        item.hasMoved ? item.initialX : -1500
                      }px, ${item.hasMoved ? item.initialY : -350}px)`,
                      transition:
                        "transform 0.8s ease, left 0.8s ease, top 0.8s ease",
                      width: "auto",
                      height: "160px",
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              className="grid-item-avatar "
              style={{
                height: "40px",
                width: "220px",
                // ............头像.....................................................................................................................
                position: "relative",
                padding: "1px",
              }}
            >
              {" "}
              <span
                style={{
                  width: "90px",
                  fontSize: "40px",
                  color: "rgb(255, 191, 0)",
                  fontFamily: "Lcd, sans-serif",

                  textAlign: "center", // 使文本居中
                }}
              >
                {CountdownP1 !== 0 ? CountdownP1 : null}
              </span>
              <img
                src={avatarP1}
                style={{
                  width: "40px",
                  height: "38px",
                }}
              />
              <span
                style={{
                  color: "#199999",

                  width: "90px",
                  fontSize: "25px", // 动态调整字体大小
                  textAlign: "center", // 使文本居中
                }}
              >
                {AddbetP1 !== 0 ? AddbetP1 : null}
              </span>
            </div>
            <span
              style={{ fontSize: "12px", color: "#899999", padding: "0px" }}
            >
              {addrP1}
            </span>
          </div>
          {!beforegame1 && !beforegame2 ? ( //这里需要修改............................................................................................................
            <div>
              <div
                className="grid-container-game-21-5"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0)",
                  padding: "2px",
                  alignItems: "flex-end", // 子元素底部对齐
                }}
              >
                <div
                  className="grid-item"
                  style={{
                    // backgroundColor: "rgba(30, 30, 94, 1)",
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <button
                    style={{
                      marginTop: "1px",
                      width: "175px",
                      opacity: fold ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button-red"
                    onClick={() => {
                      transferSui_fold();
                    }}
                  >
                    Fold
                  </button>
                </div>
                <div
                  className="grid-item"
                  style={{
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "20px",
                        color: "#FFD700",
                        display: "inline-flex", // 使用 inline-flex
                        alignItems: "center", // 垂直居中对齐
                      }}
                    >
                      {betShow}
                    </span>
                  </div>
                  <button
                    style={{
                      marginTop: "1px",
                      width: "175px",
                      opacity: applyOpenCards ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button-ylw"
                    onClick={() => {
                      transferSui_applyOpenCards();
                    }}
                  >
                    Show
                  </button>
                </div>
                <div
                  className="grid-item"
                  style={{
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "20px",
                        color: "#FFD700",
                        display: "inline-flex", // 使用 inline-flex
                        alignItems: "center", // 垂直居中对齐
                      }}
                    >
                      {betRasie}
                    </span>
                  </div>
                  <button
                    onClick={() => rasieReduce()}
                    style={{
                      width: "50px",
                      height: "30px",
                      backgroundColor: "#9c9c9c",
                      color: "#191c1a",
                      fontSize: "16px",
                      textAlign: "center" as const, // 'as const' to narrow the type
                      marginTop: "1px",
                      cursor: "pointer",
                      padding: "1px", // 这里设置 align-items 为 flex-start
                      fontWeight: "bold", // 设置文本为粗体
                    }}
                  >
                    —
                  </button>
                  <button
                    onClick={() => rasieDoule()}
                    style={{
                      width: "50px",
                      height: "30px",
                      backgroundColor: "#9c9c9c",
                      color: "#191c1a",
                      fontSize: "16px",
                      textAlign: "center" as const, // 'as const' to narrow the type
                      marginTop: "1px",
                      cursor: "pointer",
                      padding: "1px", // 这里设置 align-items 为 flex-start
                      fontWeight: "bold", // 设置文本为粗体
                    }}
                  >
                    X2
                  </button>
                  <button
                    onClick={() => rasieADD()}
                    style={{
                      width: "50px",
                      height: "30px",
                      backgroundColor: "#9c9c9c",
                      color: "#191c1a",
                      fontSize: "16px",
                      textAlign: "center" as const, // 'as const' to narrow the type
                      marginTop: "1px",
                      cursor: "pointer",
                      fontWeight: "bold", // 设置文本为粗体
                    }}
                  >
                    <span
                      style={{
                        transform: "scale(1.5)",
                        display: "inline-block",
                      }}
                    >
                      +
                    </span>
                  </button>
                  <button
                    style={{
                      marginTop: "1px",
                      width: "175px",
                      opacity: rasie ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button shift"
                    onClick={() => {
                      transferSui_rasie();
                    }}
                  >
                    Raise
                  </button>
                </div>
                <div
                  className="grid-item"
                  style={{
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "20px",
                        color: "#FFD700",
                        display: "inline-flex", // 使用 inline-flex
                        alignItems: "center", // 垂直居中对齐
                      }}
                    >
                      {betCall}
                    </span>
                  </div>
                  <button
                    style={{
                      marginTop: "1px",
                      width: "175px",
                      opacity: callBut ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button-gre"
                    onClick={() => {
                      transferSui_call();
                    }}
                  >
                    Call
                  </button>
                </div>
                <div
                  className="grid-item"
                  style={{
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <button
                    style={{
                      marginTop: "1px",
                      width: "175px",
                      opacity: apply_look_cards ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button-Blue"
                    onClick={() => {
                      transferSui_apply_look_cards();
                    }}
                  >
                    See Cards
                  </button>
                </div>
              </div>
              <div
                className="grid-container-game-21-5"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0)",
                  padding: "2px",
                  alignItems: "flex-end", // 子元素底部对齐
                }}
              >
                <div
                  className="grid-item"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#999999",
                        display: "inline-flex", // 使用 inline-flex
                        alignItems: "center", // 垂直居中对齐
                      }}
                    >
                      Opponent Folded, Click to Win
                    </span>
                  </div>
                  <button
                    style={{
                      marginTop: "1px",
                      width: "220px",
                      opacity: get_fold_bets ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button shift"
                    onClick={() => {
                      transferSui_get_fold_bets();
                    }}
                  >
                    WinOnFold
                  </button>
                </div>
                <div
                  className="grid-item"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#999999",
                        display: "inline-flex", // 使用 inline-flex
                        alignItems: "center", // 垂直居中对齐
                      }}
                    >
                      Accept Showdown Request
                    </span>
                  </div>
                  <button
                    style={{
                      marginTop: "1px",
                      width: "220px",
                      opacity: OpenCards ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button shift"
                    onClick={() => {
                      transferSui_OpenCards();
                    }}
                  >
                    AcceptShow
                  </button>
                </div>
                <div
                  className="grid-item"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#999999",
                        display: "inline-flex", // 使用 inline-flex
                        alignItems: "center", // 垂直居中对齐
                      }}
                    >
                      Win if the opponent times out!
                    </span>
                  </div>
                  <button
                    style={{
                      marginTop: "1px",
                      width: "220px",
                      opacity: get_timeout_bets ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button shift"
                    onClick={() => {
                      transferSui_get_timeout_bets();
                    }}
                  >
                    WinByTimeout
                  </button>
                </div>
                <div
                  className="grid-item"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    padding: "1px", // 这里设置 align-items 为 flex-start
                    height: "auto", // 使父元素高度自适应
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#999999",
                        display: "inline-flex", // 使用 inline-flex
                        alignItems: "center", //
                      }}
                    >
                      Reveal draw sequence to opponent!
                    </span>
                  </div>
                  <button
                    style={{
                      marginTop: "1px",
                      width: "220px",
                      opacity: reveal_look_cards ? 1 : 0.2, // 100% opacity if true, 0% opacity if false
                    }}
                    className="paly-button shift"
                    onClick={() => {
                      transferSui_reveal_look_cards();
                    }}
                  >
                    RevealCards
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {max_vol > 0 && (
        <span
          style={{
            fontSize: "12px",
            color: "#FFD700", // 金色
            textAlign: "center",
            display: "block",
            marginBottom: 0,
            paddingBottom: 0,
          }}
        >
          Max single blind bet {maxbet}
          {selected.toUpperCase()}---Max single bet after seeing {maxbet * 2}
          {selected.toUpperCase()}
        </span>
      )}
      <span
        style={{
          fontSize: "12px",
          color: "#999999",
          textAlign: "center",
          display: "block",
        }}
      >
        Three of a kind &gt; Straight flush &gt; Straight &gt; Flush &gt; Pair
        &gt; High card
      </span>
      {/* <button onClick={() => test()}>test</button> */}
    </div>
  );
};

export default TeenPatti;
