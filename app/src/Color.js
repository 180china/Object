//生成两个十六进制颜色值之间的过度数组
/*startColor:起始颜色值
endColor:结束颜色值
step:步数,用多少步过度,就是数组元素数
例:gradientColor('#ffffff','#000000',10);
返回结果格式:[
				"0xff0000",
				"0xff0000",
				"0xff0000"
			]*/


function gradient (startColor,endColor,step)
{
    //将hex转换为rgb
    var sColor = hexToRgb(startColor),
        eColor = hexToRgb(endColor);

    //计算R\G\B每一步的差值
    var rStep = (eColor[0] - sColor[0]) / step;
        gStep = (eColor[1] - sColor[1]) / step;
        bStep = (eColor[2] - sColor[2]) / step;

    var gradientColorArr = [];
    for(var i=0;i<step;i++){
        //计算每一步的hex值
        gradientColorArr.push(rgbToHex(parseInt(rStep*i+sColor[0]),parseInt(gStep*i+sColor[1]),parseInt(bStep*i+sColor[2])));
    }
    return gradientColorArr;
}

function hexToRgb(hex)
{
    var rgb = [];
    for(var i=1; i<7; i+=2){
        rgb.push(parseInt("0x" + hex.slice(i,i+2)));
    }
    return rgb;
}

function rgbToHex(r, g, b)
{
    var hex = ((r<<16) | (g<<8) | b).toString(16);
    return "0x" + new Array(Math.abs(hex.length-7)).join("0") + hex;
}