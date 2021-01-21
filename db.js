const mysql = require("mysql");

var pool = mysql.createPool({
	multipleStatements: true,
	host: "103.102.234.200",
	user: "lggfesav_reachnbuy",
	password: "reachnbuy@scraper",
	database: "lggfesav_scraper",
	port:3306
});

pool.getConnection((err) => {
  if (err) {
    console.log("Error Connecting to DB.", err);
  } else {
    console.log("Successfully Connected to the Database.");
  }
});

module.exports = pool;
