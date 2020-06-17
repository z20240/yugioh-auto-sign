#!/usr/bin/env node
const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');
const 表單資訊 = require('./表單資訊.js');

const autoSign = async (報名場次) => {
    const 瀏覽器 = await puppeteer.launch({
        executablePath: 表單資訊.Google路徑,
        args: ['--no-sandbox'],
        headless: false,
        defaultViewport: {
            width: 800,
            height: 600,
        }
    });

    const 網頁 = await 瀏覽器.newPage();
    await 網頁.goto(表單資訊.報名網址);

    await 網頁.screenshot({path: 'example.png'});

    while (await 網頁.$('.freebirdThemedRadio') === null) {
        console.log('--> 等待報名表單開啟: 場次' + 報名場次 + " " + (new Date()).toLocaleString());
        await 網頁.reload();
        await 網頁.waitFor(500);
    }

    await 網頁.waitFor('.freebirdThemedRadio');
    const radioButtons = await 網頁.$$('.freebirdThemedRadio');

    // 場次:
    if (報名場次 === 1) radioButtons[0].click();
    if (報名場次 === 2) radioButtons[1].click();

    // 遊戲王ID
    await 網頁.waitFor('input[aria-label="遊戲王ID"]');
    await 網頁.type('input[aria-label="遊戲王ID"]', 表單資訊.遊戲王ID);

    // 居住地
    radioButtons[2].click();

    // 年齡
    await 網頁.waitFor('input[aria-label="年齡"]');
    await 網頁.type('input[aria-label="年齡"]', String(表單資訊.年齡));

    // 真實姓名
    await 網頁.waitFor('input[aria-label="真實姓名"]');
    await 網頁.type('input[aria-label="真實姓名"]', String(表單資訊.姓名));

    // 生日
    await 網頁.waitFor('input[type="date"]');
    await 網頁.type('input[type="date"]', String(表單資訊.生日));

    // 身分證字號
    await 網頁.waitFor('input[aria-label="身分證字號"]');
    await 網頁.type('input[aria-label="身分證字號"]', String(表單資訊.身分證字號));

    // 卡套領取店家
    await 網頁.tap('[role="listbox"]');
    await 網頁.waitFor(200);
    const options = await 網頁.$$(`[data-value="${表單資訊.卡套領取店家}"]`);
    options[options.length - 1].click();

    // 確定送出
    await 網頁.waitFor(300);
    const button = await 網頁.$(`[role="button"]`);
    button.click();

    while (await 網頁.$(`[role="button"]`) !== null) {
        await 網頁.waitFor(300);
        const button = await 網頁.$(`[role="button"]`);
        button.click();

        console.log("表單未送出，嘗試重新送出表單");
    }

    console.log('場次' + 報名場次 + ' 報名完成！');
    網頁.close();
};

(async () => {
    autoSign(1);
    autoSign(2);
})();