import { listTables, getTiming } from '../src/gameLobby';
for (const token of ['sui','usdc'] as const) {
  const [tables,timing]=await Promise.all([listTables(token),getTiming(token)]);
  console.log(JSON.stringify({token,tables:tables.map(t=>({number:t.number,stage:t.room.stage,bet:t.room.bet,player1:t.room.player1,player2:t.room.player2})),countdown:timing.countdown}));
}
