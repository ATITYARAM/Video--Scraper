const { chromium } = require("playwright");
const fs = require("fs");
const readline = require("readline");

const OUTPUT = "references.md";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
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

    fs.writeFileSync(
        OUTPUT,
        ""
    );

    console.log(`
=========================================
Open any chapter.
Open any section.

Press ENTER whenever you start
a NEW SECTION.

Then open videos manually.

Everything is appended to:
${OUTPUT}

Ctrl+C to stop.
=========================================
`);

    let writeHeader = false;
    let lastVideo = "";

    rl.on("line", () => {

        writeHeader = true;

        console.log(">>> New references block");

    });

    let clicked = {
        subtopic: ""
    };

    await page.exposeFunction("rememberCard", data => {
        clicked = data;
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

            window.rememberCard({
                subtopic
            });

        }, true);

    });

    while (true) {

        try {

            if (await page.locator("video source").count()) {

                const url =
                    await page.locator("video source").getAttribute("src");

                if (url && url !== lastVideo) {

                    lastVideo = url;

                    const title =
                        (await page.locator("app-video-list h4").textContent()).trim();

                    if (writeHeader) {

                        fs.appendFileSync(
                            OUTPUT,
`references:
    videos:

`
                        );

                        writeHeader = false;
                    }

                    fs.appendFileSync(
                        OUTPUT,
`      - custom:
          title: "${title}"
          desc: "${clicked.subtopic}"
          url: "${url}"

`
                    );

                    console.log("Saved:", title);

                }

            }

        } catch (e) {}

        await page.waitForTimeout(300);

    }

})();
