// 把 getDate/gov.json 的扁平区划数据加工成三级联动（cities.js）与二级联动（province.json、city.json）
const fs = require("fs");
const path = require("path");

const SOURCE_FILE = path.join(__dirname, "..", "getDate", "gov.json");
// 直辖市没有地级行，区级单位直接挂在省（市）下
const MUNICIPALITIES = ["北京市", "天津市", "上海市", "重庆市"];

const OUTPUT_DIR = __dirname;

// gov.json 同时给 setDate/index.html 以 <script> 引入，这里按同一份定义取值
const govData = Function(fs.readFileSync(SOURCE_FILE, "utf-8") + "; return govData;")();

function levelOf(code) {
    if (code.substring(2, 4) === "00") return "province";
    if (code.substring(2, 4) === "90" || code.substring(4, 6) === "00") return "city";
    return "area";
}

const provinces = [];
const cities = [];
const areas = [];

govData.forEach((item) => {
    const unit = { code: item.code, value: item.value, label: item.label };
    const level = levelOf(item.code);
    if (level === "province") {
        unit.children = [];
        provinces.push(unit);
    } else if (level === "city") {
        unit.children = [];
        cities.push(unit);
    } else {
        areas.push(unit);
    }
});

// 县级挂到所属市级（前 4 位相同）
cities.forEach((city) => {
    areas.forEach((area) => {
        if (area.code.substring(0, 4) === city.code.substring(0, 4)) city.children.push(area);
    });
});

// 市级挂到所属省级（前 2 位相同）
provinces.forEach((province) => {
    cities.forEach((city) => {
        if (city.code.substring(0, 2) === province.code.substring(0, 2)) province.children.push(city);
    });
});

// 直辖市的县级直接挂省级（前 3 位相同），使其成为规整的两层结构
MUNICIPALITIES.forEach((name) => {
    const province = provinces.find((item) => item.label === name);
    if (!province) throw new Error(`数据源缺少直辖市：${name}`);
    areas.forEach((area) => {
        if (area.code.substring(0, 3) === province.code.substring(0, 3)) province.children.push(area);
    });
});

// 每个县级单位要么有同前 4 位的市级，要么属于直辖市，否则说明代码规则对不上
const cityPrefixes = new Set(cities.map((city) => city.code.substring(0, 4)));
const municipalityPrefixes = new Set(MUNICIPALITIES.map((name) => provinces.find((province) => province.label === name).code.substring(0, 2)));
const orphanAreas = areas.filter((area) => !cityPrefixes.has(area.code.substring(0, 4)) && !municipalityPrefixes.has(area.code.substring(0, 2)));
if (orphanAreas.length) {
    throw new Error(`有 ${orphanAreas.length} 个县级单位挂不到市级，例如 ${orphanAreas[0].code} ${orphanAreas[0].label}`);
}

const provinceOptions = provinces.map((province) => ({ name: province.value, id: province.code }));
const cityOptions = {};
provinces.forEach((province) => {
    if (!province.children.length) return;
    cityOptions[province.code] = province.children.map((city) => ({
        province: province.value,
        name: city.value,
        id: city.code,
    }));
});

fs.writeFileSync(path.join(OUTPUT_DIR, "cities.js"), "const options = " + JSON.stringify(provinces, null, 4) + "\n\nexport default options");
fs.writeFileSync(path.join(OUTPUT_DIR, "province.json"), JSON.stringify(provinceOptions, null, 4));
fs.writeFileSync(path.join(OUTPUT_DIR, "city.json"), JSON.stringify(cityOptions, null, 4));

const leafProvinces = provinces.filter((province) => !province.children.length).map((province) => province.label);
console.log(`生成完成：省 ${provinces.length}，市 ${cities.length}，县 ${areas.length}`);
console.log(`产物：cities.js、province.json、city.json（无下级单位的省级：${leafProvinces.join("、") || "无"}）`);
