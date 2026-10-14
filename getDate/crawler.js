// 抓取民政部「全国行政区划信息查询平台」县以上行政区划全表，生成扁平 govData
// 数据源一次返回全国 省/地/县 三级全表（GBK 编码），无需逐年找文章页
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const charset = require("superagent-charset");
const superagent = charset(require("superagent"));

const SOURCE_URL = "http://xzqh.mca.gov.cn/advancedDataQueryDefaut";
// 省级名称带简称后缀，如「北京市（京）」「内蒙古自治区（内蒙古）」
const ABBREVIATION_SUFFIX = /[(（][^()）]*[)）]$/;
// 源站用 ☆ 标记特殊单位（如金门县、伊犁哈萨克自治州），展示时去掉
const MARK_SYMBOL = /[☆※]/g;

function stripMark(text) {
    return text.replace(MARK_SYMBOL, "").trim();
}

function stripAbbreviation(text) {
    return stripMark(text).replace(ABBREVIATION_SUFFIX, "");
}

// 行政区划代码：省级 3、4 位是 00；市级 5、6 位是 00；省直辖县级 3、4 位是 90
function isProvince(code) {
    return code.substring(2, 4) === "00";
}

function isCity(code) {
    return code.substring(4, 6) === "00";
}

superagent
    .get(SOURCE_URL)
    .buffer(true)
    .charset("gbk")
    .end((error, response) => {
        if (error) {
            console.error("数据抓取失败：", error.message);
            process.exit(1);
        }

        const $ = cheerio.load(response.text);
        // code -> label，Map 天然去重并保持插入顺序
        const units = new Map();
        // 省级前缀 -> 省名：表里只有 4 个直辖市和港澳台有省级行，普通省需从所属行合成
        const provinces = new Map();

        $("tr").each((index, value) => {
            const $row = $(value);
            const code = $row.find('td[name="quHuaDaiMa1"]').text().trim();
            if (!/^\d{6}$/.test(code)) return;

            const provinceName = stripAbbreviation($row.find('td[name="shengJi"]').text());
            const cityName = stripAbbreviation($row.find('td[name="diJi"]').text());
            const countyName = stripMark($row.find('td[name="xianJi"]').text());
            if (provinceName) provinces.set(code.substring(0, 2), provinceName);

            if (isProvince(code)) return;
            const label = isCity(code) ? cityName : countyName;
            if (!label) {
                console.warn("跳过无名单位：", code);
                return;
            }
            units.set(code, label);
        });

        provinces.forEach((label, prefix) => units.set(prefix + "0000", label));

        const govData = [...units]
            .map(([code, value]) => ({ code, value, label: value }))
            .sort((a, b) => a.code.localeCompare(b.code));

        fs.writeFileSync(path.join(__dirname, "gov.json"), "const govData = " + JSON.stringify(govData), "utf-8");

        const levelCount = govData.reduce((acc, item) => {
            if (isProvince(item.code)) acc.province += 1;
            else if (isCity(item.code)) acc.city += 1;
            else acc.county += 1;
            return acc;
        }, { province: 0, city: 0, county: 0 });

        console.log("恭喜您，数据爬取成功！数据保存在 gov.json 中");
        console.log(`共 ${govData.length} 条：省 ${levelCount.province}，市 ${levelCount.city}，县 ${levelCount.county}`);
    });
