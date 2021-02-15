import requests, re, time, json
import urllib.parse
from qiniu import Auth, put_file, etag, put_data
import qiniu.config
import hashlib, time, threading


class IjkDataApi:
    def __init__(self, base_uri, post_pswd):
        self.baseUri = base_uri
        self.category_list_api = base_uri + '?__ijk_flag=category_list'
        self.post_api = base_uri + '?__ijk_flag=post&ijk_password=' + str(post_pswd)

    def get_categories(self):
        text = requests.get(self.category_list_api).text
        data = []
        if text:
            arr = text.split('<br>')
            for item in arr:
                match_obj = re.match(r'<<<(.*)==(.*?)>>>', item, re.M | re.I)
                if match_obj:
                    data.append({
                        'id': match_obj.group(1),
                        'name': match_obj.group(2)
                    })
        return data

    # data = {
    #     'categories':'',
    #     'title':'',
    #     'text':'',
    #     'tag':'',
    #     'created':'',
    #     '__ijk_download_imgs_flag':'false',
    #     '__ijk_docImgs':'',
    #     'order':'',
    #     'author': '',
    #     'type': '',
    #     'status': '',
    #     'password': '',
    #     'allowComment': '1',
    #     'allowPing': '1',
    #     'allowFeed': '1',
    # }
    def send_post(self, data):
        categories = data.get('categories')
        title = data.get('title')
        text = data.get('text')
        if not categories or not title or not text:
            return -1
        #
        # tag = data.get('tag','')
        # __ijk_download_imgs_flag = data.get('__ijk_download_imgs_flag','false')
        # __ijk_docImgs = data.get('__ijk_docImgs','')

        # created = int(time.time()*1000)
        res = json.loads(requests.post(self.post_api, data=data).text)
        if res['rs']:
            print(urllib.parse.unquote(res['msg']))
            return 1
        else:
            print(urllib.parse.unquote(res['msg']))
            return 0


class BZ:
    def __init__(self):
        self.hv = "vertical"
        self.a = "4e4d610cdf714d2966000002"
        self.limit = 30
        self.current = 0
        self.d = "hot"
        self.currentPage = 1
        self.imgsUrl = []
        self.apis = [
            {'女性': '4e4d610cdf714d2966000000'},
            {'风景': '4e4d610cdf714d2966000002'},
            {'动漫': '4e4d610cdf714d2966000003'},
            {'动物': '4e4d610cdf714d2966000001'},
            {'游戏': '4e4d610cdf714d2966000007'},
            {'机械': '4e4d610cdf714d2966000005'},
            {'手绘': '4e4d610cdf714d2966000004'},
            {'文字': '5109e04e48d5b9364ae9ac45'},
            {'视觉': '4fb479f75ba1c65561000027'},
            {'物语': '4fb47a465ba1c65561000028'},
            {'设计': '4fb47a195ba1c60ca5000222'},
            {'情感': '4ef0a35c0569795756000000'},
            {'城市': '4fb47a305ba1c60ca5000223'},
            {'电影': '4e58c2570569791a19000000'},
            {'帅哥': '4e4d610cdf714d2966000006'},
            {'明星': '5109e05248d5b9368bb559dc'}

        ]

    def generate_api(self, img_type, limit=30, current=0):
        if not limit:
            limit = self.limit
        if not current:
            current = self.current
        return "http://service.aibizhi.adesk.com/v1/" + self.hv + "/category/" + img_type + "/" + self.hv + "?limit=" + str(
            limit) + "&skip=" + str(current) + "&adult=false&first=0&order=" + self.d

    def first(self):
        self.currentPage = 0
        self.current = 0

    def pre(self):
        if self.currentPage > 0:
            self.currentPage = self.currentPage - 1
            self.current = self.currentPage * self.limit
            return 1
        return -1

    def next(self):
        self.currentPage = self.currentPage + 1
        self.current = self.currentPage * self.limit


def upload2qiniu(bindata, fname):
    # 需要填写你的 Access Key 和 Secret Key
    access_key = 'tT6uKUoNrUbtkP23MX1GC3iEjH7SLSph5R0xW5NV'
    secret_key = 'Mx1J5qDWclsxZTAQqQKtbjYVlDfVsmYl7l79aupD'
    # 构建鉴权对象
    q = Auth(access_key, secret_key)
    # 要上传的空间
    bucket_name = 'jkbz'
    # 上传后保存的文件名
    key = fname
    # 生成上传 Token，可以指定过期时间等
    token = q.upload_token(bucket_name, key, 3600)
    # 要上传文件的本地路径
    ret, info = put_data(token, key, bindata)
    print(info)


# a = IjkDataApi('http://localhost/action/ijkxs-datas', 'ijkxs.com')
# a.send_post({
#     'categories': '默认分类',
#     'title': '测试222',
#     'text': '测试',
#     'tags': '测试',
#     'fields[desc]':'222222'
# })

def main():
    bz = BZ()
    backend = IjkDataApi('https://bz.ijkxs.com/action/ijkxs-datas', 'ijkxs.com_')
    for api_link in bz.apis:
        bz.first()
        while bz.current < 3000:
            api = bz.generate_api(list(api_link.values())[0])
            result = json.loads(requests.get(api).text)
            if result['code'] == 0:
                for img in result['res']['vertical']:
                    img_url = img['img']
                    thumb_url = img['thumb']
                    title = hashlib.md5(str.encode(img_url)).hexdigest()  # md5 title 标记是否重复
                    categories = list(api_link.keys())[0]
                    text = '![](' + img_url + ')'
                    tag = ','.join(img['tag'])
                    # 发送给后台
                    post_data = {
                        'categories': categories,
                        'title': title,
                        'text': text,
                        'tag': tag,
                        'fields[thumb]': thumb_url
                    }
                    backend.send_post(post_data)
                    # 上传到七牛
                    htm = requests.get(img_url)
                    upload2qiniu(htm.content, title + '.jpg')
                    # time.sleep()

            bz.next()


# main()
class myThread(threading.Thread):
    def __init__(self, start, end):
        threading.Thread.__init__(self)
        self.start_ = start
        self.end_ = end

    def run(self) -> None:
        bz = BZ()
        backend = IjkDataApi('http://bz.ijkxs.com/action/ijkxs-datas', 'ijkxs.com_')
        for api_link in bz.apis[self.start_:self.end_]:
            bz.first()
            while bz.current < 3000:
                api = bz.generate_api(list(api_link.values())[0])
                result = json.loads(requests.get(api).text)
                if result['code'] == 0:
                    for img in result['res']['vertical']:
                        img_url = img['img']
                        thumb_url = img['thumb']
                        title = hashlib.md5(str.encode(img_url)).hexdigest()  # md5 title 标记是否重复
                        categories = list(api_link.keys())[0]
                        text = '![](' + img_url + ')'
                        tag = ','.join(img['tag'])
                        # 发送给后台
                        post_data = {
                            'categories': categories,
                            'title': title,
                            'text': text,
                            'tags': tag,
                            'fields[thumb]': thumb_url
                        }
                        backend.send_post(post_data)
                        # 上传到七牛
                        # htm = requests.get(img_url)
                        # upload2qiniu(htm.content, title + '.jpg')
                        # time.sleep(1)

                bz.next()


# 创建新线程
thread1 = myThread(0, 3)
thread2 = myThread(3, 6)
thread3 = myThread(6, 9)
thread4 = myThread(9, 12)
thread5 = myThread(12, 15)
thread6 = myThread(15, 17)

thread1.start()
thread2.start()
thread3.start()
thread4.start()
thread5.start()
thread6.start()

thread1.join()
thread2.join()
thread3.join()
thread4.join()
thread5.join()
thread6.join()
print("退出主线程")
