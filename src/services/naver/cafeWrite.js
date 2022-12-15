const path = require("path");
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

let _naver = {};

_naver.fn_cafe_write = async (param) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
        // 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.

        //executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',  
        // 디폴트가 puppetter 내장된 크롬 브라우저를 이용하므로, 실행PC의 브라우저로 재설정
    });

    //const page = await browser.newPage();

    const [ page ] = await browser.pages();
    await page.goto('https://nid.naver.com/nidlogin.login');
    
    /*: 값 가져올 때
        const content = await page.content;
        const $ = cheerio.load(content);
        const lists = $(".news");
        console.log(lists);
    */
    await page.evaluate((id, pw) => {
        document.querySelector('#id').value = id;
        document.querySelector('#pw').value = pw;
    }, param._data.id, param._data.pw);

    await page.waitForTimeout(2000)
    await page.click('[type=submit]');

    await page.waitForTimeout(2000)
    await page.click('[data-clk="svc.cafe"]');

    for(const row of param.todos) {
        if(row.done) {
            console.log(`>> Page Goto ... ${row.description}`);
            await page.waitForTimeout(2000)
            await page.goto(row.description);
        }
    }
    await browser.close();              // 브라우저 종료
}

module.exports = _naver;