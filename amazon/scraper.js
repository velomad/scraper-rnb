const puppeteer = require("puppeteer");
var catgories = require("./categories.js");
// const {convertStringToNumber} = require("../../utils/utils");

module.exports.scraper = async (url, pagesToScrape, callBack) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );

  await page.setViewport({ width: 1200, height: 768 });

  function wait(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }

  await page.goto(`${url}`, {
    waitUntil: "networkidle0",
  });

  async function autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        // let totalHeight = 0;
        let distance = 100;
        let timer = setInterval(() => {
          // let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          // totalHeight += distance;
          // let getText = document.querySelector(
          // 	"#searchMessageContainer > div > span:nth-child(1)",
          // ).textContent;
          if (
            document.querySelectorAll(
              ".sg-col-4-of-12.sg-col-4-of-36.s-result-item"
            ).length > 47
            // Number(((getText.match(/(\d+)/)[0] / 100) * 1).toFixed(0))
          ) {
            getText = "";
            window.scrollTo(0, 0);
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });
    });
  }

  // Get the height of the rendered page

  //   const bodyHandle = await page.$("body");
  //   const { height } = await bodyHandle.boundingBox();
  //   await bodyHandle.dispose();

  //   // Scroll one viewport at a time, pausing to let content load
  //   const viewportHeight = page.viewport().height;
  //   let viewportIncr = 0;
  //   while (viewportIncr + viewportHeight < height) {
  //   	await page.evaluate((_viewportHeight) => {
  //   		window.scrollBy(0, _viewportHeight);
  //   	}, viewportHeight);
  //   	await wait(100);
  //   	viewportIncr = viewportIncr + viewportHeight;
  //   }

  var loopArry;
  for (var t of catgories) {
    loopArry = [t.men, t.women];
  }
  for (var i = 0; i < loopArry.length; i++) {
    for (var text = 0; text < loopArry[i].length; text++) {
      const input = await page.$("#twotabsearchtextbox");
      await input.click({ clickCount: 3 });
      await input.press("Backspace");
      await wait(2000);
      await page.type("input[name=field-keywords]", loopArry[i][text], {
        delay: 20,
      });
      await wait(2000);
      await page.keyboard.press("Enter");
      await page.waitForNavigation();
      await wait(2000);
      //   await autoScroll(page);

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

      await wait(2000);
      for (var p = 0; p < pagesToScrape; p++) {
        var category = loopArry[i][text].replace(/\s/g, "-").toLowerCase();
        var displayCategory = loopArry[i][text].toLowerCase();
        let data = await page.evaluate(
          (category, displayCategory, i) => {
            window.scrollTo(0, 0);
            let products = [];
            // let productElements = document.querySelectorAll(".celwidget");
            let productElements = document.querySelectorAll(
              //   ".sg-col-4-of-12.sg-col-4-of-36.s-result-item"
              ".sg-col-4-of-20"
            );

            productElements.forEach((productElement) => {
              let productJson = {};

              var productStrikedPrice = document.querySelector(
                ".a-row.a-size-small>span"
              ).innerText;

              // var sliced = productStrikedPrice.slice
              console.log(productStrikedPrice);

              try {
                productJson.website = "amazon";
                productJson.category = category;
                productJson.displayCategory = displayCategory;
                productJson.brandName = productElement.querySelector(
                  ".s-line-clamp-1>span"
                )
                  ? productElement.querySelector(".s-line-clamp-1>span")
                      .innerText
                  : null(
                      (productJson.productName = productElement.querySelector(
                        ".s-line-clamp-2>a"
                      )
                        ? productElement.querySelector(".s-line-clamp-2>a")
                            .innerText
                        : null)
                    );
                productJson.gender = i === 0 ? "men" : "women";
                productJson.productLink = productElement.querySelector(
                  ".s-line-clamp-2>a"
                )
                  ? productElement.querySelector(".s-line-clamp-2>a").href
                  : null;
                productJson.imageUrl = productElement.querySelector(
                  ".aok-relative>img"
                )
                  ? productElement.querySelector(".aok-relative>img").src
                  : null;
                productJson.productPrice = productElement.querySelector(
                  ".a-price-whole"
                )
                  ? productElement
                      .querySelector(".a-price-whole")
                      .innerText.split(",")
                      .join("")
                  : null;
                productJson.productRating = productElement.querySelector(
                  ".a-row.a-size-small>span"
                )
                  ? productElement
                      .querySelector(".a-row.a-size-small>span")
                      .innerText.split(" ")[0]
                  : null;
                productJson.productPriceStrike = productElement.querySelector(
                  ".a-price.a-text-price>span"
                )
                  ? productElement
                      .querySelector(".a-price.a-text-price>span")
                      .innerText.slice(1)
                      .split(",")
                      .join("")
                  : null;

                productJson.discountPercent =
                  productElement.querySelector(".a-price.a-text-price>span") &&
                  productElement.querySelector(".a-price-whole")
                    ? (
                        ((parseInt(
                          productElement
                            .querySelector(".a-price.a-text-price>span")
                            .innerText.slice(1)
                            .split(",")
                            .join("")
                        ) -
                          parseInt(
                            productElement
                              .querySelector(".a-price-whole")
                              .innerText.split(",")
                              .join("")
                          )) /
                          parseInt(
                            productElement
                              .querySelector(".a-price.a-text-price>span")
                              .innerText.slice(1)
                              .split(",")
                              .join("")
                          )) *
                        100
                      ).toFixed(0)
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
        callBack(data, true);
        if ((await page.$(".a-selected + .a-normal")) !== null) {
          await page.click(".a-selected + .a-normal");
        } else {
          break;
        }
        await wait(2000);
      }
    }
  }
  await browser.close();
};
