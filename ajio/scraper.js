const { default: Axios } = require("axios");
const categories = require("./categories");

// test

module.exports.scraper = async (url, pagesToScrape, callBack) => {
  var loopArry;
  for (var t of categories) {
    loopArry = [t.men, t.women];
  }

  for (var i = 0; i < loopArry.length; i++) {
    for (var j = 0; j < loopArry[i].length; j++) {
      for (var p = 1; p <= pagesToScrape; p++) {
        var URL = `${url}/api/category/${Object.values(
          loopArry[i][j]
        )}?fields=SITE&currentPage=${p}&pageSize=45&format=json&query=%3Arelevance&sortBy=relevance&gridColumns=3&advfilter=true`;
        let data = [];

        try {
          let fetchApi = await Axios.get(URL);
          let rawData = fetchApi.data.products;

          rawData.forEach((el) => {
            data.push({
              website: "ajio",
              category: Object.keys(loopArry[i][j])[0]
                .replace(/\s/g, "-")
                .toLowerCase(),
              displayCategory: Object.keys(loopArry[i][j])[0]
                .replace(/\s/g, " ")
                .toLowerCase(),
              gender: i === 0 ? "men" : "women",
              productName: el.name ? el.name : null,
              brandName: el.fnlColorVariantData.brandName
                ? el.fnlColorVariantData.brandName
                : null,
              imageUrl: el.fnlColorVariantData.outfitPictureURL
                ? el.fnlColorVariantData.outfitPictureURL
                : null,
              discountPercent: el.discountPercent
                ? el.discountPercent.match(/(\d+)/)[0]
                : null,
              productPrice: el.price.displayformattedValue
                ? el.price.displayformattedValue
                    .split(".")[1]
                    .substring(
                      1,
                      el.price.displayformattedValue.split(".")[1].length
                    )
                    .split(",")
                    .join("")
                : null,
              productPriceStrike: el.wasPriceData.displayformattedValue
                ? el.wasPriceData.displayformattedValue
                    .split(".")[1]
                    .substring(
                      1,
                      el.wasPriceData.displayformattedValue.split(".")[1].length
                    )
                    .split(",")
                    .join("")
                : null,
              productLink: `https://ajio.com${el.url}`,
              size: el.productSizeData
                ? JSON.stringify(el.productSizeData.sizeVariants)
                : null,
              productRating: null,
            });
          });
        } catch (e) {
          console.log(e);
        }
        callBack(
          data,
          true
          // i,
          // loopArry.length - 1,
          // j,
          // loopArry[i].length - 1,
          // p,
          // Object.keys(loopArry[i][j]),
        );
      }
    }
  }
};
