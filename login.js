const { chromium } = require("playwright");

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    await page.goto("https://manarkeni.tnschools.gov.in");

    console.log("");
    console.log("Login to Manarkeni.");
    console.log("After reaching the home page, press ENTER here.");
    console.log("");

    process.stdin.resume();

    process.stdin.once("data", async () => {

        await context.storageState({
            path: "auth.json"
        });

        console.log("auth.json saved successfully.");

        await browser.close();

        process.exit();

    });

})();
