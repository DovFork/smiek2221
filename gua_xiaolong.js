/*
8.13-8.25 骁龙品牌日 [gua_xiaolong.js]

邀请一人有机会获得20豆 (有可能没有豆
  上限可能是 18
做任务有机会获得京豆(有可能是空气💨
每次最多抽10次奖(抽太多次 后面基本都是空气💨 可以每天抽前1 20次

第一个账号助力作者 其他依次助力CK1
第一个CK失效会退出脚本

脚本默认抽奖 true抽奖，false不抽奖
不抽奖请设置环境变量
gua_xiaolong_luckydraw="false"
————————————————
入口：[8.13-8.25 骁龙品牌日 (https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=901080701&shareUuid=9535c849daec4eb0b006dc1ff8ab3b5c)]
============Quantumultx===============
[task_local]
#8.13-8.25 骁龙品牌日
18 9,19 13-25 8 * https://raw.githubusercontent.com/smiek2221/scripts/master/gua_xiaolong.js, tag=8.13-8.25 骁龙品牌日, enabled=true

================Loon==============
[Script]
cron "18 9,19 13-25 8 *" script-path=https://raw.githubusercontent.com/smiek2221/scripts/master/gua_xiaolong.js,tag=8.13-8.25 骁龙品牌日

===============Surge=================
8.13-8.25 骁龙品牌日 = type=cron,cronexp="18 9,19 13-25 8 *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/smiek2221/scripts/master/gua_xiaolong.js

============小火箭=========
8.13-8.25 骁龙品牌日 = type=cron,script-path=https://raw.githubusercontent.com/smiek2221/scripts/master/gua_xiaolong.js, cronexpr="18 9,19 13-25 8 *", timeout=3600, enable=true
*/
const $ = new Env('8.13-8.25 骁龙品牌日');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
let luckydrawStatus = true
luckydrawStatus = $.isNode() ? (process.env.gua_xiaolong_luckydraw ? process.env.gua_xiaolong_luckydraw : `${luckydrawStatus}`) : ($.getdata('gua_xiaolong_luckydraw') ? $.getdata('gua_xiaolong_luckydraw') : `${luckydrawStatus}`);
const JD_API_HOST = `https://api.m.jd.com/client.action`;
message = ""
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
      "open-url": "https://bean.m.jd.com/"
    });
    return;
  }
  $.shareUuid = '9535c849daec4eb0b006dc1ff8ab3b5c'
  $.activityId = '901080701'
  console.log(`入口:\nhttps://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`)
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    if (cookie) {
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      getUA()
      $.nickName = '';
      console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      await run();
      if(i == 0 && !$.actorUuid) return
    }
  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

async function run(){
  try{
    $.isvObfuscatorToken = $.LZ_TOKEN_KEY = $.LZ_TOKEN_VALUE = $.task =  ''
    await getWxCommonInfoToken();
    await getIsvObfuscatorToken();
    if($.isvObfuscatorToken == '' || $.LZ_TOKEN_KEY == '' || $.LZ_TOKEN_VALUE == ''){
      console.log('获取[token]失败！')
      return
    }
    await getSimpleActInfoVo()
    $.myPingData = await getMyPing()
    if ($.myPingData ==="" || $.myPingData === '400001' || typeof $.shopId == 'undefined' || typeof $.venderId == 'undefined') {
      $.log("获取活动信息失败！")
      return
    }
    await getHtml();
    await adLog();
    $.attrTouXiang = 'https://img10.360buyimg.com/imgzone/jfs/t1/7020/27/13511/6142/5c5138d8E4df2e764/5a1216a3a5043c5d.png'
    await getUserInfo();
    $.actorUuid = '';
    await getActorUuid();
    if(!$.actorUuid){
      console.log('获取不到[actorUuid]退出执行，请重新执行')
      return
    }
    await $.wait(1000)
    $.log("关注: " + $.hasFollowShop)
    if(!$.hasFollowShop) await followShop();
    $.log("助力: " + (typeof $.shareUser == 'undefined'))
    if(typeof $.shareUser != 'undefined') await helpFriend();
    await myInfo();
    let flag = 0
    if($.task){
      for(let i of $.task){
        if(i.curNum >= i.maxNeed) continue
        if(i.taskname.indexOf('邀请好友') > -1) continue
        console.log(i.taskname)
        await doTask(i.taskid);
        await $.wait(2000)
        flag = 1
      }
    }
    if(flag == 1) await myInfo();
    if(flag == 1) await $.wait(1000)
    let drawChances = parseInt($.score/100, 10)
    console.log(`总共${$.totalScore}龙力值 剩余${$.score}龙力值 ${$.drawChance}次抽奖机会 ${drawChances}额外抽奖机会`)
    if(luckydrawStatus === 'true'){
      let num = 1
      for(j=1;$.drawChance--;j++){
        await luckydraw(0)
        await $.wait(1000)
        num++;
        if(num>= 10) console.log('抽奖次数太多，请再次运行抽奖')
        if(num>= 10) break
      }
      for(j=1;drawChances-- && num < 10;j++){
        if(num>= 10) console.log('抽奖次数太多，请再次运行抽奖')
        if(num>= 10) break
        num++;
        await luckydraw(1)
        await $.wait(1000)
      }
    }
    await getActorUuid()
    await $.wait(1000)
    await myprize()
    await $.wait(1000)
    await myfriend()
    $.log($.shareUuid)
    if ($.index === 1) {
      if($.actorUuid){
        $.shareUuid = $.actorUuid;
        console.log(`后面的号都会助力:${$.shareUuid}`)
      }else{
        console.log('账号1获取不到[shareUuid]退出执行，请重新执行')
        return
      }
    }
  }catch(e){
    console.log(e)
  }
}
function myprize() {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}`
    $.post(taskPostUrl('/dingzhi/xiaolong/collectcard/myprize', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(res.result === true && res.data){
              console.log(`我的奖品：`)
              let num = 0
              let value = 0
              for(let i in res.data){
                let item = res.data[i]
                if(item.remark.indexOf('邀请好友') > -1) num++;
                if(item.remark.indexOf('邀请好友') > -1) value = item.rewardName.replace('京豆','');
                if(item.remark.indexOf('邀请好友') == -1) console.log(`${item.remark +':' || ''}${item.rewardName}`)
              }
              if(num > 0) console.log(`邀请好友(${num}):${num*parseInt(value, 10) || 30}京豆`)
            }else if(typeof res == 'object' && res.errorMessage){
              console.log(`我的奖品 ${res.errorMessage || ''}`)
            }else{
              console.log(data)
            }
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function myfriend() {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.myPingData.secretPin)}&num=0&sortSuatus=1`
    $.post(taskPostUrl('/dingzhi/xiaolong/collectcard/myfriend', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(res.result === true && res.data){
              $.log(`=========== 你邀请了:${res.data.length}个`)
            }else if(typeof res == 'object' && res.errorMessage){
              console.log(`${res.errorMessage || ''}`)
            }else{
              console.log(data)
            }
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function luckydraw(type) {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}&type=${type}`
    $.post(taskPostUrl('/dingzhi/xiaolong/collectcard/luckydraw', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(res.result === true && res.data){
              let msg = ''
              if(res.data.prize && res.data.prize.rewardName){
                msg = `${res.data.prize.rewardName}`
              }
              console.log(`抽奖获得：${ msg || '空气💨'}`)
            }else if(typeof res == 'object' && res.errorMessage){
              console.log(`抽奖 ${res.errorMessage || ''}`)
            }else{
              console.log(data)
            }
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function doTask(taskId) {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}&taskId=${taskId}`
    $.post(taskPostUrl('/dingzhi/xiaolong/collectcard/doTask', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} helpFriend API请求失败，请检查网路重试`)
        } else {
          // console.log(data)
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(res.result === true && res.data){
              let msg = ''
              if(res.data.beanNum){
                msg = ` ${res.data.beanNum}京豆`
              }
              if(res.data.score){
                msg += ` ${res.data.score}龙力值`
              }
              if(res.data.drawChance){
                msg += ` ${res.data.drawChance}次抽奖`
              }
              console.log(`获得:${ msg || '空气💨'}`)
            }else if(typeof res == 'object' && res.errorMessage){
              console.log(`${res.errorMessage || ''}`)
            }else{
              console.log(data)
            }
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function helpFriend() {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}&shareUuid=${$.shareUuid}`
    $.post(taskPostUrl('/dingzhi/xiaolong/collectcard/helpFriend', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} helpFriend API请求失败，请检查网路重试`)
        } else {
          // console.log(data)
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(res.result === true && res.data){
              let msg = `助力失败\n${data}`
              if(res.data.helpFriendMsg){
                msg = `${res.data.helpFriendMsg}`
              }
              console.log(`${msg}`)
            }else if(typeof res == 'object' && res.errorMessage){
              console.log(`${res.errorMessage || ''}`)
            }else{
              console.log(data)
            }
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function followShop() {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}`
    $.post(taskPostUrl('/dingzhi/xiaolong/collectcard/followshop', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} followShop API请求失败，请检查网路重试`)
        } else {
          // console.log(data)
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(res.result === true){

            }else if(typeof res == 'object' && res.errorMessage){
              console.log(`${res.errorMessage || ''}`)
            }else{
              console.log(data)
            }
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function myInfo() {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}&actorUuid=${$.actorUuid}&shareUuid=${$.shareUuid}`
    $.post(taskPostUrl('/dingzhi/xiaolong/collectcard/myInfo', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          // console.log(data)
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(typeof res.data.task != 'undefined') $.task = res.data.task
            if(typeof res.data.drawChance != 'undefined') $.drawChance = res.data.drawChance
            if(typeof res.data.score != 'undefined') $.score = res.data.score
            if(typeof res.data.totalScore != 'undefined') $.totalScore = res.data.totalScore
          }else if(typeof res == 'object' && res.errorMessage){
            console.log(`${res.errorMessage || ''}`)
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function getActorUuid() {
  return new Promise(resolve => {
    $.post({
      url: `https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activityContent`,
      body: `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}&pinImg=${encodeURIComponent($.attrTouXiang)}&nick=${encodeURIComponent($.myPingData.nickname)}&cjyxPin=&cjhyPin=&shareUuid=${$.shareUuid}`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz4-isv.isvjcloud.com',
        'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
        "Referer": `https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
        'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
      }
    }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          // console.log(data)
          res = $.toObj(data);
          if(typeof res == 'object' && res.result === true){
            if(typeof res.data.hasFollowShop != 'undefined') $.hasFollowShop = res.data.hasFollowShop
            if(typeof res.data.shareUser != 'undefined') $.shareUser = res.data.shareUser
            if(typeof res.data.uid != 'undefined') $.actorUuid = res.data.uid
          }else if(typeof res == 'object' && res.errorMessage){
            console.log(`activityContent ${res.errorMessage || ''}`)
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getUserInfo() {
  return new Promise(resolve => {
    $.post({
      url: `https://lzdz4-isv.isvjcloud.com/wxActionCommon/getUserInfo`,
      body: `pin=${encodeURIComponent($.myPingData.secretPin)}`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz4-isv.isvjcloud.com',
        'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
        'Referer': `https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
        'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
      }
    }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} getUserInfo API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          if(typeof res == 'object' && res.result === true){
            if(res.data && typeof res.data.yunMidImageUrl != 'undefined') $.attrTouXiang = res.data.yunMidImageUrl || "https://img10.360buyimg.com/imgzone/jfs/t1/7020/27/13511/6142/5c5138d8E4df2e764/5a1216a3a5043c5d.png"
          }else if(typeof res == 'object' && res.errorMessage){
            console.log(`getUserInfo ${res.errorMessage || ''}`)
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function adLog() {
  return new Promise(resolve => {
    let pageurl = `https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`
    $.post({
      url: `https://lzdz4-isv.isvjcloud.com/common/accessLogWithAD`,
      body: `venderId=${$.venderId}&code=99&pin=${encodeURIComponent($.myPingData.secretPin)}&activityId=${$.activityId}&pageUrl=${encodeURIComponent(pageurl)}&subType=APP&adSource=null`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz4-isv.isvjcloud.com',
        'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
        'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
      }
    }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          //  data = JSON.parse(data);
          let setcookies = resp['headers']['set-cookie'] || resp['headers']['Set-Cookie'] || ''
          let setcookie = ''
          if(setcookies){
            if(typeof setcookies != 'object'){
              setcookie = setcookies.split(',')
            }else setcookie = setcookies
            let LZ_TOKEN_KEY = setcookie.filter(row => row.indexOf("LZ_TOKEN_KEY") !== -1)[0]
            if(LZ_TOKEN_KEY && LZ_TOKEN_KEY.indexOf("LZ_TOKEN_KEY=") > -1){
              $.LZ_TOKEN_KEY = LZ_TOKEN_KEY.split(';') && (LZ_TOKEN_KEY.split(';')[0]) || ''
              $.LZ_TOKEN_KEY = $.LZ_TOKEN_KEY.replace('LZ_TOKEN_KEY=','')
            }
            let LZ_TOKEN_VALUE = setcookie.filter(row => row.indexOf("LZ_TOKEN_VALUE") !== -1)[0]
            if(LZ_TOKEN_VALUE && LZ_TOKEN_VALUE.indexOf("LZ_TOKEN_VALUE=") > -1){
              $.LZ_TOKEN_VALUE = LZ_TOKEN_VALUE.split(';') && (LZ_TOKEN_VALUE.split(';')[0]) || ''
              $.LZ_TOKEN_VALUE = $.LZ_TOKEN_VALUE.replace('LZ_TOKEN_VALUE=','')
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getHtml() {
  return new Promise(resolve => {
    $.get({
      url: `https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz4-isv.isvjcloud.com',
        'X-Requested-With': 'com.jingdong.app.mall',
        'Cookie': `IsvToken=${$.isvObfuscatorToken}; LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.secretPin}; ${$.lz_jdpin_token}`,
  }
    }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getMyPing() {
  return new Promise(resolve => {
    $.post({
      url: `https://lzdz4-isv.isvjcloud.com/customer/getMyPing`,
      body: `userId=${$.shopId || $.venderId}&token=${$.isvObfuscatorToken}&fromType=APP`,
      headers: {
        'User-Agent': $.UA,
        'Content-Type':'application/x-www-form-urlencoded',
        'Host':'lzdz4-isv.isvjcloud.com',
        'Referer':`https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
        'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};`,
      }
    }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} getMyPing API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          let setcookies = resp['headers']['set-cookie'] || resp['headers']['Set-Cookie'] || ''
          let setcookie = ''
          if(setcookies){
            if(typeof setcookies != 'object'){
              setcookie = setcookies.split(',')
            }else setcookie = setcookies
            let lz_jdpin_token = setcookie.filter(row => row.indexOf("lz_jdpin_token") !== -1)[0]
            $.lz_jdpin_token = ''
            if(lz_jdpin_token && lz_jdpin_token.indexOf("lz_jdpin_token=") > -1){
              $.lz_jdpin_token = lz_jdpin_token.split(';') && (lz_jdpin_token.split(';')[0] + ';') || ''
            }
            let LZ_TOKEN_VALUE = setcookie.filter(row => row.indexOf("LZ_TOKEN_VALUE") !== -1)[0]
            if(LZ_TOKEN_VALUE && LZ_TOKEN_VALUE.indexOf("LZ_TOKEN_VALUE=") > -1){
              $.LZ_TOKEN_VALUE = LZ_TOKEN_VALUE.split(';') && (LZ_TOKEN_VALUE.split(';')[0]) || ''
              $.LZ_TOKEN_VALUE = $.LZ_TOKEN_VALUE.replace('LZ_TOKEN_VALUE=','')
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(res.data || '');
      }
    })
  })
}
function getSimpleActInfoVo() {
  return new Promise(resolve => {
    $.post({
      url: `https://lzdz4-isv.isvjcloud.com/dz/common/getSimpleActInfoVo`,
      body: `activityId=${$.activityId}`,
      headers: {
        'User-Agent': $.UA,
        'Content-Type':'application/x-www-form-urlencoded',
        'Host':'lzdz4-isv.isvjcloud.com',
        'Referer':`https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
        'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE};`,
      }
    }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} getSimpleActInfoVo API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          if(typeof res == 'object' && res.result === true){
            if(typeof res.data.shopId != 'undefined') $.shopId = res.data.shopId
            if(typeof res.data.venderId != 'undefined') $.venderId = res.data.venderId
          }else if(typeof res == 'object' && res.errorMessage){
            console.log(`getSimpleActInfoVo ${res.errorMessage || ''}`)
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getWxCommonInfoToken () {
  return new Promise(resolve => {
    $.post({
      url: `https://lzdz4-isv.isvjcloud.com/wxCommonInfo/token`,
      headers: {
        'User-Agent': $.UA,
        'Content-Type':'application/x-www-form-urlencoded',
        'Host':'lzdz4-isv.isvjcloud.com',
        'Origin':'https://lzdz4-isv.isvjcloud.com',
        'Referer': `https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
        'Cookie': cookie,
      }
    }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} wxCommonInfo API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          if(typeof res == 'object' && res.result === true){
            if(typeof res.data.LZ_TOKEN_KEY != 'undefined') $.LZ_TOKEN_KEY = res.data.LZ_TOKEN_KEY
            if(typeof res.data.LZ_TOKEN_VALUE != 'undefined') $.LZ_TOKEN_VALUE = res.data.LZ_TOKEN_VALUE
          }else if(typeof res == 'object' && res.errorMessage){
            console.log(`token ${res.errorMessage || ''}`)
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getIsvObfuscatorToken () {
  return new Promise(resolve => {
    $.post({
      url: `https://api.m.jd.com/client.action?functionId=isvObfuscator`,
      body: 'area=16_1315_3486_59648&body=%7B%22url%22%3A%22https%3A%5C/%5C/lzdz4-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167764&client=apple&clientVersion=10.0.10&d_brand=apple&d_model=iPhone12%2C1&eid=eidIde27812210seewuOJWEnRZ6u7X5cB/JIQnsLj51RJEe7PtlRG/yNSbeUMf%2BbNdgjQzFxhZsU4m5/PLZOhi87ebHQ0wPc9qd82Bh%2BVoPAhwbhRqFY&isBackground=N&joycious=59&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=ebf4ce8ecbb641054b00c00483b1cee85660d196&osVersion=14.3&partner=apple&rfs=0000&scope=11&screen=828%2A1792&sign=85975d9149a99a8773da99475093e5df&st=1628842643694&sv=100&uemps=0-0&uts=0f31TVRjBSsqndu4/jgUPz6uymy50MQJTGe1kGzlVUSwNbkSbubhmuKL8rUZWFIXz6fTEnSIll6JnBySCmFizA6CYX6LrtC%2BqIhtKsiLZittsB9QCCstWCIU7OYWRTiQhupYps3YigZ2NE7NMszM5flu5v3jCNgowjLMHqSD9QLx/E3NRiz%2B%2BQLXceJhCINjAET5kuyMf/lXLOIG/0EFZg%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=796606e8e181aa5865ec20728a27238b',
      headers: {
        'User-Agent': $.UA,
        'Content-Type':'application/x-www-form-urlencoded',
        'Host':'api.m.jd.com',
        'Cookie': cookie,
      }
    }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} isvObfuscator API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(typeof res.token != 'undefined') $.isvObfuscatorToken = res.token
          }else{
            console.log(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function taskPostUrl(url, body) {
  return {
    url: `https://lzdz4-isv.isvjcloud.com${url}`,
    body: body,
    headers: {
      "Accept": "application/json",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      'Cookie': `${cookie} LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
      "Host": "lzdz4-isv.isvjcloud.com",
      "Origin": "https://lzdz4-isv.isvjcloud.com",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": `https://lzdz4-isv.isvjcloud.com/dingzhi/xiaolong/collectcard/activity/1441690?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
      "User-Agent": $.UA ,
    }
  }
}

function getUA(){
  $.UA = `jdapp;iPhone;10.0.10;14.3;${randomString(40)};network/wifi;model/iPhone12,1;addressid/4199175193;appBuild/167741;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomString(e) {
  e = e || 32;
  let t = "abcdef0123456789", a = t.length, n = "";
  for (i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}


