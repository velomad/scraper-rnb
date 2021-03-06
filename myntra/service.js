const pool = require("../db");

module.exports = {
  myntraService: (params, cb) => {
    const sql =
      "INSERT INTO products (website, category, displayCategory, gender, productName, brandName, imageUrl, discountPercent, productPrice, productPriceStrike, productLink, size, productRating) VALUES ?";
    const values = [params];
    pool.query(sql, values, (err, results) => {
      if (err) {
        cb(err);
      } else {
        cb(null, results);
      }
    });
  },
};
