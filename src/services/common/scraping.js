const path = require("path");
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const io = require('socket.io-client')
const socket = io("http://localhost:18092")
const xlsx = require('xlsx');

function sendMessage(data) {
    socket.emit('log', data)
}

let _scraping = {};
_scraping.exec = async (param) => {
    sendMessage(`[[시작]]`);
    sendMessage(`[[로딩중]]`);
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download('1069273');

    const browser = await puppeteer.launch({
        headless: param.option.headless,
        defaultViewport: null,
        executablePath: revisionInfo.executablePath
        
        // 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.

        //executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',  
        // 디폴트가 puppetter 내장된 크롬 브라우저를 이용하므로, 실행PC의 브라우저로 재설정
    });
    sendMessage(`[[브라우저 옵션]] ${puppeteer.executablePath()}`);

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
                object[list.type] = [...object[list.type], list.description];
            } else {
                object[list.type] = list.description;
            }
        }
    }
    sendMessage(`[[셋팅 옵션]] ${JSON.stringify(object)}`);
    
    let array = [];
    //: 페이지
    for(var i=1; i<=Number(object['PAGESIZE']); i++) {
        await page.waitForTimeout(2000)
        paramMap[object.PAGENM] = i;
        await page.goto(`${object.URL}?${new URLSearchParams(
            { ...paramMap }
        )}`);
        sendMessage(`[[페이지 이동]] ${object.URL}?${new URLSearchParams({ ...paramMap })}`);
        await page.waitForTimeout(2000)

        const content = await page.content();
        const $ = cheerio.load(content);
        const lists = $(object['CONTENT']);

        //: 컨텐츠
        for(var j=1; j<=lists.length; j++) {
            await page.waitForTimeout(2000)

            let contents = {};
            await page.click(`${object['CONTENT']}:nth-child(${j}) a`);
            sendMessage(`[[컨텐츠 진입]] PAGE: ${i}, CONTENTS: ${j}`);
            
            //: 수집 데이터
            for(const [index, collect] of object['COLLECT'].entries()) {
                await page.waitForTimeout(2000)

                try {
                    const element = await page.waitForSelector(collect);
                    const value = await element.evaluate(el => el.textContent);
                    contents[`collect${index}`] = value;
                    sendMessage(`[[데이터 확인]] collect${index}`);
                } catch(e) {
                }
            }
            array = [...array, contents];
            await page.goBack();
        }
    }
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(array);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'sheet1');
    sendMessage(JSON.stringify(array));
    sendMessage(`[[종료]]`);

    await browser.close();              // 브라우저 종료

    return xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer'});
    //return xlsx.writeFile(workbook, path.join(__dirname, 'json_to_sheet_result.xlsx'));
}

module.exports = _scraping;