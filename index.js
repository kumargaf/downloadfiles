const puppeteer = require('puppeteer')
const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path');
// const docId = process.argv[2];
// if (!docId) {
//     throw "Please provide docId as a first argument";
// }
const docId = '2019011401010001';
downloadFile(docId);
async function downloadFile (docId) {
    console.log("start run");
    const timeout = 120 * 1000;
    const downloadFolder = './download';
    if(!docId){
        throw "Please provide docId as a first argument"
    }
    let url = `https://a836-acris.nyc.gov/DS/DocumentSearch/DocumentImageView?doc_id=${docId}`;
    let browser = null;
    let saveButtonSelector = 'img[title="Save"]';
    let okButtonSelector = '.vtm_exportDialogMsgBlock > span'
    let okButtonXpath = 'span[text() = "Ok"]'
    try {
        browser = await puppeteer.launch({headless:false});
        const page = await browser.newPage();
        await page.goto(url, {waitUntil:'networkidle2', timeout: timeout});
        await sleep(2 * 1000);
        const dirPath = `${downloadFolder}`
        if (!fs.existsSync(downloadFolder))
        mkdirp(downloadFolder, err => {
            if (err) throw err
        })
       
        console.log("After setDownloadBehavior");
        const frames = await page.frames();
        let mainFrame =  frames.find(f => f.name() === 'mainframe');
        const client = await page.target().createCDPSession();
        client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(__dirname, "download")});
        await mainFrame.evaluate(function (selector) {
            document.querySelectorAll(selector)[0].click()
        }, saveButtonSelector);
        await sleep(1 * 1000);
        let [okButton] = await mainFrame.$x("//span[contains(., 'OK')]");
        await okButton.click();
        await sleep(20 * 1000);
        // check if downloaded file exists

        let filename = `${docId}&page.pdf`;
        let downloadedFilePath = `${downloadFolder}/${filename}`;
        if (fs.existsSync(downloadedFilePath)){
            await RemoteUpload(downloadedFilePath, 'remote');
        }else{
            throw 'Error while downloading file for docId : '+ docId;
        }

    } catch (error) {
        console.log("Error : "+ error);
    }finally{
        if(browser)await browser.close();
        console.log("end run");
    } 
}

async function sleep(ms, human = true) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
}

async function RemoteUpload(local, remote){
    // upload file
    console.log('upload file to remote location')
}





