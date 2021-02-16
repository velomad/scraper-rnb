const { scraper } = require("./scraper");
const { tataBaseUrl } = require("../config/keys");
const { tataService } = require("./service");

module.exports = {
  tata: (req, res) => {
    // var pagesToScrape = 2;

    console.log("starting to scrap...");
    scraper(tataBaseUrl, (data, response) => {
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

        tataService(arry, (err, results) => {
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
