const puppeteer = require('puppeteer');
const readXlsxFile = require('read-excel-file/node');
const excel = require('node-excel-export');
const fs = require('fs');


function run (url) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();   
            await page.goto(url);
            await page.setViewport({
                width: 1080,
                height: 800
            });
            let i = 0
            let result_all_page = []
             while(i < 100)
             {
                await autoScroll(page);
                let data_one_page = await page.evaluate(async () => {
                    var selector = document.querySelectorAll("._32hnQt .WTFwws._1lK1eK._5W0f35")
                    let result_one_page = []
                    selector.forEach(item => {
                        let priceSelector = item.querySelectorAll("._29R_un")[0]
                        result_one_page.push(priceSelector.innerText)
                    })
                    return result_one_page;
                })
                await page.click(".shopee-mini-page-controller .shopee-mini-page-controller__next-btn")
                console.log(`page ${i}: ${data_one_page.length}`)
                result_all_page = result_all_page.concat(data_one_page)
                i = i + 1
             }
            await browser.close();
            return resolve(result_all_page);
        } catch (e) {
            return reject(e);
        }
    })
}
 run('https://shopee.vn/M%C3%A1y-t%C3%ADnh-Laptop-cat.13030')
    .then(data => {
        console.log(data.length)
        readXlsxFile('./data/product-id-shopee.xlsx').then((rows) => {
            // except header in file product-id-shopee
            if(data.length == rows.length - 1)
            {
                let dataset = []
                for(let i = 1; i < rows.length; i++)
                {
                    let dataObj = {}
                    dataObj = {
                        'itemId': rows[i][0],
                        'shopId': rows[i][1],
                        'name': rows[i][2],
                        'price': data[i-1],
                        'brand': rows[i][3],
                        'url': rows[i][4],
                        'rating_average': rows[i][5],
                        'rating_star': rows[i][6]
                    }    
                    dataset.push(dataObj)
                }
                writeToExcel('./data/product-shoppe-has-price.xlsx', dataset)
                console.log("Done write file excel")
            }
            else
                console.log('Data crawl wrong!')
        })
    })
    .catch(console.error);



function writeToExcel(path,dataset)
{
    const styles = {
        headerDark: {
          font: {
            color: {
              rgb: '00000000'
            },
            sz: 13,
          }
        },
      };

    const heading = [
    ]

    const specification = {
        itemId: {
          displayName: 'Item Id',
          headerStyle: styles.headerDark,
          width: '7' // <- width in pixels
          
        },
        shopId: {
            displayName: 'Shop Id',
            headerStyle: styles.headerDark,
          width: '7' // <- width in chars (when the number is passed as string)
        },
        name: {
            displayName: 'Name',
            headerStyle: styles.headerDark,
          width: '50' // <- width in pixels
        },
        price: {
            displayName: 'Price',
            headerStyle: styles.headerDark,
            width: '15'
        },
        brand: {
            displayName: 'Brand',
            headerStyle: styles.headerDark,
            width: '10'
        },
        url: {
            displayName: 'URL',
            headerStyle: styles.headerDark,
            width: '45'
        },
        rating_average: {
            displayName: 'Rating average',
            headerStyle: styles.headerDark,
            width: '15'
        },
        rating_star: {
            displayName: 'Rating star',
            headerStyle: styles.headerDark,
            width: '30'
        },
      }

    const report = excel.buildExport(
        [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
          {
            name: 'Report', // <- Specify sheet name (optional)
            heading: heading, // <- Raw heading array (optional)
            specification: specification, // <- Report specification
            data: dataset // <-- Report data
          }
        ]
      );
    fs.writeFileSync(path, report, function(err){
        if(err){
            console.log(error)
        }
    })
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 300;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
  }


