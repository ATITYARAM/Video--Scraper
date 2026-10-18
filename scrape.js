const { chromium } = require("playwright");
const fs = require("fs");
const readline = require("readline");

const OUTPUT = "references.md";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let printHeader = true;
let clickedVideo = null;

rl.on("line", () => {
    printHeader = true;
    console.log("\nStarted a new references block.\n");
});

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext({
        storageState: "auth.json"
    });

    const page = await context.newPage();

    await page.goto("https://manarkeni.tnschools.gov.in/subject/3", {
        waitUntil: "domcontentloaded"
    });

    console.log(`
===========================================
Open a chapter.
Open a topic/subtopic.
Click videos manually.
Everything is saved to ${OUTPUT}
Press ENTER when a NEW section starts.
Press Ctrl+C to stop.
===========================================
`);

    let lastVideo = "";

    /*
     * Detect video button clicks in the new GUI.
     */
    await page.exposeFunction("storeClickedVideo", data => {
        clickedVideo = data;
    });

    await page.addInitScript(() => {

        document.addEventListener("click", e => {

            const button = e.target.closest("button");

            if (!button)
                return;

            /*
             * New video buttons contain:
             *   img
             *   p = video title
             */
            const videoText = button.querySelector("p");

            if (!videoText)
                return;

            const img = button.querySelector("img");

            if (!img)
                return;

            const videoTitle = videoText.innerText.trim();

            /*
             * The video buttons are inside the
             * accordion card.
             *
             * Get the accordion/topic title.
             */
            const card = button.closest("div.bg-card");

            let topic = "";

            if (card) {

                const headingButton = [...card.querySelectorAll("button")]
                    .find(btn => {
                        const span = btn.querySelector("span");
                        return span &&
                               !btn.querySelector("img") &&
                               span.innerText.trim();
                    });

                if (headingButton) {
                    topic = headingButton
                        .querySelector("span")
                        ?.innerText
                        .trim() || "";
                }
            }

            window.storeClickedVideo({
                title: videoTitle,
                topic: topic
            });

        }, true);

    });

    while (true) {

        try {

            /*
             * NEW GUI:
             *
             * <video src="...mp4">
             *
             * Not:
             * <video><source src="...">
             */
            const video = page.locator("video").first();

            if (!(await video.count())) {
                await page.waitForTimeout(300);
                continue;
            }

            const url = await video.getAttribute("src");

            if (!url || url === lastVideo) {
                await page.waitForTimeout(300);
                continue;
            }

            lastVideo = url;

            /*
             * Get the title shown below the video.
             */
            let title = "";

            try {
                title = await video.evaluate(el => {

                    const card = el.closest("div.bg-card");

                    if (!card)
                        return "";

                    const span = card.querySelector(
                        "span.text-sm.font-bold"
                    );

                    return span?.innerText.trim() || "";
                });
            } catch {
                // ignore
            }

            /*
             * Fallback to the title captured
             * from the clicked video button.
             */
            if (!title) {
                title = clickedVideo?.title || "Untitled Video";
            }

            /*
             * Topic / accordion name.
             */
            const desc =
                clickedVideo?.topic ||
                clickedVideo?.title ||
                title;

            if (printHeader) {

                printHeader = false;

                fs.appendFileSync(
                    OUTPUT,
                    `\nreferences:
    videos:
`
                );
            }

            fs.appendFileSync(
                OUTPUT,
                `        - custom:
            title: "${title.replace(/"/g, '\\"')}"
            desc: "${desc.replace(/"/g, '\\"')}"
            url: "${url}"
`
            );

            console.log("\nSaved:");
            console.log("  Title :", title);
            console.log("  Desc  :", desc);
            console.log("  URL   :", url);

        } catch (err) {
            // Keep scraper alive if GUI changes temporarily.
        }

        await page.waitForTimeout(300);
    }

})();