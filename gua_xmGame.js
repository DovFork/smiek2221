/*
8.13-8.31 小米-星空大冒险 [gua_xmGame.js]
一次性脚本
脚本默认第11个账号停止
如需修改:
gua_xmGame_stopIndex="11"

邀请人有机会获得20京豆奖励
但仅限每日前10名好友有机会获得京豆奖励

被邀请人有机会获得10京豆奖励

活动期间邀请好友上限人数为99人

第一个账号助力作者 其他依次助力CK1
第一个CK失效会退出脚本
————————————————
入口：[8.13-8.31 小米-星空大冒险 (https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=dz2108100000412302&shareUuid=6a12ad0a31124c33975758f68a88dfb9)]
============Quantumultx===============
[task_local]
#8.13-8.31 小米-星空大冒险
31 8,22 13-31 8 * https://raw.githubusercontent.com/smiek2221/scripts/master/gua_xmGame.js, tag=8.13-8.31 小米-星空大冒险, enabled=true

================Loon==============
[Script]
cron "31 8,22 13-31 8 *" script-path=https://raw.githubusercontent.com/smiek2221/scripts/master/gua_xmGame.js,tag=8.13-8.31 小米-星空大冒险

===============Surge=================
8.13-8.31 小米-星空大冒险 = type=cron,cronexp="31 8,22 13-31 8 *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/smiek2221/scripts/master/gua_xmGame.js

============小火箭=========
8.13-8.31 小米-星空大冒险 = type=cron,script-path=https://raw.githubusercontent.com/smiek2221/scripts/master/gua_xmGame.js, cronexpr="31 8,22 13-31 8 *", timeout=3600, enable=true
*/


const $ = new Env('8.13-8.31 小米-星空大冒险');
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
const JD_API_HOST = `https://api.m.jd.com/client.action`;
let stopIndex = 11
if($.isNode()){
  if (process.env.gua_xmGame_stopIndex && process.env.gua_xmGame_stopIndex != "") {
    stopIndex = process.env.gua_xmGame_stopIndex;
  }
}
message = ""
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
      "open-url": "https://bean.m.jd.com/"
    });
    return;
  }
  $.shareUuid = '6a12ad0a31124c33975758f68a88dfb9'
  $.activityId = 'dz2108100000412302'
  console.log(`入口:\nhttps://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`)
  console.log(`设置第${stopIndex}个账号停止\n`)
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    if (cookie) {
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      getUA()
      $.nickName = '';
      console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      await run();
      if(i == 0 && !$.actorUuid) break
      if($.index >= Number(stopIndex)) break
    }
  }
  console.log(`\n\n设置第${stopIndex}个账号停止`)
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

async function run(){
  try{
    $.isvObfuscatorToken = $.LZ_TOKEN_KEY = $.LZ_TOKEN_VALUE = ''
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
    await drawContent();
    await $.wait(1000)
    $.log("助力: " + $.isPresellSku)
    if(!$.isPresellSku) await presellSku()
    await $.wait(1000)
    await getDrawRecordHasCoupon()
    await $.wait(1000)
    await getShareRecord()
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

function getDrawRecordHasCoupon() {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.myPingData.secretPin)}&num=0&sortSuatus=1`
    $.post(taskPostUrl('/dingzhi/taskact/common/getDrawRecordHasCoupon', body), async (err, resp, data) => {
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
                if(item.value == '邀请好友') num++;
                if(item.value == '邀请好友') value = item.infoName.replace('京豆','');
                if(item.value != '邀请好友') console.log(`${item.infoType != 10 && item.value +':' || ''}${item.infoName}`)
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
function getShareRecord() {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.myPingData.secretPin)}&num=0&sortSuatus=1`
    $.post(taskPostUrl('/dingzhi/taskact/common/getShareRecord', body), async (err, resp, data) => {
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

function presellSku() {
  return new Promise(resolve => {
    let body = `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}&actorUuid=${$.actorUuid}&taskType=2&taskValue=100019791960&shareUuid=${$.shareUuid}`
    $.post(taskPostUrl('/dingzhi/xiaomi/gameupd/presellSku', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          res = $.toObj(data);
          if(typeof res == 'object'){
            if(res.result === true && res.data){
              let msg = ''
              if(res.data.assistStatus){
                msg = `助力成功`
              }
              console.log(`${ msg || '助力失败'}`)
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

function drawContent() {
  return new Promise(resolve => {
    $.post({
      url: `https://lzdz1-isv.isvjcloud.com/dingzhi/taskact/common/drawContent`,
      body: `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz1-isv.isvjcloud.com',
        'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
        'Referer':`https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
        'Cookie': `LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
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
function getActorUuid() {
  return new Promise(resolve => {
    $.post({
      url: `https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activityContent`,
      body: `activityId=${$.activityId}&pin=${encodeURIComponent($.myPingData.secretPin)}&pinImg=${encodeURIComponent($.attrTouXiang)}&nick=${encodeURIComponent($.myPingData.nickname)}&cjyxPin=&cjhyPin=&shareUuid=${$.shareUuid}&gameUuid=`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz1-isv.isvjcloud.com',
        'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
        "Referer": `https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
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
            if(typeof res.data.activeTask != 'undefined'){
              $.activeTask = res.data.activeTask
              if(typeof res.data.activeTask.followShop.allStatus != 'undefined') $.followShop = res.data.activeTask.followShop.allStatus
              if(typeof res.data.activeTask.visitSku.allStatus != 'undefined') $.visitSku = res.data.activeTask.visitSku.allStatus
              if(typeof res.data.activeTask.mainActive.allStatus != 'undefined') $.mainActive = res.data.activeTask.mainActive.allStatus
              if(typeof res.data.activeTask.addSku.allStatus != 'undefined') $.addSku = res.data.activeTask.addSku.allStatus
            }
            if(typeof res.data.actorUuid != 'undefined') $.actorUuid = res.data.actorUuid
            if(typeof res.data.isPresellSku != 'undefined') $.isPresellSku = res.data.isPresellSku
            if(typeof res.data.gameScore != 'undefined') $.gameScore = res.data.gameScore || 0
            if(typeof res.data.score != 'undefined') $.score = res.data.score || 0
            if(typeof res.data.myRank != 'undefined') $.myRank = res.data.myRank || 0
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
      url: `https://lzdz1-isv.isvjcloud.com/wxActionCommon/getUserInfo`,
      body: `pin=${encodeURIComponent($.myPingData.secretPin)}`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz1-isv.isvjcloud.com',
        'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
        'Referer': `https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
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
    let pageurl = `https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`
    $.post({
      url: `https://lzdz1-isv.isvjcloud.com/common/accessLogWithAD`,
      body: `venderId=${$.venderId}&code=99&pin=${encodeURIComponent($.myPingData.secretPin)}&activityId=${$.activityId}&pageUrl=${encodeURIComponent(pageurl)}&subType=APP&adSource=null`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz1-isv.isvjcloud.com',
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
      url: `https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
      headers: {
        'User-Agent': $.UA,
        'Host':'lzdz1-isv.isvjcloud.com',
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
      url: `https://lzdz1-isv.isvjcloud.com/customer/getMyPing`,
      body: `userId=${$.shopId || $.venderId}&token=${$.isvObfuscatorToken}&fromType=APP`,
      headers: {
        'User-Agent': $.UA,
        'Content-Type':'application/x-www-form-urlencoded',
        'Host':'lzdz1-isv.isvjcloud.com',
        'Referer':`https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
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
      url: `https://lzdz1-isv.isvjcloud.com/dz/common/getSimpleActInfoVo`,
      body: `activityId=${$.activityId}`,
      headers: {
        'User-Agent': $.UA,
        'Content-Type':'application/x-www-form-urlencoded',
        'Host':'lzdz1-isv.isvjcloud.com',
        'Referer':`https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
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
      url: `https://lzdz1-isv.isvjcloud.com/wxCommonInfo/token`,
      headers: {
        'User-Agent': $.UA,
        'Content-Type':'application/x-www-form-urlencoded',
        'Host':'lzdz1-isv.isvjcloud.com',
        'Origin':'https://lzdz1-isv.isvjcloud.com',
        'Referer': `https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
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
      body: 'area=16_1315_3486_59648&body=%7B%22url%22%3A%22https%3A%5C/%5C/lzdz1-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167764&client=apple&clientVersion=10.0.10&d_brand=apple&d_model=iPhone12%2C1&eid=eidIeb54812323sf%2BAJEbj5LR0Kf6GUzM9DKXvgCReTpKTRyRwiuxY/uvRHBqebAAKCAXkJFzhWtPj5uoHxNeK3DjTumb%2BrfXOt1w0/dGmOJzfbLuyNo&isBackground=N&joycious=68&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=8a0d1837f803a12eb217fcf5e1f8769cbb3f898d&osVersion=14.3&partner=apple&rfs=0000&scope=11&screen=828%2A1792&sign=3c9b9db164cc8d694603ca6e3d7fb003&st=1628423908868&sv=102&uemps=0-0&uts=0f31TVRjBSuihfC/1D/2G8oVbUW0Pu4uJDif0Ehi7AVzM40fF9GfNX0yawFyBpTXK/PgWitxArFfBLGK%2Be2W5Pno6b7J4iivmXiQYbYPZi7fbVYEHb8Xa5JAi/fbdr/QeztGPJhLoPHKsXGU39PgzC1cWUEVezUyvHVtAuVQGBR%2Bj6Cx5kcez%2BkVn3IH8dKrAI6kA/Ct%2BQopU%2BROo1oY2w%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=796606e8e181aa5865ec20728a27238b',
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
    url: `https://lzdz1-isv.isvjcloud.com${url}`,
    body: body,
    headers: {
      "Accept": "application/json",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      'Cookie': `${cookie} LZ_TOKEN_KEY=${$.LZ_TOKEN_KEY}; LZ_TOKEN_VALUE=${$.LZ_TOKEN_VALUE}; AUTH_C_USER=${$.myPingData.secretPin}; ${$.lz_jdpin_token}`,
      "Host": "lzdz1-isv.isvjcloud.com",
      "Origin": "https://lzdz1-isv.isvjcloud.com",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": `https://lzdz1-isv.isvjcloud.com/dingzhi/xiaomi/gameupd/activity/1272964?activityId=${$.activityId}&shareUuid=${$.shareUuid}`,
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


