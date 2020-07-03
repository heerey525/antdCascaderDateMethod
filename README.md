# antdCascaderDateMethod
作为获取https://github.com/heerey525/antdCascaderDate 此数据的方法，授人以鱼不如授人以渔

代码中例子是爬取http://www.mca.gov.cn/article/sj/xzqh/2020/2020/202003301019.html， 生成json文件

将生成的json文件根据省市区的特征用js遍历成为[{children: [children:[children]]}]的格式，并此数据最终导出到adminDate.js

### 操作步骤

#### 1、下载

```
git clone https://github.com/heerey525/antdCascaderDateMethod.git
```

#### 2、获取最新区域代码->生成gov.json

```javascript
// 进入getDate文件夹 将http://www.mca.gov.cn/article/sj/xzqh/2020/2020/202003301019.html 替换成最新的代码地址
cd getDate
node crawler.js // 运行生成gov.json
```

#### 3、生成adminDate.js

```javascript
// 进入setDate文件夹，双击index.html 生成adminDate.js文件
```

