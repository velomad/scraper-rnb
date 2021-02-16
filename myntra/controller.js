const { scraper } = require("./scraper");
const { myntraBaseUrl } = require("../config/keys");
const { myntraService } = require("./service");

module.exports = {
  myntra: (req, res) => {
    var pagesToScrape = 2;

    console.log("starting to scrap...");
    scraper(myntraBaseUrl, pagesToScrape, (data, response) => {
      if (response) {
        // console.log(data);

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

        // myntraService(arry, (err, results) => {
        //   if (err) {
        //     console.error(err);
        //   } else {
        //     console.log(results);
        //   }
        // });
      }
    });
  },
};
