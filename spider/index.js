const User = require('./db/user'),
      extract = require('./extract')(),
      url = ['https://www.zhihu.com/people/libin001/followers?page=1',
            'https://www.zhihu.com/people/yijun-li-3/followers?page=1',
            'https://www.zhihu.com/people/vczero/followerss?page=1',
            'https://www.zhihu.com/people/xfwang/followers?page=1'];
process.on('message',function(m){
  console.log('get the message:',m);
  console.log('index-url',url[m.num]);
  extract.getUrlList(url[m.num]);
})
// extract.getDetail(url);
// User.saveUrl();
