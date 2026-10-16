import { test, expect } from '@playwright/test';
const open=async(page:any,scenario:string)=>page.goto(`/tests/ui/index.html?scenario=${scenario}`);
const resume=async(page:any)=>page.getByRole('button',{name:'Resume table'}).click();

test('continue preserves room number, opens either seat in lobby, and survives reload',async({page})=>{
  await open(page,'settled');await resume(page);
  await page.getByLabel('Next-round ante').fill('3');
  await page.getByRole('button',{name:'Continue · open next round'}).click();
  await expect(page.getByText('Open to anyone — share this table number')).toBeVisible();
  expect(await page.evaluate(()=>(window as any).__bragTest.state.executions)).toEqual([{action:'go_on_playing',amount:'3000000000',argumentCount:4}]);
  await page.getByRole('button',{name:'Back to lobby'}).click();
  await expect(page.getByText('1 / 2 players · Open seat')).toBeVisible();
  await resume(page);
  // Reload uses the saved room pointer; fixture resets chain data to a settled room.
  await page.reload();await expect(page.getByText('Table #42',{exact:false}).first()).toBeVisible();
  await expect(page.getByLabel('Next-round ante')).toBeVisible();
});

test('opponent continues during settlement screen: joins current ante, not min_bet',async({page})=>{
  await open(page,'settled');await resume(page);
  await page.evaluate(()=>{const t=(window as any).__bragTest; t.state.room={...t.state.room,stage:10,player1:'0x'+'0'.repeat(64),bet:'3000000000',balance:'3000000000',sigcards1:[]};});
  await page.getByRole('button',{name:'Continue · open next round'}).click();
  await expect(page.getByText('Your turn',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(window as any).__bragTest.state.executions)).toEqual([{action:'join_playing',amount:'3000000000',argumentCount:7}]);
});

test('cancelled continuation leaves settled table and original cards intact',async({page})=>{
  await open(page,'cancel');await resume(page);
  const before=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes(':cards:')));
  await page.getByRole('button',{name:'Continue · open next round'}).click();
  await expect(page.getByRole('alert')).toContainText('cancelled');
  await expect(page.getByLabel('Next-round ante')).toBeVisible();
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes(':cards:')))).toEqual(expect.arrayContaining(before));
  expect(await page.evaluate(()=>(window as any).__bragTest.state.executions)).toEqual([]);
});

test('double click submits only one continuation',async({page})=>{
  await open(page,'settled');await resume(page);
  await page.getByRole('button',{name:'Continue · open next round'}).evaluate((button:HTMLButtonElement)=>{button.click();button.click();});
  await expect(page.getByText('Open to anyone — share this table number')).toBeVisible();
  expect(await page.evaluate(()=>(window as any).__bragTest.state.attempts)).toBe(1);
});

test('stranger can join a waiting player-2 table; transaction has kiosk and NFT arguments',async({page})=>{
  await open(page,'waiting-other');await page.getByRole('button',{name:'Join table',exact:true}).click();
  await expect(page.getByText('Your turn',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>(window as any).__bragTest.state.executions)).toEqual([{action:'join_playing',amount:'3000000000',argumentCount:7}]);
});

test('missing table presents recovery instead of silently clearing the session',async({page})=>{
  await open(page,'settled');await resume(page);
  await page.evaluate(()=>{(window as any).__bragTest.state.room=null;(window as any).__bragTest.refresh();});
  await expect(page.getByRole('alert')).toContainText('closed on chain');
  await expect(page.getByText('Table #42',{exact:false}).first()).toBeVisible();
});

for(const width of [320,390,768,1440]) for(const scenario of ['lobby','active']) {
  test(`${scenario} fits ${width}px without horizontal overflow`,async({page})=>{
    await page.setViewportSize({width,height:900});await open(page,scenario);
    if(scenario==='active')await resume(page);
    await expect(page.getByRole('heading',{name:/BRAG/})).toBeVisible();
    await expect(page.getByRole('button',{name:'Refresh',exact:false}).first()).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width===390||width===1440)await page.screenshot({path:`artifacts/${scenario}-${width}.png`,fullPage:true});
  });
}

test('unconfirmed payment survives reload and prevents another funded transaction',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('brag:pending:mainnet:0x'+'1'.padStart(64,'0'),JSON.stringify({digest:'1'.repeat(44),table:{token:'sui',number:'42'},action:'go_on_playing',expiresEpoch:9999}));
  });
  await open(page,'lobby');
  await expect(page.getByText('A signed transaction is awaiting confirmation.',{exact:false})).toBeVisible();
  await expect(page.getByRole('button',{name:'Join table',exact:true})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Create table',exact:true})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Check transaction',exact:true})).toBeEnabled();
  expect(await page.evaluate(()=>(window as any).__bragTest.state.attempts)).toBe(0);
});
