const User = require('./db/user'),
      phantom = require('phantom'),
      cheerio = require('cheerio');

function extract(){

    var urlList = [],
        allPage = 0,
        currentPage = 0;

    // 获取用户详情
    var getDetail = async (url)=>{
        const instance = await phantom.create();
        const page = await instance.createPage();
        //等待页面加载完成
        await page.on("onLoadFinished", function(status) {
            console.log('Status: ' + status);
        });
        const status = await page.open(url);
        //模拟点击展开事件
        page.evaluate(function() {
            var btn = document.getElementsByClassName('ProfileHeader-expandButton')[0];
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent( 'click', true, true, window, 1, 0, 0 );
            btn.dispatchEvent( event );
        })
        //获取到页面
        const content = await page.property('content');
        // 使用cheerio解析页面
        const $ = cheerio.load(content);
        // $('.Button.ProfileHeader-expandButton.Button--plain').click();
        let user = {
            'user_id': url.split('/')[4],
            'user_intro' : $('.RichText.ProfileHeader-headline').text()||'无',
            'user_type' : $('.ProfileHeader-infoItem').eq(0).text()||'无',
            'user_edu' : $('.ProfileHeader-infoItem').eq(1).text()||'无',
            'user_company' : $('.ProfileHeader-field').eq(0).text()||'无',
            'user_profile' : $('.RichText.ProfileHeader-detailValue').eq(0).text()||'无',
            'user_detail' : 1
        };
        User.saveDetail(user);
    };




    // 获取用户Url
    var getUrlList = async (url, num)=>{
        try {
            const instance = await phantom.create();
            const page = await instance.createPage();
            //等待页面加载完成
            await page.on("onLoadFinished", function(status) {
                // console.log('Status: ' + status);
            });
            const status = await page.open(url);

            //获取到页面
            const content = await page.property('content');
            // 使用cheerio解析页面
            const $ = cheerio.load(content);
            //获取用户名和url
            console.log(
                'load',url.split('/')[4],
                'item-length',$('.UserItem-name .UserLink-link').length,
                'num',num,
                'status',status,
                '\n\n');

            for(let i = 0; i < $('.UserItem-name .UserLink-link').length ; i++){
                let url  = $('.UserItem-name .UserLink-link').eq(i).attr('href'),
                    user_name = $('.UserItem-name .UserLink-link').eq(i).text();
                let user = {user_id:url.split('/')[2], user_name:user_name, user_url:'https://www.zhihu.com'+url+'/followers?page=1'};
                User.saveUrl(user);
                urlList.push('https://www.zhihu.com'+url+'/followers?page=1');
            }
            //如果分页器存在
            if($('#Profile-following .Pagination').length>0){
                currentPage = url.split("?page=")[1]; //获取当前页数
                if(currentPage === '1'){
                    allPage = $('#Profile-following .Pagination button').eq(-2).text();//获取总页数
                }
            }
            if(urlList.length>=500){
                urlList.splice(500,urlList.length-500)
            }

            await instance.exit();

            if(parseInt(currentPage) < parseInt(allPage)){//还有页数没有读取
                url = url.split('?page=')[0]+'?page='+(parseInt(currentPage)+1);
                getUrlList(url, num);
            }else{
                allPage = 0;
                currentPage = 0;
                getUrlList(urlList.shift()+'?page=1', num);
            }
        } catch (e) {
            console.log(e);
        } finally {

        }

    };

    return {
        getUrlList:getUrlList,
        getDetail:getDetail
    }
};

module.exports = extract;
