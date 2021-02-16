const puppeteer = require("puppeteer");
const categories = require("./categories");
const userAgent = require("user-agents");

module.exports.scraper = async (url, pagesToScrape, callBack) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(userAgent.toString());

  await page.setViewport({ width: 1200, height: 768 });

  function wait(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }

  var loopArry;
  for (var t of categories) {
    loopArry = [t.men, t.women];
  }

  for (var i = 0; i < loopArry.length; i++) {
    for (var j = 0; j < loopArry[i].length; j++) {
      for (var p = 1; p <= pagesToScrape; p++) {
        await page.goto(`${url}/${Object.values(loopArry[i][j])}&page=${p}`, {
          waitUntil: "networkidle0",
        });

        // Get the height of the rendered page
        const bodyHandle = await page.$("body");
        const { height } = await bodyHandle.boundingBox();
        await bodyHandle.dispose();

        // Scroll one viewport at a time, pausing to let content load
        const viewportHeight = page.viewport().height;
        let viewportIncr = 0;
        while (viewportIncr + viewportHeight < height) {
          await page.evaluate((_viewportHeight) => {
            window.scrollBy(0, _viewportHeight);
          }, viewportHeight);
          await wait(100);
          viewportIncr = viewportIncr + viewportHeight;
        }

        let category = Object.keys(loopArry[i][j])[0]
          .replace(/\s/g, "-")
          .toLowerCase();
        let displayCategory = Object.keys(loopArry[i][j])[0].toLowerCase();

        let data = await page.evaluate(
          (category, displayCategory, i) => {
            window.scrollTo(0, 0);
            let products = [];
            // let productElements = document.querySelectorAll("._3O0U0u");
            let productElements = document.querySelectorAll("._13oc-S");
            productElements.forEach((productElement) => {
              let productJson = {};

              try {
                (productJson.website = "flipkart"),
                  (productJson.brandName = productElement.querySelector(
                    "._2WkVRV"
                  )
                    ? productElement.querySelector("._2WkVRV").innerText
                    : null);
                productJson.category = category;
                productJson.displayCategory = displayCategory;
                productJson.gender = i === 0 ? "men" : "women";
                productJson.productName = productElement.querySelector(
                  ".IRpwTa"
                )
                  ? productElement.querySelector(".IRpwTa").title
                  : null;
                productJson.productLink = productElement.querySelector(
                  "._2UzuFa"
                )
                  ? productElement.querySelector("._2UzuFa").href
                  : null;
                productJson.imageUrl = productElement.querySelector(
                  "img._2r_T1I"
                )
                  ? productElement.querySelector("img._2r_T1I").src
                  : null;
                productJson.productPrice = productElement.querySelector(
                  "._30jeq3"
                )
                  ? productElement
                      .querySelector("._30jeq3")
                      .innerText.slice(1)
                      .split(",")
                      .join("")
                  : null;
                productJson.productPriceStrike = productElement.querySelector(
                  "._3I9_wc"
                )
                  ? productElement
                      .querySelector("._3I9_wc")
                      .innerText.slice(1)
                      .split(",")
                      .join("")
                  : null;
                productJson.discountPercent = productElement.querySelector(
                  "._3Ay6Sb"
                )
                  ? productElement
                      .querySelector("._3Ay6Sb")
                      .innerText.split(" ")[0]
                      .slice(0, -1)
                  : null;
              } catch (e) {
                console.log(e);
              }
              products.push(productJson);
            });
            return products;
          },
          category,
          displayCategory,
          i
        );
        await wait(100);
        // i = current index of  outermost loop
        // loopArry.length - 1 : arrays within the array of loop and - 1 coz loop starts from index 0
        // j : current index of categories loop
        // loopArry[i].length - 1 : categories within the array and - 1 coz loop starts from index 0
        // p : current page in the loop
        // loopArry[i][j] : category name too be added in collection
        console.log(data);
        callBack(
          data,
          true
          //   i,
          //   loopArry.length - 1,
          //   j,
          //   loopArry[i].length - 1,
          //   p,
          //   Object.keys(loopArry[i][j])
        );
      }
    }
  }
  await browser.close();
};
