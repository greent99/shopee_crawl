from bs4 import BeautifulSoup
import requests
import json
import csv
import numpy as np
import pandas as pd
import http.client 
import re

category_base_url = "https://shopee.vn/api/v2/search_items/?by=relevancy&limit=50&match_id=13030&newest={}&order=desc&page_type=search&version=2"
domain = 'https://shopee.vn/'


product_id_file = "./data/product-id-shopee.xlsx"


def crawl_product_id():
    product_list = np.array([['itemId', 'shopId', 'name', 'brand', 'url', 'rating_average', 'rating_star']])
    i = 0
    newest = 0
    while(True):
        itemId = -1
        shopId = -1
        name = ""
        brand = ""
        rating_average = -1
        rating_star = []
        url = ""
        payload = {}
        headers = {
            'user-agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
        }
        params = {
        }
        category_url = category_base_url.format(newest)
        response = requests.request(
            "GET", category_url, headers=headers, data=payload, params=params)
        if(response.status_code == 400 or i > 40):
            break
        y = response.json()
        if(len(y['items']) == 0): 
            break
        print("page", i)
        print(len(y["items"]))
        for j in range(len(y["items"])):
            itemId = y["items"][j]['itemid']
            shopId = y['items'][j]['shopid'] 
            name =  y['items'][j]['name']
            brand = y['items'][j]['brand']
            rating_average = y["items"][j]['item_rating']['rating_star']
            rating_star = y["items"][j]['item_rating']['rating_count']
            url = handleUrlShopee(name,itemId,shopId)
            #price = handlePriceShopee(itemId, shopId)
            product_list = np.append(product_list, [[itemId, shopId, name, brand, url, rating_average, rating_star]], axis=0)
        i += 1
        newest = newest + 50
    print('product_list', product_list)
    print('len(product_list)', len(product_list))
    return product_list


def write_csv_file(data_matrix, file_path, columns):
    df = pd.DataFrame(data_matrix, columns=columns)
    print(df)
    df.to_excel(file_path, header=False, index=False, engine='xlsxwriter')




def handleUrlShopee(name, itemId, shopId):
    newName = name.replace(",", "")
    newName = re.sub(r'\s+', '-', newName)
    url = domain + newName + '.-i.' + str(shopId) + '.' + str(itemId)
    return url

# def handlePriceShopee(itemId, shopId):
#     params = 'itemid=' + str(itemId) + '&shopid=' + str(shopId)
#     param_md5 = hashlib.md5(params)
#     text_hash = "55b03" + param_md5 + "55b03"
#     price = hashlib.md5(text_hash)
#     return price


#crawl id tất cả sản phẩm trong mục nhà cửa đời sống
product_list = crawl_product_id()

#  ghi file các id sản phẩm vừa crawl vào file product-id.txt
write_csv_file(product_list, product_id_file, ['itemId', 'shopId', 'name', 'brand', 'url', 'rating_average', 'rating_star'])
print('Done crawl id')


