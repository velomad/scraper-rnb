const { scraper } = require("./scraper");
const { amazonBaseUrl } = require("../config/keys");
const { amazonService } = require("./service");

module.exports = {
  amazon: (req, res) => {
    var pagesToScrape = 2;

    console.log("starting to scrap...");
    scraper(amazonBaseUrl, pagesToScrape, (data, response) => {
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

        amazonService(arry, (err, results) => {
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
