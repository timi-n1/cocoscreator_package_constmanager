/**
 * 程序自动生成，切勿手动修改
 */

(function () {

var DataMap = '##constMapHoldPlace##';
var Const = {};
for (var type in DataMap) {
    Const[type] = {};
    for (var id in DataMap[type]) {
        if( !DataMap[type][id] ){
            Const[type][id] = '$AUTO_'+type+'_'+id;
        }
        else{
            Const[type][id] = ''+DataMap[type][id];
        }
    }
}

window['cs'] = window['cs'] || {};
window['cs']['Const'] = Const;
if (typeof module == 'object' && typeof module.exports == 'object') {
    module.exports = DataMap;
}

})();