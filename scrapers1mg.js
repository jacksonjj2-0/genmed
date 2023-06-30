const puppeteer = require("puppeteer");

const scrapeMed = async (medName) => {

  function fetchNum(str) {
    let matches = str.match(/(\d+)/);
    
    return matches[0];
  }

  const nameLink = "#drug_header > div > div > div.DrugHeader__header-content___f6GbC > div > div.DrugHeader__left___19WY- > h1";
  const compositionLink = "#drug_header > div > div > div.DrugHeader__lower-content___2CZFo > div.DrugHeader__left___19WY- > div:nth-child(2) > div:nth-child(2) > div.saltInfo.DrugHeader__meta-value___vqYM0 > a";
  const imageLink = "#drug_header > div > div > div.DrugHeader__lower-content___2CZFo > div.DrugHeader__slider-wrapper___1S8x2 > div > div > div.slick-list > div > div.slick-slide.slick-active.slick-current > div > div > div > div > img";
  const priceLink = "#category-container > div > div.col-xs-12.col-md-10.col-sm-9.style__search-info-container___3s3zV > div:nth-child(2) > div.col-md-9 > div > div > div.row.style__grid-container___3OfcL > div > div:nth-child(1) > div > a > div.style__product-pricing___1tj_E > div";
  const packingLink = "#category-container > div > div.col-xs-12.col-md-10.col-sm-9.style__search-info-container___3s3zV > div:nth-child(2) > div.col-md-9 > div > div > div.row.style__grid-container___3OfcL > div > div:nth-child(1) > div > a > div.style__product-description___1vPQe > div.style__pack-size___254Cd"

  console.log("scraping med");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.1mg.com/");

  if ((await page.$("#top-div > div.style__banner-close-button___2QheJ > div > svg")) !== null) await page.click("#top-div > div.style__banner-close-button___2QheJ > div > svg");

  await page.type("#srchBarShwInfo", medName);
  console.log("searching for med");
  await Promise.all([page.click("#srchBarShwInfo-form > span > div"), page.waitForNavigation()]);

  try {
    //save target of original page to know that this was the opener:
    const pageTarget = page.target();

    await page.click("#category-container > div > div.col-xs-12.col-md-10.col-sm-9.style__search-info-container___3s3zV > div:nth-child(2) > div.col-md-9 > div > div.product-card-container.style__sku-list-container___jSRzr > div.row.style__grid-container___3OfcL > div > div:nth-child(1) > div > a > div.style__product-image___3weAd > div > img");

    //check that the first page opened this new page:
    const newTarget = await browser.waitForTarget((target) => target.opener() === pageTarget);
    //get the new page object:
    const newPage = await newTarget.page();

    await newPage.waitForSelector(nameLink);
    const name = await newPage.$eval(nameLink, (el) => el.innerText);

    await newPage.waitForSelector(compositionLink);
    const composition = await newPage.$eval(compositionLink, (el) => el.innerText);

    await page.waitForSelector(priceLink);
    const price = fetchNum(await page.$eval(priceLink, (el) => el.innerText));

    await newPage.waitForSelector(imageLink);
    const image = await newPage.$eval(imageLink, (el) => el.src);

    await page.waitForSelector(packingLink);
    const packing = await page.$eval(packingLink, (el) => el.innerText)

    await browser.close();
    return { name, composition, image, price, status: true, url: newPage.url(), packing };
  } catch (err) {
    console.log(err);
    await browser.close();
    return { status: false };
  }
};

module.exports = { scrapeMed };
