const puppeteer = require("puppeteer");

const scrapeMed = async (medName) => {
  function fetchNum(str) {
    let matches = str.match(/(\d+)/);

    return matches[0];
  }

  const nameLink = "#maincontent > div.content-section > div.product-top > div.product-right-block > div.product-detail > h1";
  const compositionLink = "#maincontent > div.content-section > div.product-top > div.product-right-block > div.product-detail > div.drug-manu > a";
  const imageLink = "#slider > section > div.main-container > div > div > div > div.slick-slide.slick-current.slick-active > div > div > figure > img";
  const priceLink = "#maincontent > div.content-section > div.product-top > div.product-right-block > div.essentials > div.drug-con.pull-left.price-box > span.final-price";
  const packingLink = "#maincontent > div.content-section > div.product-top > div.product-right-block > div.essentials > div.drug-con.pull-left.price-box > span.drug-varient";

  console.log("scraping med");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.netmeds.com/");

  await page.type("#search", medName);
  console.log("searching for med");
  await Promise.all([await page.keyboard.press("Enter"), await page.waitForNavigation()]);

  try {
    
    await page.click("#algolia_hits > li:nth-child(1) > div > div > div.drug_c > a > div")

    await page.waitForSelector(nameLink);
    const name = await page.$eval(nameLink, (el) => el.innerText);

    await page.waitForSelector(compositionLink);
    const composition = await page.$eval(compositionLink, (el) => el.innerText);

    await page.waitForSelector(priceLink);
    const price = fetchNum(await page.$eval(priceLink, (el) => el.innerText));

    await page.waitForSelector(imageLink);
    const image = await page.$eval(imageLink, (el) => el.src);

    await page.waitForSelector(packingLink);
    const packing = await page.$eval(packingLink, (el) => el.innerText);

    await browser.close();
    console.log('Got the med');
    return { name, composition, image, price, status: true, url: page.url(), packing };
  } catch (err) {
    console.log(err);
    await browser.close();
    return { status: false };
  }
};

module.exports = { scrapeMed };
