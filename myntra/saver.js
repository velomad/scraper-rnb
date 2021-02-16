const puppeteer = require("puppeteer");
const categories = require("./categories");
const userAgent = require("user-agents");

module.exports.scraper = async (url, pagesToScrape, callBack) => {
  console.log("in scrapping file");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const menArry = categories[0].men;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }

  var loopArry;
  for (var category of categories) {
    loopArry = [category.men, category.women];
  }
  loopArry.map((outerEl, outerIndex) => {
    outerEl.map(async (el, index) => {
      // console.log(el, index);

      for (var p = 1; p <= pagesToScrape; p++) {
        await page.goto(`${url}/${el}?p=${p}`);

        console.log("handling category====>", el);
        console.log("handling page====>", p);

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

        let category = el.replace(/\s/g, "").toLowerCase();
        let displayCategory = el.toLowerCase();

        let data = await page.evaluate(
          (category, displayCategory) => {
            window.scrollTo(0, 0);
            let products = [];
            let productElements = document.querySelectorAll(".product-base");

            productElements.forEach((productElement) => {
              let productJson = {};
              let productSizeText = document.querySelector(".product-sizes")
                .innerText;
              let productSizeArr = productSizeText
                .replace("Sizes:", "")
                .trim()
                .split(",");

              try {
                (productJson.website = "myntra"),
                  (productJson.category = category);
                productJson.displayCategory = displayCategory;
                // productJson.gender = i === 0 ? "men" : "women";
                productJson.imageUrl = productElement.querySelector(
                  "picture .img-responsive"
                )
                  ? productElement.querySelector("picture .img-responsive").src
                  : null;
                productJson.productPrice = productElement.querySelector(
                  ".product-discountedPrice"
                )
                  ? productElement
                      .querySelector(".product-discountedPrice")
                      .innerText.split(" ")[1]
                  : null;
                productJson.productPriceStrike = productElement.querySelector(
                  ".product-strike"
                )
                  ? productElement
                      .querySelector(".product-strike")
                      .innerText.split(" ")[1]
                  : null;
                productJson.discountPercent =
                  productElement.querySelector(".product-strike") &&
                  productElement.querySelector(".product-discountedPrice")
                    ? (
                        ((parseInt(
                          productElement
                            .querySelector(".product-strike")
                            .innerText.split(" ")[1]
                        ) -
                          parseInt(
                            productElement
                              .querySelector(".product-discountedPrice")
                              .innerText.split(" ")[1]
                          )) /
                          parseInt(
                            productElement
                              .querySelector(".product-strike")
                              .innerText.split(" ")[1]
                          )) *
                        100
                      ).toFixed(0)
                    : null;

                productJson.productLink = productElement.querySelector(
                  ".product-base > a"
                )
                  ? productElement.querySelector(".product-base > a").href
                  : null;
                productJson.brandName = productElement.querySelector(
                  ".product-brand"
                )
                  ? productElement.querySelector(".product-brand").innerText
                  : null;
                productJson.productName = productElement.querySelector(
                  ".product-product"
                )
                  ? productElement.querySelector(".product-product").innerText
                  : null;
                productJson.size = productSizeArr
                  ? JSON.stringify(productSizeArr)
                  : null;
              } catch (e) {
                console.log(e);
              }
              products.push(productJson);
            });

            return products;
          },
          category,
          displayCategory
          // i
        );
        await wait(100);

        // i = current index of  outermost loop
        // loopArry.length - 1 : arrays within the array of loop and - 1 coz loop starts from index 0
        // j : current index of categories loop
        // loopArry[i].length - 1 : categories within the array and - 1 coz loop starts from index 0
        // p : current page in the loop
        // loopArry[i][j] : category name too be added in collection

        callBack(
          data,
          true
          // i,
          // loopArry.length - 1,
          // j,
          // loopArry[i].length - 1,
          // p,
          // // loopArry[i][j],
          // lastPage,
        );
      }
    });
  });

  // var loopArry;
  // for (var t of categories) {
  //   loopArry = [t.men, t.women];
  // }
  // for (var i = 0; i < loopArry.length; i++) {
  //   for (var j = 0; j < loopArry[i].length; j++) {
  //     for (var p = 1; p <= pagesToScrape; p++) {
  //       await page.goto(`${url}/${loopArry[i][j]}?p=${p}`, {
  //         waitUntil: "networkidle0",
  //       });

  // // Get the height of the rendered page
  // const bodyHandle = await page.$("body");
  // const { height } = await bodyHandle.boundingBox();
  // await bodyHandle.dispose();

  // // Scroll one viewport at a time, pausing to let content load
  // const viewportHeight = page.viewport().height;
  // let viewportIncr = 0;
  // while (viewportIncr + viewportHeight < height) {
  //   await page.evaluate((_viewportHeight) => {
  //     window.scrollBy(0, _viewportHeight);
  //   }, viewportHeight);
  //   await wait(100);
  //   viewportIncr = viewportIncr + viewportHeight;
  // }

  // let category = loopArry[i][j].replace(/\s/g, "").toLowerCase();
  // let displayCategory = loopArry[i][j].toLowerCase();

  // let lastPage = await page.evaluate(() => {
  //   if (document.querySelector(".pagination-paginationMeta")) {
  //     let pagesArry = document
  //       .querySelector(".pagination-paginationMeta")
  //       .innerText.split(" ");
  //     var data = pagesArry[pagesArry.length - 1];
  //   }
  //   return data;
  // });

  // let data = await page.evaluate(
  //   (category, displayCategory, i) => {
  //     window.scrollTo(0, 0);
  //     let products = [];
  //     let productElements = document.querySelectorAll(".product-base");

  //     productElements.forEach((productElement) => {
  //       let productJson = {};
  //       let productSizeText = document.querySelector(".product-sizes")
  //         .innerText;
  //       let productSizeArr = productSizeText
  //         .replace("Sizes:", "")
  //         .trim()
  //         .split(",");

  //       try {
  //         (productJson.website = "myntra"),
  //           (productJson.category = category);
  //         productJson.displayCategory = displayCategory;
  //         productJson.gender = i === 0 ? "men" : "women";
  //         productJson.imageUrl = productElement.querySelector(
  //           "picture .img-responsive"
  //         )
  //           ? productElement.querySelector("picture .img-responsive").src
  //           : null;
  //         productJson.productPrice = productElement.querySelector(
  //           ".product-discountedPrice"
  //         )
  //           ? productElement
  //               .querySelector(".product-discountedPrice")
  //               .innerText.split(" ")[1]
  //           : null;
  //         productJson.productPriceStrike = productElement.querySelector(
  //           ".product-strike"
  //         )
  //           ? productElement
  //               .querySelector(".product-strike")
  //               .innerText.split(" ")[1]
  //           : null;
  //         productJson.discountPercent =
  //           productElement.querySelector(".product-strike") &&
  //           productElement.querySelector(".product-discountedPrice")
  //             ? (
  //                 ((parseInt(
  //                   productElement
  //                     .querySelector(".product-strike")
  //                     .innerText.split(" ")[1]
  //                 ) -
  //                   parseInt(
  //                     productElement
  //                       .querySelector(".product-discountedPrice")
  //                       .innerText.split(" ")[1]
  //                   )) /
  //                   parseInt(
  //                     productElement
  //                       .querySelector(".product-strike")
  //                       .innerText.split(" ")[1]
  //                   )) *
  //                 100
  //               ).toFixed(0)
  //             : null;

  //         productJson.productLink = productElement.querySelector(
  //           ".product-base > a"
  //         )
  //           ? productElement.querySelector(".product-base > a").href
  //           : null;
  //         productJson.brandName = productElement.querySelector(
  //           ".product-brand"
  //         )
  //           ? productElement.querySelector(".product-brand").innerText
  //           : null;
  //         productJson.productName = productElement.querySelector(
  //           ".product-product"
  //         )
  //           ? productElement.querySelector(".product-product").innerText
  //           : null;
  //         productJson.size = productSizeArr
  //           ? JSON.stringify(productSizeArr)
  //           : null;
  //       } catch (e) {
  //         console.log(e);
  //       }
  //       products.push(productJson);
  //     });

  //     return products;
  //   },
  //   category,
  //   displayCategory,
  //   i
  // );
  // await wait(100);

  // // i = current index of  outermost loop
  // // loopArry.length - 1 : arrays within the array of loop and - 1 coz loop starts from index 0
  // // j : current index of categories loop
  // // loopArry[i].length - 1 : categories within the array and - 1 coz loop starts from index 0
  // // p : current page in the loop
  // // loopArry[i][j] : category name too be added in collection

  // callBack(
  //   data,
  //   true
  //   // i,
  //   // loopArry.length - 1,
  //   // j,
  //   // loopArry[i].length - 1,
  //   // p,
  //   // // loopArry[i][j],
  //   // lastPage,
  // );
  // }
  // }
  // }
};
