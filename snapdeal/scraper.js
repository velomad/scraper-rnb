const puppeteer = require("puppeteer");
const userAgent = require("user-agents");
var catgories = require("./categories.js");

module.exports.scraper = async (url, callBack) => {
	const browser = await puppeteer.launch({
		headless: false,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	const page = await browser.newPage();
	await page.setUserAgent(userAgent.toString());

	await page.setViewport({ width: 1200, height: 768 });

	function wait(ms) {
		return new Promise((resolve) => setTimeout(() => resolve(), ms));
	}

	await page.goto(`${url}`, {
		waitUntil: "networkidle0",
	});

	async function autoScroll(page) {
		await page.evaluate(async () => {
			await new Promise((resolve, reject) => {
				// let totalHeight = 0;
				let distance = 100;
				let timer = setInterval(() => {
					// let scrollHeight = document.body.scrollHeight;
					window.scrollBy(0, distance);
					// totalHeight += distance;
					let getText = document.querySelector(
						"#searchMessageContainer > div > span:nth-child(1)",
					).textContent;
					if (
						document.querySelectorAll("#products > section > div").length >
						Number(((getText.match(/(\d+)/)[0] / 100) * 0.8).toFixed(0))
					) {
						getText = "";
						window.scrollTo(0, 0);
						clearInterval(timer);
						resolve();
					}
				}, 50);
			});
		});
	}

	var loopArry;
	for (var t of catgories) {
		loopArry = [t.men, t.women];
	}
	for (var i = 0; i < loopArry.length; i++) {
		for (var text = 0; text < loopArry[i].length; text++) {
			const input = await page.$("#inputValEnter");
			await input.click({ clickCount: 3 });
			await input.press("Backspace");
			await wait(2000);
			await page.type("input[name=keyword]", loopArry[i][text], { delay: 20 });
			await wait(2000);
			await page.keyboard.press("Enter");
			await page.waitForNavigation();
			await wait(2000);
			await autoScroll(page);
			await wait(2000);

			var category = loopArry[i][text].replace(/\s/g, "-").toLowerCase();
			var displayCategory = loopArry[i][text].toLowerCase();

			let data = await page.evaluate(
				async (category, displayCategory, i) => {
					let products = [];
					let productElements = document.querySelectorAll(
						"#products > section > div",
					);

					productElements.forEach((el) => {
						let productJson = {};
						try {
							(productJson.website = "snapdeal"),
								(productJson.category = category),
								(productJson.displayCategory = displayCategory),
								(productJson.gender = i === 0 ? "men" : "women");

							productJson.productName = el.querySelector(".product-title")
								? el.querySelector(".product-title").innerText
								: null;
							productJson.imageUrl = el.querySelector(".product-image")
								? el.querySelector(".product-image").srcset
								: null;
							productJson.productPriceStrike = el.querySelector(
								".lfloat.product-price",
							)
								? el.querySelector(".lfloat.product-price").innerText.split(" ")[1].split(",").join("")
								: null;
							productJson.productPrice = el.querySelector(
								".lfloat.product-desc-price.strike",
							)
								? el.querySelector(".lfloat.product-desc-price.strike")
										.innerText.split(" ")[1].split(",").join("")
								: null;
							productJson.discountPercent = el.querySelector(
								".product-discount",
							)
								? el.querySelector(".product-discount").innerText.split(" ")[0].slice(0,-1)
								: null;
							productJson.productLink = el.querySelector(
								".product-tuple-image > a",
							)
								? el.querySelector(".product-tuple-image > a").href
								: null;
						} catch (e) {
							console.log(e);
						}
						products.push(productJson);
					});
					return products;
				},
				category,
				displayCategory,
				i,
			);
			await wait(1000);
			callBack(data, true, loopArry[i][text]);
		}
	}

	await browser.close();
};
