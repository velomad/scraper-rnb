const puppeteer = require("puppeteer-extra");
const userAgent = require("user-agents");
var categories = require("./categories");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

module.exports.scraper = async (url, callBack) => {
	puppeteer.use(StealthPlugin());

	const browser = await puppeteer.launch({
		headless: false,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	const page = await browser.newPage();
	await page.setUserAgent(userAgent.toString());
	await page.setUserAgent(
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
	);

	await page.setViewport({ width: 1200, height: 768 });

	function wait(ms) {
		return new Promise((resolve) => setTimeout(() => resolve(), ms));
	}

	await page.goto(`${url}`, { waitUntil: "networkidle0", timeout: 0 });

	async function autoScroll(page) {
		await page.evaluate(async () => {
			await new Promise((resolve, reject) => {
				// let totalHeight = 0;
				let distance = 300;
				let timer = setInterval(() => {
					// let scrollHeight = document.body.scrollHeight;
					window.scrollBy(0, distance);
					// totalHeight += distance;
					let getText = document
						.querySelector("._3t8aMWoK9YOS-HgAORjhum")
						.innerText.split(" ")[1];

					let productLen = document.querySelectorAll("._2yDWfeidsag2HZGFeU4HUj")
						.length;
					if (
						productLen >
						Number(
							((Number(getText.replace(/[{()}]/g, "")) / 100) * 20).toFixed(0),
						)
					) {
						getText = "";
						window.scrollTo(0, 0);
						clearInterval(timer);
						resolve();
					}
				}, 100);
			});
		});
	}
	var loopArry;
	for (var t of categories) {
		loopArry = [t.men, t.women];
	}
	for (var i = 0; i < loopArry.length; i++) {
		for (var text = 0; text < loopArry[i].length; text++) {
			const input = await page.$(
				"._26te1Kp4kxwtlBGHe9K-j1.uRnUoWUuRtEeKI0UJ4fVl > input",
			);
			// await input.click({ clickCount: 3 });
			// await input.press("Backspace");
			// await wait(1000);
			await page.type("input[type=search]", loopArry[i][text], { delay: 20 });
			await wait(1000);
			await page.keyboard.press("Enter");
			// await page.waitForNavigation();
			await wait(3000);

			// Get the height of the rendered page
			const bodyHandle = await page.$("body");
			const { height } = await bodyHandle.boundingBox();
			await bodyHandle.dispose();

			// Scroll one viewport at a time, pausing to let content load
			const viewportHeight = page.viewport().height;
			let viewportIncr = 0;
			while (viewportIncr + viewportHeight < height) {
				await page.evaluate((_viewportHeight) => {
					window.scrollBy(0, _viewportHeight);
				}, viewportHeight);
				await wait(600);
				viewportIncr = viewportIncr + viewportHeight;
			}

			// await autoScroll(page);
			// await wait(1000);

			var category = loopArry[i][text].replace(/\s/g, "-").toLowerCase();
			var displayCategory = loopArry[i][text].toLowerCase();

			let data = await page.evaluate(
				(category, displayCategory, i) => {
					window.scrollTo(0, 0);
					let products = [];
					let productElements = document.querySelectorAll(
						"._26uHe2QbvnuoUvswPtzSnX",
					);

					productElements.forEach((productElement) => {
						let productJson = {};
						try {
							(productJson.website = "tatacliq"),
								(productJson.category = category);
							productJson.displayCategory = displayCategory;
							productJson.gender = i === 0 ? "men" : "women";
							productJson.productLink = productElement.querySelector(
								"._1XmcWVFxUIyULCyoe8qGDQ",
							)
								? productElement.querySelector("._1XmcWVFxUIyULCyoe8qGDQ").href
								: null;
							productJson.imageUrl = productElement.querySelector(
								".rnVlQIG2OU_zvETUcW0TW",
							)
								? productElement.querySelector(".rnVlQIG2OU_zvETUcW0TW").src
								: null;
							productJson.brandName = productElement.querySelector(
								"._1CLeiJJCSL0f2IJrV53obi",
							)
								? productElement.querySelector("._1CLeiJJCSL0f2IJrV53obi")
										.innerText
								: null;
							productJson.productName = productElement.querySelector(
								".Bt9jWqBhJEHlqtj4x2xNa",
							)
								? productElement.querySelector(".Bt9jWqBhJEHlqtj4x2xNa")
										.innerText
								: null;
							productJson.productPriceStrike = productElement.querySelector(
								"._1shOb7_K6buhJQdpA10hpT",
							)
								? (productElement.querySelector("._1shOb7_K6buhJQdpA10hpT")
										.innerText).slice(1)
								: null;
							productJson.productPrice = productElement.querySelector(
								".MZydWWaSr0xQud-F-Jwfa",
							)
								? (productElement.querySelector(".MZydWWaSr0xQud-F-Jwfa")
										.innerText).slice(1)
								: null;
							productJson.discountPercent = productElement.querySelector(
								"._1IxIox0fPQHTc_jS_sokZD",
							)
								? (productElement.querySelector("._1IxIox0fPQHTc_jS_sokZD")
										.innerText).split(" ")[0].slice(0, -1)
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
				i
			);
			await wait(2000);
			callBack(data, true);
		}
	}
	await browser.close();
};
