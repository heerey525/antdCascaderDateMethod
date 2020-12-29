//导入依赖包
const fs = require("fs");
const superagent = require("superagent");
const cheerio = require("cheerio");

superagent
    // 2020年10月中华人民共和国县以上行政区划代码,可替换最新的
    .get("http://www.mca.gov.cn/article/sj/xzqh/2020/2020/2020112010001.html")
    .end((error,response)=>{
        //获取页面文档数据
        var content = response.text;
        //cheerio也就是nodejs下的jQuery  将整个文档包装成一个集合，定义一个变量$接收
        var $ = cheerio.load(content);
        //定义一个空数组，用来接收数据
        var result=[];
        $("tbody tr").each((index, value) => {
            // 北京市到澳门特别行政区
            if ((index > 2 && index < 3215)) {
                const code = $(value).find('td').eq(1).text()
                const name = $(value).find('td').eq(2).text().replace(/\s+/g, '')
                // // console.log(index+'+'+code+'+'+name) // 输出到控制台
                result.push({code: code, value: name, label: name})
            }
        })
        //将数组转换成字符串
        result=JSON.stringify(result);
        result='const govData = ' + result
        //将数组输出到json文件里  刷新目录 即可看到当前文件夹多出一个gov.json文件(打开gov.json文件
        fs.writeFile("gov.json",result,"utf-8",(error)=>{
            //监听错误，如正常输出，则打印null
            if(error==null){
                // 省级或直辖市： 第三，四位是 00
                // 市级： 第五，六位是 00
                // 省级直辖县： 第三，四位是 90
                console.log("恭喜您，数据爬取成功!数据保存在gov.json中");
            }
        });
    });