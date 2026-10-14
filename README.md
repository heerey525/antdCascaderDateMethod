# antdCascaderDateMethod

作为获取<https://github.com/heerey525/antdCascaderDate> 此数据的方法，授人以鱼不如授人以渔

便捷查询网址为https://zwfw.mca.gov.cn/appsv2/xzqhcx/index.html

数据源是民政部全国行政区划信息查询平台 `http://xzqh.mca.gov.cn/advancedDataQueryDefaut`，一次返回县以上行政区划全表（页面为 GBK 编码），不再依赖逐年发布的文章页。

`getDate/crawler.js` 抓取全表并生成扁平的 `gov.json`（`[{code, value, label}]`，其中普通省级单位由所属行的省级前缀合成）；`setDate/build.js` 按代码特征遍历成 `[{children: [children:[children]]}]` 的格式，导出 cities.js、province.json、city.json。

行政区划代码特征：

- 省级或直辖市：第三，四位是 00
- 市级：第五，六位是 00
- 省级直辖县级市：第三，四位是 90
- 四大直辖市没有地级行，其下辖区县直接挂在省级下

### 操作步骤

#### 1、下载

```
git clone https://github.com/heerey525/antdCascaderDateMethod.git
```

#### 2、获取最新区域代码->生成 gov.json

```javascript
cd getDate
npm install   // 安装依赖
npm run crawl // 抓取民政部全表，生成 getDate/gov.json
```

#### 3、生成 cities.js、province.json、city.json

```javascript
npm run build // 加工 gov.json，产物输出到 setDate/ 目录
```

cities.js（省市区三级联动）、province.json（二级联动省级数据）、city.json（二级联动市级数据）拷贝到 antdCascaderDate 项目即可。

`setDate/index.html` 是早先靠浏览器下载产物的同款算法，已由 `setDate/build.js` 取代。
