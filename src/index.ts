import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
// import 'dayjs/locale/zh-cn' // ES 2015 

dayjs.locale('zh-cn') // 全局使用

interface IHolidayRes {
  code: number;
  holiday: Record<string, { holiday: boolean, name: string, wage: number, date: string, rest: number }>;
}

const holidayMap = {}


const today = dayjs();
const computeDiff = (a, b) => {
  if(dayjs(a).isBefore(b)) {
    return dayjs(b).diff(a, 'day')
  } else {
    return dayjs(a).diff(b, 'day')
  }
}
const sxw = d => {
  return dayjs(d).get('hour') >= 0 && dayjs(d).get('hour') <= 11 ? '早上' :
  dayjs(d).get('hour') <= 13 ? '中午' :
  dayjs(d).get('hour') <= 18 ? '下午' : '晚上'
}
const renderTmpl = (holidays) => {
  const holidayTmpl = holidays.map(v => `距离${v.name}还有${computeDiff(v.date, today)}天`).join('\n')
  return `【摸鱼办公室】今天是${today.format('YYYY年MM月DD日')} ${today.format('dddd')}
  ${sxw(today)}好，摸鱼人，工作再累，一定不要忘记摸鱼哦！有事没事起身去茶水间去廊道去天台走走，别老在工位上坐着，多喝点水，钱是老板的，但命是自己的!
距离周末还有${computeDiff(dayjs().day(6), today)}天
${holidayTmpl}`
}

const getHolidays = async (year = today.get('year'), isNext = true) => {
  let holidays = []
  const { data } = await axios.get<IHolidayRes>(`http://timor.tech/api/holiday/year/${year}`)

  if (data.code === 0) {
    for (let [_key, value] of Object.entries(data.holiday)) {
      if (value.holiday && !holidayMap[value.name] && today.isBefore(dayjs(value.date)) && !value.name.includes('初')) {
        holidayMap[value.name] = true;
        holidays.push(value);
      }
    }
    const remain = dayjs().endOf('year').diff(today, 'day')
    if(remain < 150 && isNext) {
      holidays = holidays.concat(await getHolidays(year + 1, false))
    }
    return holidays
  }
}
const main = async () => {
  const holidays = await getHolidays()
  console.log('%c 🍭 holidays: ', 'font-size:20px;background-color: #EA7E5C;color:#fff;', holidays);
  console.log(renderTmpl(holidays))
}

main()