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

  const zainab_zawoloo = 'https://www.instagram.com/p/Cpm9esPNFz-/';

  // timeout 8 seconds
  const timeout = 8000;

  // sleep 10 seconds
  // const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds))
  // await sleep(10000);

  var url = req.query.url ?? multiVideoUrl;

  // const userAgent = req.headers['x-insta-header'];
  // if (userAgent == undefined || userAgent == null || userAgent == '') {
  //   object['status'] = 'error';
  //   object['error'] = 'you are not allowed to access this site';
  //   return res.send(object);
  // }

  // https://instaoffline.net/process/
  // const result_1 = await _loadSite1(url);
  // if (result_1.status == 'success') {
  //   return res.send(result_1)
  // }

  // const result_snapinsta = await _snapinsta(url);
  // if (result_snapinsta.status == 'success') {
  //   return res.send(result_snapinsta)
  // }

  const snapinstaIO = await _snapinstaIO(url);
  if (snapinstaIO.status == 'success') {
    return res.send(snapinstaIO)
  }

  // https://reelit.io/api/fetch
  const result_2 = await _loadSite2(url);
  if (result_2.status == 'success') {
    return res.send(result_2)
  }


  return res.send(object);
});

async function _snapinstaIO(instaUrl) {
  const siteUrl = 'https://snapinsta.io/api/ajaxSearch/instagram';

  var object = {};
  object['status'] = 'success';
  object['error'] = null;
  object['site'] = siteUrl;
  object['data'] = [];

  await axios.post(siteUrl, { q: instaUrl, action: 'post', vt: 'facebook', submit: true, }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Origin': 'https://snapinsta.io',
      'referer': 'https://snapinsta.io/en2/instagram-downloader',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
    },
  }).then((response) => {
    // console.log(response.data);

    var dataStr = response.data;
    console.log(JSON.stringify(dataStr))
    // object['data'] = dataStr.data;

    const dom = htmlparser2.parseDocument(dataStr.data);
    const $ = cheerio.load(dom);

    const items = $('.download-box').find('div.download-items');
    console.log('total:' + items.length);

    items.each(function (i, elem) {

      // check is exist select.minimal
      const isExist = $(this).find('select.minimal').length;
      if (isExist > 0) {
        const imageSize = $(this).find('select.minimal');
        const imageSizeOptions = imageSize.find('option');
        var imageSizeArray = [];
        imageSizeOptions.each(function (i, elem) {
          imageSizeArray.push($(this).val());
        });

        // log the last one
        const lastImageSize = imageSizeArray[imageSizeArray.length - 1];
        console.log(lastImageSize);

        object['data'].push({
          url: lastImageSize.replaceAll('&dl=1', ''),
          is_video: false,
        });

      } else {
        // video 
        const videoUrl = $(this).find('.download-items__btn').find('a').attr('href');
        object['data'].push({
          url: videoUrl.replaceAll('&dl=1', ''),
          is_video: true,
        });

      }

    });
  }
  ).catch((error) => {
    console.log(`Error: ${error}`);
    object['status'] = 'error here ';
    object['error'] = error;
  });

  return object;
}




async function _snapinsta(instaUrl) {
  const siteUrl = 'https://snapinsta.app/action2.php';

  var object = {};
  object['status'] = 'success';
  object['error'] = null;
  object['site'] = siteUrl;
  object['data'] = [];

  await axios.post(siteUrl, { url: instaUrl, action: 'post', lang: 'en', submit: true, }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Host': 'snapinsta.app',
      'Origin': 'https://snapinsta.app',
      'Referer': 'https://snapinsta.app/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    },
  }).then((response) => {
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



async function _loadSite2(instaUrl) {
  const siteUrl = 'https://reelit.io/api/fetch';

  var object = {};
  object['status'] = 'success';
  object['error'] = null;
  object['site'] = siteUrl;
  object['data'] = [];

  await axios.post(siteUrl, { url: instaUrl }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Host': 'reelit.io',
      'Origin': 'https://reelit.io',
      'Referer': 'https://reelit.io/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    },
  }).then((response) => {

    const mediaList = response.data.media.data.mediaList;
    for (let i = 0; i < mediaList.length; i++) {
      const images = mediaList[i].images;
      const videos = mediaList[i].videos;
      const is_video = mediaList[i].contentType == 'video' ? true : false;

      var url = null;

      if (images.length > 0) {
        url = images[images.length - 1].url;
      }
      if (videos != null && videos.length > 0) {
        url = videos[videos.length - 1].url;
      }

      object['data'].push({ url: url, is_video: is_video });

    }

  }).catch((error) => {
    console.log(`Error: ${siteUrl}`);
    object['status'] = 'error';
    object['error'] = 'No links found';
    object['data'] = null;
    object['error'] = error;
  }
  );

  return object;

}


async function _loadSite1(instaUrl) {
  const siteUrl = 'https://instaoffline.net/process/';

  var object = {};
  object['status'] = 'success';
  object['error'] = null;
  object['site'] = siteUrl;
  object['data'] = [];


  await axios.post(siteUrl, { q: instaUrl, downloader: 'image' }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).then((response) => {

    const dom = htmlparser2.parseDocument(response.data.html);
    const $ = cheerio.load(dom);

    const tag = 'div.items-list';

    $(tag).find('div.item').each(function (i, elem) {
      const url = $(elem).find('a').attr('href').replace('&dl=1', '');
      const is_video = $(elem).find('span.fa-video').length > 0 ? true : false;
      object['data'].push({ url: url, is_video: is_video });
    });

    if ($(tag).find('div.item') == 0) {
      object['status'] = 'error';
      object['error'] = 'No links found';
      object['data'] = null;
    }

  }).catch((error) => {
    console.log(`Error: ${siteUrl}`);
    object['status'] = 'error';
    object['error'] = 'No links found';
    object['data'] = null;
  });

  return object;
}

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/api`)
})