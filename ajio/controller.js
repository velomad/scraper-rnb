const { scraper } = require("./scraper");
const { ajioBaseUrl } = require("../config/keys");
const { ajioService } = require("./service");

module.exports = {
  ajio: (req, res) => {
    var pagesToScrape = 2;

    console.log("starting to scrap...");
    scraper(ajioBaseUrl, pagesToScrape, (data, response) => {
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

        ajioService(arry, (err, results) => {
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
