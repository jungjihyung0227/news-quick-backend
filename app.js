const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

app.use(express.json());

app.get("/news", async (req, res) => {
  const result = await axios.get(
    "https://openapi.naver.com/v1/search/news.json?display=10&query=추석&sort=date",
    {
      headers: {
        "X-Naver-Client-Id": "0U1pUue5Ak1vO_JsWU6K",
        "X-Naver-Client-Secret": "GLRwCMSmY4",
      },
    }
  );

  res.json(result.data);
});

app.post("/news-link", async (req, res) => {
  const { path } = req.body;
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(path);

  const article = await page.waitForSelector("article");
  const content = await article.evaluate((el) => el.textContent);
  console.log(content);
  const result = await axios.post(
    "https://naveropenapi.apigw.ntruss.com/text-summary/v1/summarize",

    // document: { content },
    // option: { language: "ko", model: "news", tone: 2 },
    {
      document: {
        // title: "'하루 2000억' 판 커지는 간편송금 시장",
        content: content,
      },
      option: {
        language: "ko",
        model: "news",
        tone: 2,
        summaryCount: 3,
      },
    },
    {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": "tbbt6qb4vz",
        "X-NCP-APIGW-API-KEY": "Qsy9tSfnTrFT1jIXstpgUtE6KbE6HIQOlW1bmCoC",
        "Content-Type": "application/json",
      },
    }
  );

  // const result = await axios.get(req.body.path);
  // const $ = cheerio.load(result);

  res.json({
    result: result.data.summary,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
