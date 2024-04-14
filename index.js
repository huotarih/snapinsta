const express = require('express')
const app = express()
const port = process.env.PORT || 54321

// cheerio
const cheerio = require('cheerio');
const htmlparser2 = require("htmlparser2");

// axios
const axios = require('axios');
console.clear();

app.get('/', async (req, res) => {
    var object = {};
    object['status'] = 'success';
    object['error'] = null;
    object['data'] = 'Welcome to Insta API';

  res.send(object);
})


app.get('/api', async (req, res) => {

  var object = {};
  object['status'] = 'error';
  object['error'] = 'not_found';
  object['site'] = null;
  object['data'] = null;

  const instaUrl = 'https://www.instagram.com/p/Cm5SiK3D0Zj/';
  const instaVideoUrl = 'https://www.instagram.com/reel/Cnr4i-ZIlTn/?utm_source=ig_web_copy_link';
  const multiVideoUrl = 'https://www.instagram.com/p/Cnr10dmonzv/?utm_source=ig_web_copy_link';
  const videoFirstImage = 'https://www.instagram.com/p/Cnr6mjyoWg6/';

  const zainab_zawoloo ='https://www.instagram.com/p/C5qpM2StO5I/?img_index=1';

  // timeout 8 seconds
  const timeout = 8000;

  // sleep 10 seconds
  // const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds))
  // await sleep(10000);

  var url = req.query.url ?? zainab_zawoloo;

  // const userAgent = req.headers['x-insta-header'];
  // if (userAgent == undefined || userAgent == null || userAgent == '') {
  //   object['status'] = 'error';
  //   object['error'] = 'you are not allowed to access this site';
  //   return res.send(object);
  // }

  
  const result_3 = await _snapinsta(url);
  if (result_3.status == 'success') {
    return res.send(result_3)
  }

  return res.send(object);
});

async function _snapinsta(instaUrl) {
  const siteUrl = 'https://snapinsta.app/action2.php';

  var object = {};
  object['status'] = 'success';
  object['error'] = null;
  object['site'] = siteUrl;
  object['data'] = [];

  const siteInfo = await fetchCsrfTokenWithCookies('https://snapinsta.app/', 'input[name="token"]', 'value');

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Host': 'snapinsta.app',
    'Origin': 'https://snapinsta.app',
    'Referer': 'https://snapinsta.app/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  };

  await axios.post(siteUrl, { url: instaUrl, action: 'post', lang: 'en', 'token': siteInfo.csrfToken }, {headers}).then((response) => {
    // console.log(response.data);

    // extract decodeURIComponent from response.data
    var dataStr = response.data.toString();
    // console.log(dataStr);

    // console.log('dd:'+useRegex(dataStr));

    var startTag = '))}(';
    var endTag = '))';

    // example of dataStr
    var strTest = '))}("H1234567890F,80,"uNdUlxRXS",2,4,19"))';

    // extract encripted data
    var start = dataStr.indexOf(startTag) + startTag.length;
    var end = dataStr.indexOf(endTag, start);
    var result = dataStr.substring(start, end);

    // split parameters
    var arr = result.split(",");
    var javascriptHtml = eval(arr[0].replaceAll('"', ""), arr[1], arr[2].replaceAll('"', ""), arr[3], arr[4], arr[5]);

    // console.log(javascriptHtml);

    var s = 'document.getElementById("download").innerHTML = "';
    var e = '</div>";';

    // extract encripted data
    var start = javascriptHtml.indexOf(s) + s.length;
    var end = javascriptHtml.indexOf(e, start);
    var result = javascriptHtml.substring(start, end);

    // console.log('result: ' + result);

    const dom = htmlparser2.parseDocument(result.replaceAll("\\", ""));
    const $ = cheerio.load(dom);

    const items = $('div.row').find('div.download-item');
    console.log('items find length: ' + items.length);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemUrl = $(item).find('a').attr('href'); 
      const a_label = $(item).find('a').text().trim();
      // console.log('a_label: ' + a_label);
    
      const is_video = a_label == 'Download Photo' ? false : true;
      
      object['data'].push({
        url: itemUrl.replaceAll('&dl=1', ""),
        is_video: is_video,
      });
    }

  }
  ).catch((error) => {
    console.log(`Error: ${siteUrl}`);
    object['status'] = 'error here ';
    object['error'] = error;
  });

  return object;
}


function useRegex(input) {
  let regex = /var _0xc29e=\["","split","[^"]*","slice","indexOf","","","\.","pow","reduce","reverse","0"\];function _0xe82c\(d,e,f\)\{var g=_0xc29e\[2\]\[_0xc29e\[1\]\]\(_0xc29e\[0\]\);var h=g\[_0xc29e\[3\]\]\(0,e\);var i=g\[_0xc29e\[3\]\]\(0,f\);var j=d\[_0xc29e\[1\]\]\(_0xc29e\[0\]\)\[_0xc29e\[10\]\]\(\)\[_0xc29e\[9\]\]\(function\(a,b,c\)\{if\(h\[_0xc29e\[4\]\]\(b\)!==-1\)return a\+=h\[_0xc29e\[4\]\]\(b\)\*\(Math\[_0xc29e\[8\]\]\(e,c\)\)\},0\);var k=_0xc29e\[0\];while\(j>0\)\{k=i\[j%f\]\+k;j=\(j-\(j%f\)\)\/f\}return k\|\|_0xc29e\[11\]\}eval\(function\(h,u,n,t,e,r\)\{r=""for\(var i=0,len=h\.length;i<len;i\+\+\)\{var s=""while\(h\[i\]!==n\[e\]\)\{s\+=h\[i\];i\+\+\}for\(var j=0;j<n\.length;j\+\+\)s=s\.replace\(new RegExp\(n\[j\],"g"\),j\);r\+=String\.fromCharCode\(_0xe82c\(s,e,10\)-t\)\}return decodeURIComponent\(escape\(r\)\)\}\("[^"]*",[0-9]+,"[^"]*",[0-9]+,[0-9]+,[0-9]+\)\)/i;
  return regex.test(input);
}


function _0xe62c(d, e, f) {
  var g = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'['split']('');
  var h = g['slice'](0, e);
  var i = g['slice'](0, f);
  var j = d['split']('')['reverse']()['reduce'](function (a, b, c) {
    if (h['indexOf'](b) !== -1) return a += h['indexOf'](b) * (Math['pow'](e, c))
  }, 0);
  var k = '';
  while (j > 0) {
    k = i[j % f] + k;
    j = (j - (j % f)) / f
  }
  return k || '0'
}
function eval(h, u, n, t, e, r) {
  r = "";
  for (var i = 0, len = h.length; i < len; i++) {
    var s = "";
    while (h[i] !== n[e]) {
      s += h[i];
      i++
    }
    for (var j = 0; j < n.length; j++) s = s.replace(new RegExp(n[j], "g"), j);
    r += String.fromCharCode(_0xe62c(s, e, 10) - t)
  }
  return decodeURIComponent(escape(r))
}


async function fetchCsrfTokenWithCookies(url, selector = 'meta[name="csrf-token"]', attribute = 'content') {
  const headers = {
      'Host': 'snapinsta.app',
      // 'Origin': 'https://snapinsta.app',
      // 'Referer': 'https://snapinsta.app/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };

  try {
    // Make an HTTP GET request to the webpage
    const response = await axios.get(url, { headers });
    const html = response.data;

    // const serverTime = response.headers['date'];
    // const timestamp = new Date(serverTime).getTime();

    // Use cheerio to parse the HTML
    const $ = cheerio.load(html);

    // Extract the CSRF token from meta tags
    // Adjust the selector as needed based on the meta tag's name or property
    const csrfToken = $(selector).attr(attribute);
    const cookies = response.headers['set-cookie'];

    return { 'csrfToken': csrfToken, 'cookies': cookies };

  } catch (error) {
    console.error('Error fetching CSRF Token:', error);
    return null;
  }
}


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/api`)
})