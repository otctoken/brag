import React from "react";
// @ts-ignore
import viplogo from "../assets/vip.gif";
const Dosc = () => {
  return (
    <div>
      <h1 className="titleyue">Docs</h1>

      <div
        className="grid-container-game"
        style={{
          backgroundColor: "#141414",
          padding: "32px",
          borderRadius: "16px",
        }}
      >
        <section>
          <h2>
            <span style={{ color: "rgb(10, 172, 83)" }}>
              BRAG(3-card poker,诈金花)
            </span>
          </h2>
          <p style={{ textAlign: "justify" }}>
            Brag is a two-player game where each player places an equal bet to
            create the pot. Each player is then dealt three face-down cards.
            Players can choose to call, raise, check, or fold. A blind player's
            bet amount is half of what a player who has seen their cards would
            bet. The player requesting a showdown must pay double the chips,
            while the player being challenged does not need to pay any chips.
            The maximum single bet for a blind player is 100, while for a seen
            player, it is 200. The ranking of hands is as follows: Three of a
            kind &gt;Straight flush &gt; Straight &gt; Flush &gt; Pair &gt;High
            card, with AAA being the highest hand. If the hands of the players
            are equal, the player who first requests the showdown loses.
            Technical details: game that uses a draw-sign-encrypt-verify
            mechanism to ensure honesty and fairness in the game. First, both
            players shuffle the deck randomly and then draw 3 random indices to
            form a 55-length array. This array is signed and recorded on-chain.
            The first 52 elements of this array represent the 52 cards, while
            the last three elements represent the indices of the opponent's
            cards. Essentially, Player A shuffles and Player B draws, and vice
            versa. For example, if Player A has array A and Player B has array
            B, then Player A's hand would be composed of the cards at positions
            array B[array A[52]], array B[array A[53]], and array B[array
            A[54]]. If any player requests to see the cards, the other player
            only needs to reveal the last three elements of their array. In the
            final settlement phase, the correctness of the array's signature is
            verified on-chain. Only with a valid signature can the reward be
            obtained; otherwise, it will result in a loss.
          </p>
          <div>
            {" "}
            {/* 使用div替代嵌套的p标签 */}
            <a
              target="_blank"
              style={{ color: "#2299ff" }}
              href="https://medium.com/@suiBrag/suiwin-teen-patti-0950590ffb7a"
            >
              More details
            </a>
          </div>
          <ul>
            <li>Will fail if the action times out (60s).</li>
            <li>Do not leave during the game, it may result in failure.</li>
            <li>Make sure you have enough balance to compare cards. </li>
            <li>
              If you fold, wait for the opponent to verify, they may time out
              and the winner is you.
            </li>
            <li>No limit on total bets.</li>
            <li>
              Players may not wager more than the Max Bet in a single betting
              round.
            </li>
            <li>
              There is no limit on the bet amount when requesting a showdown.
            </li>
          </ul>
          <p>(House fee: 0.5%)</p>
          <p>
            (VIP House fee: 0.1%)
            <img
              src={viplogo}
              alt="logo"
              style={{
                width: "20px",
                height: "20px",
                marginLeft: "4px",
                verticalAlign: "middle",
              }}
            />
          </p>
          <a
            target="_blank"
            style={{ color: "#2299ff" }}
            href="https://www.tradeport.xyz/sui/collection/0xc8544a17c09eb59aff99596bf3e1c9c766b0b13eb7e7c71b613cf0f77c090f6e?tab=mint&bottomTab=trades"
          >
            Hold NFT to get VIP benefits
          </a>
          <p>
            <strong>Contract Address: </strong>
            <a
              target="_blank"
              style={{ color: "#2299ff" }}
              href="https://suiscan.xyz/mainnet/object/0x93a36744eff6ee002ef32948866098eae032f277e7e702133dd35dc7cbfe1681/contracts"
            >
              View Details
            </a>
          </p>
          <p>
            <strong>Github: </strong>
            <a
              target="_blank"
              style={{ color: "#2299ff" }}
              href="https://github.com/otctoken/brag/"
            >
              View Details
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Dosc;
