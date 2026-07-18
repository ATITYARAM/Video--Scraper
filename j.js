const { chromium } = require("playwright");
const fs = require("fs");
const readline = require("readline");

const OUTPUT = "references.md";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let printHeader = true;

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

    await page.goto(
        "https://manarkeni.tnschools.gov.in/Manrkeni-home/chapter;class=12;medium=19;termId=4;subjectId=3;subjectName=Mathematics"
    );

    console.log(`
===========================================
Open any chapter.
Open any section.
Press ENTER when a NEW section starts.
Open videos manually.
Everything is saved to ${OUTPUT}
Press Ctrl+C to stop.
===========================================
`);

    let lastVideo = "";

    // Store clicked card information
    await page.exposeFunction("storeClicked", data => {
        global.clicked = data;
    });

    await page.addInitScript(() => {

        document.addEventListener("click", e => {

            const card = e.target.closest(".video-box");

            if (!card)
                return;

            const subtopic =
                card.querySelector("p")
                    ?.innerText
                    .replace("Subtopic :", "")
                    .trim();

            const concept =
                card.querySelector("p b")
                    ?.innerText
                    .replace("Concept :", "")
                    .trim();

            window.storeClicked({
                subtopic,
                concept
            });

        }, true);

    });

    while (true) {

        try {

            if (!(await page.locator("video source").count())) {
                await page.waitForTimeout(300);
                continue;
            }

            const url =
                await page.locator("video source").getAttribute("src");

            if (!url || url === lastVideo) {
                await page.waitForTimeout(300);
                continue;
            }

            lastVideo = url;

            const title =
                (await page.locator("app-video-list h4").textContent()).trim();

            const desc =
                global.clicked?.subtopic || title;

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
`      - custom:
          title: "${title}"
          desc: "${desc}"
          url: "${url}"
`
            );

            console.log("Saved:", title);

        } catch {

        }

        await page.waitForTimeout(300);

    }

})();


