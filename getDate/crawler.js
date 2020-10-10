//导入依赖包
const fs = require("fs");
const superagent = require("superagent");
const cheerio = require("cheerio");

superagent
    // 2020年8月中华人民共和国县以上行政区划代码,可替换最新的
    .get("http://www.mca.gov.cn//article/sj/xzqh/2020/2020/2020092500801.html")
    .end((error,response)=>{
        //获取页面文档数据
        var content = response.text;
        //cheerio也就是nodejs下的jQuery  将整个文档包装成一个集合，定义一个变量$接收
        var $ = cheerio.load(content);
        //定义一个空数组，用来接收数据
        var result=[];
        // 省级name
        // console.log($("tbody").children()[3].children[5].children[0].data)
        // 市级name
        // console.log($("tbody").children()[4].children[5].children[1].data)
        // 特殊县级value
        // console.log($("tbody").children()[3212].children[3].children[0].children[0].data)
        $("tbody").children().each((index, value) => {
            // 胡杨河市比较特殊
            if (index === 3211) {
                const code = value.children[3].children[0].children[0].data
                const name = value.children[5].children[1].data
                // console.log(index+'+'+code+'+'+name) // 输出到控制台
                result.push({code: code, value: name, label: name})
            }
            // 北京市到澳门特别行政区
            if ((index > 2 && index < 3211) || (index > 3211 && index < 3215)) {
                const code = value.children[3].children[0].data
                let name = ''
                if (value.children[5].children[0].data) {
                    // 省级名称
                    name = value.children[5].children[0].data
                } else {
                    // 市、区名称
                    name = value.children[5].children[1].data
                }
                // console.log(index+'+'+code+'+'+name) // 输出到控制台
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