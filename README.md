# antdCascaderDateMethod

作为获取https://github.com/heerey525/antdCascaderDate 此数据的方法，授人以鱼不如授人以渔

代码中例子是爬取 2020 年 12 月中华人民共和国县以上行政区划代码 http://www.mca.gov.cn/article/sj/xzqh/2020/20201201.html 生成 json 文件

将生成的 json 文件根据省市区的特征用 js 遍历成为[{children: [children:[children]]}]的格式，并此数据最终导出到 cities.js

### 操作步骤

#### 1、下载

```
git clone https://github.com/heerey525/antdCascaderDateMethod.git
```

#### 2、获取最新区域代码->生成 gov.json

```javascript
// 进入getDate文件夹 将http://www.mca.gov.cn/article/sj/xzqh/2020/20201201.html 替换成最新的代码地址
cd getDate
npm install // 安装依赖
node crawler.js // 运行生成gov.json
```

#### 3、生成 cities.js、province.json、city.json

```javascript
// 进入setDate文件夹，双击index.html 生成cities.js（省市区三级联动）、province.json（二级联动省级数据）、city.json（二级联动市级数据）文件
```
