Editor.Panel.extend({
    style: `
        :host {
            padding: 4px;
            display: flex;
            flex-direction: column;
        }
        .typebox{
            margin: 4px;
        }
        .typebox .box{
            display: inline-block;
            margin: 0 0 0 2px;
        }
        .idlist{
            overflow-y: scroll;
        }
        .idlist .box{
            display: flex;
            margin: 1px 0;
            s
        }
        .idlist .box .order{
            margin: 0;
            width: 35px;
            font-size: 14px;
            display: inline-block;
            text-align: center;
            line-height: 30px;
        }
        .input{
            width: 200px;
        }
        .input2{
            flex: 1;
        }
        .cbtn{
            width:90px;
        }
    `,
    template: `
        <div class="typebox">
            <ui-button class="box" :class="{blue:type==typeActive}" v-for="(type,item) in constMap" @click="typeActive=type">{{type}}</ui-button>
        </div>
        <ui-box-container>
            <div class="idlist">
                <div class="box" v-for="(index, item) in constMap[typeActive]" track-by="$index">
                    <ui-input class="input" :value="item[0]" placeholder="请输入常量名称" v-on:change="onChangeId(index, $event)"></ui-input>
                    <ui-input class="input2" :value="item[1]" placeholder="[可选填]留空代表自动填充" v-on:change="onChangeStr(index, $event)"></ui-input>
                    <ui-button @click="deleteId(index)" class="red tiny">删除</ui-button>
                </div>
            </div>
        </ui-box-container>
        <div style="margin-top: 4px;">
            <ui-button class="cbtn green" @click="save">保存</ui-button>
            <ui-button class="cbtn" @click="addId">增加id</ui-button>
            <ui-button class="cbtn red" @click="delType">删除type</ui-button>
            <ui-button class="cbtn" @click="addType">增加type</ui-button>
            <input class="input" style="vertical-align: top;" v-model="addTypeName" placeholder="请输入type名称"></input>
        </div>
    `,

    ready() {

        const fs = require('fs-extra');
        const path = require('path');
        const resFile = path.resolve(Editor.projectInfo.path, './assets/lib/const-manager.js');
        const dtsFile = path.resolve(Editor.projectInfo.path, './typings/const-manager.d.ts');
        const templateFile = path.resolve(Editor.projectInfo.path, './packages/const-manager/template.js');
        const templateTxt = fs.readFileSync(templateFile, 'utf-8').toString();

        new window.Vue({
            el: this.shadowRoot,
            data: {
                constMap: {},
                typeActive: '',
                addTypeName: ''
            },
            created(){
                this.init();
            },
            methods: {
                init(){
                    if( fs.existsSync(resFile) ){
                        const data = require(resFile);
                        const ret = {};
                        for(var type in data){
                            ret[type] = [];
                            for(var id in data[type]){
                                ret[type].push([id, data[type][id]]);
                            }
                        }
                        this.constMap = ret;
                    }
                    this.defaultSelect();
                },
                deleteId(index){
                    this.constMap[this.typeActive].splice(index, 1);
                },
                onChangeId(index, evt){
                    this.constMap[this.typeActive][index][0] = evt.detail.value;
                },
                onChangeStr(index, evt){
                    this.constMap[this.typeActive][index][1] = evt.detail.value;
                },
                addId(){
                    this.constMap[this.typeActive].push(['','']);
                },
                addType(){
                    if( this.addTypeName.length <= 0 ){
                        console.error(this.addTypeName);
                        return;
                    }
                    for(let type in this.constMap){
                        if( type == this.addTypeName ){
                            alert('重复的type名');
                            return;
                        }
                    }
                    Vue.set(this.constMap, this.addTypeName, []);
                    this.addTypeName = '';
                },
                delType(){
                    Vue.delete(this.constMap, this.typeActive);
                    this.defaultSelect();
                },
                defaultSelect(){
                    for(let type in this.constMap){
                        this.typeActive = type;
                        return;
                    }
                },
                fixData(){
                    const ret = {};
                    for(var type in this.constMap){
                        const itemList = this.constMap[type];
                        ret[type] = {};
                        itemList.forEach((item)=>{
                            ret[type][item[0]] = item[1];
                        });
                    }
                    return ret;
                },
                save(){
                    const data = this.fixData();
                    //js文件
                    const mapStr = JSON.stringify(data, true, 4);
                    const txt = templateTxt.replace(`'##constMapHoldPlace##'`, mapStr);
                    fs.ensureFileSync(resFile);
                    fs.writeFileSync(resFile, txt);
                    //d.ts文件
                    let dts = 'declare module cs.Const {\n';
                    for(let type in this.constMap){
                        dts += this.getTypeDTS(type);
                    }
                    dts += '}\n';
                    fs.ensureFileSync(dtsFile);
                    fs.writeFileSync(dtsFile, dts);
                    Editor.success('成功');
                },
                getTypeDTS(type){
                    let dts = `\texport var ${type}: {\n\t\t`;
                    const didArr = []
                    for(let i=0; i<this.constMap[type].length; i++){
                        didArr.push(this.constMap[type][i][0]);
                    }
                    dts += didArr.join(': string,\n\t\t');
                    dts += ': string\n\t};\n';
                    return dts;
                }
            }
        });
    },
});
