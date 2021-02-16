const { scraper } = require("./scraper");
const { flipkartBaseUrl } = require("../config/keys");
const { flipkartService } = require("./service");

module.exports = {
  flipkart: (req, res) => {
    var pagesToScrape = 2;

    console.log("starting to scrap...");
    scraper(flipkartBaseUrl, pagesToScrape, (data, response) => {
      if (response) {
        console.log(data);

        let arry = [];

        data.map((el) => {
          arry.push([
            el.website,
            el.category,
            el.displayCategory,
            el.gender,
            el.productName,
            el.brandName,
            el.imageUrl,
            el.discountPercent,
            el.productPrice,
            el.productPriceStrike,
            el.productLink,
            el.size,
            el.productRating,
          ]);
        });

        console.log(data);

        flipkartService(arry, (err, results) => {
          if (err) {
            console.error(err);
          } else {
            console.log(results);
          }
        });
      }
    });
  },
};
