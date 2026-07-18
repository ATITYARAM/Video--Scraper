const { chromium } = require("playwright");

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
==========================================
Open a chapter.
Open a section.
Click videos manually.
Press Ctrl+C to stop.
==========================================
`);

    let currentSection = "";
    let lastUrl = "";

    // information about the card you clicked
    let clicked = null;

    // This runs every time a page is loaded
    page.on("framenavigated", async () => {

        try {

            // --------------------------
            // SECTION PAGE
            // --------------------------
            if (await page.locator(".video-box").count()) {

                await page.evaluate(() => {

                    if (window.__hookInstalled)
                        return;

                    window.__hookInstalled = true;

                    document.addEventListener("click", e => {

                        const card = e.target.closest(".video-box");

                        if (!card)
                            return;

                        const section =
                            card
                                .closest(".mb-3")
                                .querySelector(".card-title b")
                                ?.innerText
                                ?.trim();

                        const subtopic =
                            card
                                .querySelector("p")
                                ?.innerText
                                .replace("Subtopic :", "")
                                .trim();

                        const concept =
                            card
                                .querySelector("p b")
                                ?.innerText
                                .replace("Concept :", "")
                                .trim();

                        window.__clicked = {
                            section,
                            subtopic,
                            concept
                        };

                    }, true);

                });

            }

            // --------------------------
            // VIDEO PAGE
            // --------------------------
            if (await page.locator("video source").count()) {

                clicked = await page.evaluate(() => window.__clicked);

                const url =
                    await page.locator("video source").getAttribute("src");

                if (!url || url === lastUrl)
                    return;

                lastUrl = url;

                const title =
                    (await page.locator("app-video-list h4").textContent()).trim();

                if (!clicked)
                    return;

                if (clicked.section !== currentSection) {

                    currentSection = clicked.section;

                    console.log();
                    console.log("references:");
                    console.log("  videos:");
                    console.log();

                }

                console.log(`    - custom:
        title: "${title}"
        desc: "${clicked.subtopic}"
        url: "${url}"
`);

            }

        } catch {

        }

    });

    while (true)
        await page.waitForTimeout(1000);

})();
