const { chromium } = require("playwright");

const CHAPTER_URL =
"https://manarkeni.tnschools.gov.in/Manrkeni-home/chapter;class=12;medium=19;termId=4;subjectId=3;subjectName=Mathematics";

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext({
        storageState: "auth.json"
    });

    const page = await context.newPage();

    await page.goto(CHAPTER_URL);

await page.waitForLoadState("networkidle");

console.log("Loaded");

const fs = require("fs");

const results = [];

while (true) {
    console.clear();

    const heading = await page.locator("h4").first().textContent();

    const subtopic = await page.locator("text=Subtopic:").textContent().catch(() => "");

    const concept = await page.locator("text=Concept:").textContent().catch(() => "");

    const mp4 = await page.locator("video source").getAttribute("src").catch(() => "");

    console.log("Heading :", heading);
    console.log(subtopic);
    console.log(concept);
    console.log(mp4);

    results.push({
        heading,
        subtopic,
        concept,
        mp4
    });

    fs.writeFileSync("videos.json", JSON.stringify(results, null, 2));

    console.log("");
    console.log("Open the NEXT video manually.");
    console.log("Press ENTER when it has opened.");

    await new Promise(resolve => process.stdin.once("data", resolve));
}

})();
