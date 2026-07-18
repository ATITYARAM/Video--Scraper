const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    await page.goto("https://manarkeni.tnschools.gov.in");

    console.log("Login manually.");
    console.log("When the Home page appears, press ENTER here.");

    process.stdin.resume();

    process.stdin.once("data", async () => {
        await context.storageState({
            path: "auth.json"
        });

        console.log("Saved login.");

        await browser.close();
    });
})();
