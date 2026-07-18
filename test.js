const { chromium } = require("playwright");

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(
        "https://manarkeni.tnschools.gov.in/Manrkeni-home/Rbc;class=12;medium=19;termId=4;subjectId=13;subjectName=Chemistry;chapterId=3476;chapterName=p%20-block%20elements%202",
        {
            waitUntil: "networkidle"
        }
    );

    console.log(await page.title());

})();