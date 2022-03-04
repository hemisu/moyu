"use strict";

require("core-js/modules/es.promise.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.string.includes.js");

var _axios = _interopRequireDefault(require("axios"));

var _dayjs = _interopRequireDefault(require("dayjs"));

require("dayjs/locale/zh-cn");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import 'dayjs/locale/zh-cn' // ES 2015 
_dayjs.default.locale('zh-cn'); // 全局使用


const holidayMap = {};
const today = (0, _dayjs.default)();

const computeDiff = (a, b) => {
  if ((0, _dayjs.default)(a).isBefore(b)) {
    return (0, _dayjs.default)(b).diff(a, 'day');
  } else {
    return (0, _dayjs.default)(a).diff(b, 'day');
  }
};

const sxw = d => {
  return (0, _dayjs.default)(d).get('hour') >= 0 && (0, _dayjs.default)(d).get('hour') <= 11 ? '早上' : (0, _dayjs.default)(d).get('hour') <= 13 ? '中午' : (0, _dayjs.default)(d).get('hour') <= 18 ? '下午' : '晚上';
};

const renderTmpl = holidays => {
  const holidayTmpl = holidays.map(v => "\u8DDD\u79BB".concat(v.name, "\u8FD8\u6709").concat(computeDiff(v.date, today), "\u5929")).join('\n');
  return "\u3010\u6478\u9C7C\u529E\u516C\u5BA4\u3011\u4ECA\u5929\u662F".concat(today.format('YYYY年MM月DD日'), " ").concat(today.format('dddd'), "\n  ").concat(sxw(today), "\u597D\uFF0C\u6478\u9C7C\u4EBA\uFF0C\u5DE5\u4F5C\u518D\u7D2F\uFF0C\u4E00\u5B9A\u4E0D\u8981\u5FD8\u8BB0\u6478\u9C7C\u54E6\uFF01\u6709\u4E8B\u6CA1\u4E8B\u8D77\u8EAB\u53BB\u8336\u6C34\u95F4\u53BB\u5ECA\u9053\u53BB\u5929\u53F0\u8D70\u8D70\uFF0C\u522B\u8001\u5728\u5DE5\u4F4D\u4E0A\u5750\u7740\uFF0C\u591A\u559D\u70B9\u6C34\uFF0C\u94B1\u662F\u8001\u677F\u7684\uFF0C\u4F46\u547D\u662F\u81EA\u5DF1\u7684!\n\u8DDD\u79BB\u5468\u672B\u8FD8\u6709").concat(computeDiff((0, _dayjs.default)().day(6), today), "\u5929\n").concat(holidayTmpl);
};

const getHolidays = async function getHolidays() {
  let year = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : today.get('year');
  let isNext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  let holidays = [];
  const {
    data
  } = await _axios.default.get("http://timor.tech/api/holiday/year/".concat(year));

  if (data.code === 0) {
    for (let [_key, value] of Object.entries(data.holiday)) {
      if (value.holiday && !holidayMap[value.name] && today.isBefore((0, _dayjs.default)(value.date)) && !value.name.includes('初')) {
        holidayMap[value.name] = true;
        holidays.push(value);
      }
    }

    const remain = (0, _dayjs.default)().endOf('year').diff(today, 'day');

    if (remain < 150 && isNext) {
      holidays = holidays.concat(await getHolidays(year + 1, false));
    }

    return holidays;
  }
};

const main = async () => {
  const holidays = await getHolidays();
  console.log('%c 🍭 holidays: ', 'font-size:20px;background-color: #EA7E5C;color:#fff;', holidays);
  console.log(renderTmpl(holidays));
};

main();