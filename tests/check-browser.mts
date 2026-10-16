import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4175/brag');
  await page.getByRole('heading',{name:/Play your hand/}).waitFor();
  await page.getByText('Finding open tables…').waitFor({state:'hidden',timeout:25000}).catch(()=>{});
  const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  await page.screenshot({path:`artifacts/app-${width}.png`,fullPage:true});
  console.log(JSON.stringify({width,overflow}));
  if(overflow.scroll>width)throw new Error(`Horizontal overflow at ${width}`);
}
console.log(JSON.stringify({pageErrors:errors}));await browser.close();
if(errors.length)process.exitCode=1;
