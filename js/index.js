$(function () {
    //登录页面
    var enter=$('.enter');
    var bgbox=$('.bgbox');
    var loginSpan=$('.login-span');
    var loginInput=$('.login-input');
    var reset=$('.reset');
    enter.on('click',function () {
        bgbox.removeClass('bgbox').addClass('active');
        loginSpan.remove();
        loginInput.remove();
        reset.css('display','block');
    });
    //游戏页面
    var canvas=$('#canvas').get(0);
    var ctx=canvas.getContext('2d');
    var width=canvas.width;
    var row=15;
    var off=width/15;
    var flag=true;
    var ai=false;
    var blank={};
    var blocks={};
    // var ctm=$('#clock').get(0).getContext('2d');
    var audio=$('audio').get(0);
    var win=$('.win');
    var xzms=$('.xzms');
    xzms.on('click',function () {
        $('.choose-list').slideToggle();
    });
    $('.choose-list li').on('click',function () {
        $('.choose-list li').removeClass('active').eq($(this).index()).toggleClass('active');
    });
    function p2k(position) {
        return position.x+'_'+position.y;
    }
    function o2k(x,y) {
        return x+'_'+y;
    }
    function k2o(position) {
        var arr=position.split('_');
        return {x:parseInt(arr[0]),y:parseInt(arr[1])}
    }
    for(var i=0;i<row;i++){
        for(var j=0;j<row;j++){
            blank[o2k(i,j)]=true;
        }
    }
    console.log(blank);
    //画圆
    function drawyuan(x,y) {
        ctx.beginPath();
        ctx.moveTo(x*off,y*off);
        ctx.arc(x*off,y*off,3,0,2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }
    //画横线
    function creatheng(i){
        ctx.beginPath();
        ctx.moveTo(off/2+0.5,off/2+0.5+off*i);
        ctx.lineTo((row-0.5)*off,off/2+0.5+off*i);
        ctx.stroke();
        ctx.closePath();
    }
    //画竖线
    function creatshu(h){
        ctx.beginPath();
        ctx.moveTo(off/2+0.5+off*h,off/2+0.5);
        ctx.lineTo(off/2+0.5+off*h,(row-0.5)*off);
        ctx.stroke();
        ctx.closePath();
    }
    //画棋盘
    function drawqipan() {
        ctx.save();
        ctx.beginPath();
        for(var i=0;i<row;i++){
            creatheng(i);
            creatshu(i);
        }
        ctx.closePath();
        ctx.restore();
        drawyuan(3.5,3.5);
        drawyuan(11.5,3.5);
        drawyuan(7.5,7.5);
        drawyuan(3.5,11.5);
        drawyuan(11.5,11.5);
    }
    drawqipan();
    //画棋子
    function drawchess(position,color) {
        ctx.save();
        ctx.beginPath();
        ctx.translate((position.x+0.5)*off+0.5,(position.y+0.5)*off+0.5);
        ctx.arc(0,0,10,0,2*Math.PI);
        if (color==='black'){
            var radgrad = ctx.createRadialGradient(-5,-5,1,0,0,10);
            radgrad.addColorStop(0, '#fff');
            radgrad.addColorStop(1, '#000');
            ctx.fillStyle = radgrad;
            blocks[p2k(position)]='black';
            audio.play();
        }else{
            ctx.fillStyle='#fff';
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 1;
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            blocks[p2k(position)]='white';
            audio.play();
        }
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        delete blank[p2k(position)];
    }
    //判断输赢
    function check(pos,color) {
        var rowNum=1;
        var colNum=1;
        var leftNum=1;
        var rightNum=1;
        var table={};
        for(var i in blocks){
            if (blocks[i]===color){
                table[i]=color
            }
        }
        var tx=pos.x;
        var ty=pos.y;
        while (table[(tx+1)+'_'+ty]){
            tx++;
            rowNum++;
        }
        tx=pos.x;
        ty=pos.y;
        while (table[(tx-1)+'_'+ty]){
            tx--;
            rowNum++;
        }
        tx=pos.x;
        ty=pos.y;
        while (table[tx+'_'+(ty+1)]){
            ty++;
            colNum++;
        }
        tx=pos.x;
        ty=pos.y;
        while (table[tx+'_'+(ty-1)]){
            ty--;
            colNum++;
        }
        tx=pos.x;
        ty=pos.y;
        while (table[(tx-1)+'_'+(ty-1)]){
            tx--;
            ty--;
            leftNum++;
        }
        tx=pos.x;
        ty=pos.y;
        while (table[(tx+1)+'_'+(ty+1)]){
            tx++;
            ty++;
            leftNum++;
        }
        tx=pos.x;
        ty=pos.y;
        while (table[(tx+1)+'_'+(ty-1)]){
            tx++;
            ty--;
            rightNum++;
        }
        tx=pos.x;
        ty=pos.y;
        while (table[(tx-1)+'_'+(ty+1)]){
            tx--;
            ty++;
            rightNum++;
        }
        return Math.max(rowNum,colNum,leftNum,rightNum);
    }
    //绘制棋谱
    function drawText(pos,text,color) {
        ctx.save();
        ctx.font='15px 微软雅黑';
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        if (color==='black'){
            ctx.fillStyle='white';
        }else{
            ctx.fillStyle='black';
        }
        ctx.fillText(text,(pos.x+0.5)*off,(pos.y+0.5)*off);
        ctx.restore();
    }
    function review() {
        var i=1;
        for(var pos in blocks){
            drawText(k2o(pos),i,blocks[pos]);
            i++;
        }
    }
    //AI

    function AI() {
        var max1 = -Infinity;
        var max2 = -Infinity;
        var pos1;
        var pos2;
        for(var i in blank){
            var score1 = check(k2o(i),'black');
            var score2 = check(k2o(i),'white');
            if(score1>max1){
                max1 = score1;
                pos1 = k2o(i);
            }
            if(score2>max2){
                max2 = score2;
                pos2 = k2o(i);
            }
        }
        if(max1>=max2){
            return pos1;
        }else{
            return pos2;
        }
    }
    //点击事件
    function handleclick(e) {
        position={
            x:Math.round((e.offsetX-off/2)/off),
            y:Math.round((e.offsetY-off/2)/off)
        };
        if (blocks[p2k(position)]){
            return
        }
        if(ai){
            drawchess(position,'black');
            drawchess(AI(),'white');
            if(check(position,'black')>=5){
                win.text('黑棋赢').css('display','block');
                $('.qipu').css('display','block');
                $(canvas).off('click');
                // if(confirm('是否生成棋谱')){
                //     review();
                // }
                return;
            }
            if(check(AI(),'white')>=6){
                win.text('白棋赢').css('display','block');
                $('.qipu').css('display','block');
                $(canvas).off('click');
                // if(confirm('是否生成棋谱')){
                //     review();
                // }
                return;
            }
            return;
        }
        if (flag){
            drawchess(position,'black');
            if (check(position,'black')>=5){
                win.text('黑棋赢').css('display','block');
                $('.qipu').css('display','block');
                $(canvas).off('click');
                // if (confirm('是否生成棋谱')){
                //     review()
                // }
                return;
            }
        }else{
            drawchess(position,'white');
            if (check(position,'white')>=5){
                win.text('白棋赢').css('display','block');
                $('.qipu').css('display','block');
                $(canvas).off('click');
                // if (confirm('是否生成棋谱')){
                //     review()
                // }
                return;
            }
        }
        flag=!flag;
    }
    $(canvas).on('click',handleclick);
    reset.on('click',function () {
        ctx.clearRect(0,0,width,width);
        flog=true;
        drawqipan();
        blocks={};
        win.css('display','none');
        $(canvas).off('click').on('click',handleclick);
        $('.qipu').css('display','none');
    });
    $('#AI').on('click',function () {
        $('.role').css('display','block');
        $('.left span').text('玩家');
        $('.right span').text('电脑');
        $('#canvas').css('display','block');
        $('.qipu').css('display','none');
        ctx.clearRect(0,0,width,width);
        flog=true;
        drawqipan();
        blocks={};
        win.css('display','none');
        $(canvas).off('click').on('click',handleclick);
        if(ai==true){
            ai=false
        }else if(ai==false){
            ai = true;
        }
    });
    $('#pp').on('click',function () {
        $('.role').css('display','block');
        $('.left span').text('玩家1');
        $('.right span').text('玩家2');
        $('#canvas').css('display','block');
        $('.qipu').css('display','none');
        ctx.clearRect(0,0,width,width);
        flog=true;
        drawqipan();
        blocks={};
        win.css('display','none');
        $(canvas).off('click').on('click',handleclick);
        if(ai==true){
            ai=false
        }
    });
    $('.qipu').on('click',function () {
        review()
    });
    $(document).on('mousedown',false);
});