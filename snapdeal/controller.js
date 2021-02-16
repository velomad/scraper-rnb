const { scraper } = require("./scraper");
const { snapdealBaseUrl } = require("../config/keys");
const { snapdealService } = require("./service");

module.exports = {
  snapdeal: (req, res) => {
    var pagesToScrape = 2;

    console.log("starting to scrap...");
    scraper(snapdealBaseUrl, (data, response) => {
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

        snapdealService(arry, (err, results) => {
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
