const path = require("path");
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const io = require('socket.io-client')
const socket = io("http://localhost:18092")
const iconv = require('iconv-lite');

function sendMessage(data) {
    socket.emit('log', data)
}

let _scraping = {};

_scraping.exec = async (param) => {
    const browser = await puppeteer.launch({
        headless: param.option.headless,
        defaultViewport: null
        // 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.

        //executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',  
        // 디폴트가 puppetter 내장된 크롬 브라우저를 이용하므로, 실행PC의 브라우저로 재설정
    });

    //const page = await browser.newPage();

    const [ page ] = await browser.pages();
    
    /*: 값 가져올 때
        const content = await page.content();
        const $ = cheerio.load(content);
        const lists = $(".news");
        console.log(lists);
    */

    let object = {};
    let paramMap = {};
    object['COLLECT'] = [];
    for(const list of param.todos) {
        if(list.done == true) {
            if(list.type == 'COLLECT') {
                object[list.type] = [list.description, ...object[list.type]];
            } else {
                object[list.type] = list.description;
            }
        }
    }

    sendMessage(`[[셋팅 옵션]] ${JSON.stringify(object)}`);
    
    for(var i=1; i<=Number(object['PAGESIZE']); i++) {
        paramMap[object.PAGENM] = i;
        await page.goto(`${object.URL}?${new URLSearchParams(
            { ...paramMap }
        )}`);
        sendMessage(`[[페이지 이동]] ${object.URL}?${new URLSearchParams({ ...paramMap })}`);

        const content = await page.content();
        const $ = cheerio.load(content);
        const lists = $(object['CONTENT']);

        //: 컨텐츠
        for(var j=1; j<=lists.length; j++) {
            await page.click(`${object['CONTENT']}:nth-child(${j})`);
            //sendMessage(`[[컨텐츠 접근]] ${object.URL}?${new URLSearchParams({ ...paramMap })}`);
            await page.waitForTimeout(2000)

            for(const collect of object['COLLECT']) {

            }
            return false;
        }

        return false;
        await page.waitForTimeout(2000)
    }
    await browser.close();              // 브라우저 종료
}

module.exports = _scraping;