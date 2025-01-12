let randomCount = 0;

const export_options = {
    "sort_order" : 0,
    "changed_only" : true,
    "dice_prefix" : "CCB"
};

const btnRND = document.createElement("input");
    btnRND.id="xBtnRnd";
    btnRND.onclick=random_sure;
    btnRND.value="ALL RANDOMIZE";
    btnRND.type="button";
    btnRND.classList.add("xbtn","btn-xrnd");

const selects = Array.from({ length: 8 }, (_, i) => document.getElementById(`NA${i + 1}`));

function export_CCF(){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        // respnse OK & connection OK then...
        if( req.readyState == 4 ){
            if ( req.status == 200 ){
                var base = {}, 
                    obj = {}, 
                    stat = Array(3).fill({}).map(() => ({})),
                    pram = Array(8).fill({}).map(() => ({})),
                    cmd = "";

                try {    
                    const source = JSON.parse(req.responseText);
    
                    // base info
                    obj.name = source.pc_name;
                    obj.memo = "via TrpgTool2";
                    obj.initiative = Number(source.NP4);
                    obj.externalUrl = location.href;
    
                    // status
                    stat[0].label = "HP";
                    stat[0].value = source.NP9;
                    stat[0].max = source.NP9;
                    stat[1].label = "MP";
                    stat[1].value = source.NP10;
                    stat[1].max = source.NP10;
                    stat[2].label = "SAN";
                    stat[2].value = source.SAN_Left;
                    stat[2].max = source.SAN_Left;
                    obj.status = stat;
                    
                    // params
                    const labels = ["STR","CON","POW","DEX","APP","SIZ","INT","EDU"];
                    pram.forEach((item, index) => {
                        item.label = labels[index];
                        item.value = source[`NP${index + 1}`];
                    });
                    // damage bonus
                    pram.push({"label":"db", "value":source.dmg_bonus});
                    obj.params = pram;
    
                    // commands - chat pallet
                    
                    // main skill
                    // T[B]A(P) -> 
                    // [SKILL] Battle, F?Search, Act, Communicate?, Knowledge
                    // ( TYPE) <U>, Default, Shokugyo, Kyomi, A?(Seicho), Other, P?(Total)
                    const skill = ["TBA","TFA","TAA","TCA","TKA"];
                    let skill_name = [
                        ["回避","キック","組み付き","こぶし（パンチ）","頭突き","投擲","マーシャルアーツ","拳銃","サブマシンガン","ショットガン","マシンガン","ライフル"],
                        ["応急手当","鍵開け","隠す","隠れる","聞き耳","忍び歩き","写真術","精神分析","追跡","登攀","図書館","目星"],
                        ["運転","機械修理","重機械操作","乗馬","水泳","製作","操縦","跳躍","電気修理","ナビゲート","変装"],
                        ["言いくるめ","信用","説得","値切り","母国語"],
                        ["医学","オカルト","化学","クトゥルフ神話","芸術","経理","考古学","コンピューター","心理学","人類学","生物学","地質学","電子工学","天文学","博物学","物理学","法律","薬学","歴史"]
                    ];
                    // option name
                    if (source.unten_bunya != "") skill_name[2][0] += `(${source.unten_bunya})`;
                    if (source.seisaku_bunya != "") skill_name[2][5] += `(${source.seisaku_bunya})`;
                    if (source.main_souju_norimono != "") skill_name[2][6] += `(${source.main_souju_norimono})`;
                    if (source.mylang_name != "") skill_name[3][4] += `(${source.mylang_name})`;
                    if (source.geijutu_bunya != "") skill_name[4][4] += `(${source.geijutu_bunya})`;
                    // external skill name
                    skill.forEach((item, index) => {
                        try {
                            skill_name[index] = skill_name[index].concat(source[`${item}Name`]);
                        } catch (error) {
                            console.log("External skill name:", error);
                        }
                    });
    
                    // header command
                    cmd  = `${export_options.dice_prefix}<={SAN} 【SAN値チェック】\n`;
                    cmd += `${export_options.dice_prefix}<=${source.NP12} 【アイデア】\n`;
                    cmd += `${export_options.dice_prefix}<=${source.NP13} 【幸運】\n`;
                    cmd += `${export_options.dice_prefix}<=${source.NP14} 【知識】\n`;
                    cmd += "　\n== 能力値 * 5 ====\n";
                    labels.forEach( element => {
                        cmd += `${export_options.dice_prefix}<=({${element}}*5) 【${element}】\n`
                    });
                    cmd += "　\n== 技能値 ====\n";
    
                    // base data
                    var accessKey;
                    let queue = [];
                    skill.forEach( ( key, k_index ) => {
                        accessKey = `${key}P`;
                        source[accessKey].forEach( ( item, index ) => {
                            var line = {};
                            
                            line.value = Number(item);
                            line.label = skill_name[k_index][index];
                            
                            if ( ( export_options.changed_only && source[`${key}D`][index] != item ) || !export_options.changed_only ) queue.push(line);
                        });
                    });
    
                    // data sort
                    var last_value = null;
                    switch ( export_options.sort_order ){
                        // 標準
                        case 0:
                            queue.forEach( element => {
                                cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}】\n`
                            });
                            break;
    
                        // 降順
                        case 1:
                            queue.sort( (a, b) => {
                                return (a.value > b.value) ? -1 : 1;
                            });
                            queue.forEach( element => {
                                cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}】\n`
                            });
                            break;
    
                        // 降順 まとめる
                        case 2:
                            queue.sort( (a, b) => {
                                return (a.value > b.value) ? -1 : 1;
                            });
                            queue.forEach( element => {
                                if ( last_value != element.value ) {
                                    if ( last_value != null ) cmd += "】\n";
                                    cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}`;
                                    last_value = element.value;
                                } else {
                                    cmd += `, ${element.label}`;
                                }
                            });
                            cmd += "】\n";
                            break;
    
                        // 昇順
                        case 3:
                            queue.sort( (a, b) => {
                                return (a.value < b.value) ? -1 : 1;
                            });
                            queue.forEach( element => {
                                cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}】\n`
                            });
                            break;
    
                        // 昇順 まとめる
                        case 4:
                            queue.sort( (a, b) => {
                                return (a.value < b.value) ? -1 : 1;
                            });
                            queue.forEach( element => {
                                if ( last_value != element.value ) {
                                    if ( last_value != null ) cmd += "】\n";
                                    cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}`;
                                    last_value = element.value;
                                } else {
                                    cmd += `, ${element.label}`;
                                }
                            });
                            cmd += "】\n";
                            break;
                    };
    
                    obj.commands = cmd;
                    
    
                    base.kind = "character";
                    base.data = obj;
    
                    const expo = JSON.stringify(base, null,"");
                    navigator.clipboard.writeText(expo);
    
                    info("クリップボードへの出力が完了しました。CCFOLIAの部屋上で 貼り付け(Ctrl+V) が可能です。");
                    scroll_top();

                } catch (error) {
                    console.log("JSON parse:", error);        
                }

            }else{
                alert("データ取得に失敗しました ("+req.status+")");
            }

        }
    };
    req.open("GET", location.href + ".js", true);
    req.send(null);
    
}

function export_JSO(){
    if (location.pathname != "coc_pc_making.html") {
        const temp = document.createElement("a");
        temp.download = (location.pathname+".json").replace("/","");
        temp.href = location.href+".js";
        
        temp.click();temp.remove();
    }
    
}

function export_CPE(){
    var palette = ""

}

function scroll_top(){
    window.scroll({
        top: 0,
        behavior: "smooth",
    });
}

function random_sure(){
    let isValueChanged = 0;
    const xBtnRnd = document.getElementById("xBtnRnd");
    if(xBtnRnd != null) xBtnRnd.remove();
    for (var i = 0; i < selects.length ; i++){
        isValueChanged += selects[i].selectedIndex;
    }
    if (isValueChanged){
        const base = document.getElementById("xSpnRnd");
        const askSpan = document.createElement("span");
            askSpan.id="xAskSpn";
            askSpan.classList.add("alert","alert-danger");
            askSpan.role="alert";
                const randSure = document.createTextNode("※ 能力値が上書きされます。よろしいですか？ ");
                    const btnYES = document.createElement("input");
                        btnYES.id="xBtnYes";
                        btnYES.onclick=random_exec;
                        btnYES.value="Yes";
                        btnYES.type="button";
                        btnYES.classList.add("xbtn","btn-xyes");
                    const btnNO = document.createElement("input");
                        btnNO.id="xBtnNo";
                        btnNO.onclick=random_close;
                        btnNO.value="No";
                        btnNO.type="button";
                        btnNO.classList.add("xbtn","btn-xno");
            askSpan.appendChild(randSure);
            askSpan.appendChild(btnYES);
            askSpan.appendChild(btnNO);
        base.appendChild(askSpan);
    }else{
        random_exec();
    }
}

function dice(dice,max){
    var tmp = 0;
    var res = 0;
    var resa = [];
    for (var i = 0; i < dice; i++){
        tmp = Math.floor( Math.random() * max) + 1;
        res += tmp;
        resa.push(tmp);
    }
    console.log(res,resa);
    return [res,resa];
}

function random_exec(){
    randomCount++;
    random_clear();
    const xResSpn = document.getElementById("xResSpn");
    // table random
    for (var i = 0; i < selects.length; i++){
        // 礼儀は守らなきゃ... 
        //STR...APP = 3D6; SIZ,INT = 2D6+6; EDU = 3D6+3
        if (i < 5){
            selects[i].selectedIndex = (dice(3,6)[0] -1);
        } else {
            switch(i){
                case 5:
                    selects[i].selectedIndex = (dice(2,6)[0] + 6 -1);
                    break;
                case 6:
                    selects[i].selectedIndex = (dice(2,6)[0] + 6 -7);
                    break;
                default:
                    //case7
                    selects[i].selectedIndex = (dice(3,6)[0] + 3 -5);
            }
        }
    }
    
    // onchange
    selects[0].dispatchEvent(new Event("change"));

    if ( xResSpn != null ) {
        const xResCnt = document.getElementById("xResCntS");
        xResCnt.innerText = randomCount;
    }else{
        const base = document.getElementById("xSpnRnd");
        const resSpan = document.createElement("span");
            resSpan.id="xResSpn";
            resSpan.classList.add("alert","alert-success");
            resSpan.role="alert";

            const resMain = document.createTextNode("能力値をランダムに設定しました。 振り直し回数:")
            const resCntS = document.createElement("span");
                resCntS.id = "xResCntS";
                const resCntT = document.createTextNode(randomCount);
                resCntS.appendChild(resCntT);

            const btnRET = document.createElement("input");
                btnRET.id="xBtnRet";
                btnRET.onclick=random_exec;
                btnRET.value="AGAIN!";
                btnRET.type="button";
                btnRET.classList.add("xbtn","btn-xyes");

            resSpan.appendChild(resMain);
            resSpan.appendChild(resCntS);
            resSpan.appendChild(btnRET);
        base.appendChild(resSpan);
    }
}

function random_clear(){
    const xAskSpn = document.getElementById("xAskSpn");
    if ( xAskSpn != null ) xAskSpn.remove();
}

function random_close(){
    random_clear();
    document.getElementById("xSpnRnd").appendChild(btnRND);
}

function info(text){
    const preInfo = document.getElementById("xInfo");
    if (preInfo != null){
        preInfo.innerHTML = text;
    }else{
        const content = document.querySelector("div[class=maincontent]");

            const base = document.createElement("div");
            base.id = "xInfo";
            base.classList.add("alert","alert-success");
            base.role="alert";
                const mes = document.createTextNode(text);
                base.appendChild(mes);
    
        content.prepend(base);
    }
}

function vMain(){
    // prepare option
    let opt;
    // add object
    const side = document.querySelector("aside.leftsidebar.fixed");

    // temporary fix
    document.getElementsByClassName("trifull btn btn-info")[0].innerHTML = "<span class=\"fa fa-file-text-o\"></span> TXT"

    const base = document.createElement("section");
        const h4 = document.createElement("h4");
            const title = document.createTextNode("TrpgTool2 Extention");
            h4.appendChild(title);
        base.appendChild(h4);
    
        const main = document.createElement("div");
            // options
            const spnOPT = document.createElement("span");
            spnOPT.setAttribute("rel","tooltip");
                // chat sort?
                const lblCHP = document.createElement("label");
                    lblCHP.appendChild(document.createTextNode("並び替え: "));
                    const selCHP = document.createElement("select");

                    let optCHP = ["= 標準","↓ 降順","↓) 降順/まとめる","↑ 昇順","↑) 昇順/まとめる"]

                    for (let i = 0; i < optCHP.length; i++){
                        opt = document.createElement("option");
                        opt.setAttribute("value", optCHP[i]);
                        opt.innerHTML = optCHP[i];
                        if (i == export_options.sort_order) opt.setAttribute("selected", true);
                        
                        selCHP.appendChild(opt);
                    }
                    selCHP.onchange = function(){
                        export_options.sort_order = this.selectedIndex;
                    };
                    
                    lblCHP.appendChild(selCHP);
                spnOPT.appendChild(lblCHP);

                // changed only?
                const lblACT = document.createElement("label");
                    const chkACT = document.createElement("input");
                    chkACT.type="checkbox";
                    chkACT.checked = true;
                    chkACT.onchange = function(){
                        export_options.changed_only = this.checked;
                    }
                    lblACT.appendChild(chkACT);
                    lblACT.appendChild(document.createTextNode(" 変更された技能のみ出力"));
                spnOPT.appendChild(lblACT);

                // dice prefix?
                const lblPRF = document.createElement("label");
                    lblPRF.appendChild(document.createTextNode("ダイスの種類: "));
                    const selPRF = document.createElement("select");
                    
                        opt = document.createElement("option");
                        opt.setAttribute("value", "CCB");
                        opt.innerHTML = "CCB";
                        opt.setAttribute("selected", true);
                        selPRF.appendChild(opt);
                        
                        opt = document.createElement("option");
                        opt.setAttribute("value", "CC");
                        opt.innerHTML = "CC";
                        selPRF.appendChild(opt);

                        selPRF.onchange = function(){
                            export_options.dice_prefix = this.value;
                        };

                    lblPRF.appendChild(selPRF);
                spnOPT.appendChild(lblPRF);

            main.appendChild(spnOPT);

            // ccfolia export
            const spnCCF = document.createElement("span");
            spnCCF.setAttribute("rel","tooltip");
            spnCCF.dataset["html"]=true;
            spnCCF.dataset["toggle"]="tooltip";
            spnCCF.dataset["originalTitle"]="CCFOLIA用の駒データを出力します。<br>※クリップボードが上書きされます。";

                const btnCCF = document.createElement("input");
                btnCCF.onclick=export_CCF;
                btnCCF.value="CCFOLIA 出力";
                btnCCF.type="button";
                btnCCF.classList.add("full","xbtn","btn-xccf");
                
                spnCCF.appendChild(btnCCF);
            main.appendChild(spnCCF);

            // chat export
            const spnCPE = document.createElement("span");
            spnCPE.setAttribute("rel","tooltip");
            spnCPE.dataset["html"]=true;
            spnCPE.dataset["toggle"]="tooltip";
            spnCPE.dataset["originalTitle"]="チャットパレットを出力します。<br>※クリップボードが上書きされます。";

                const btnCPE = document.createElement("input");
                btnCPE.onclick=export_CPE;
                btnCPE.value="チャットパレット出力";
                btnCPE.type="button";
                btnCPE.classList.add("full","xbtn","btn-xccf");
                
                spnCPE.appendChild(btnCPE);
            // main.appendChild(spnCPE);

            // json export
            const spnJSO = document.createElement("span");
            spnJSO.setAttribute("rel","tooltip");
            spnJSO.dataset["html"]="true";
            spnJSO.dataset["toggle"]="tooltip";
            spnJSO.dataset["originalTitle"]="JSON形式のファイル出力します。";

                const btnJSO = document.createElement("input");
                btnJSO.onclick=export_JSO;
                btnJSO.value="JSON ダウンロード";
                btnJSO.type="button";
                btnJSO.classList.add("full","xbtn","btn-xjso");
                
                spnJSO.appendChild(btnJSO);
            main.appendChild(spnJSO);

        base.appendChild(main);
    side.appendChild(base);

    
}

function vRand(){
    // add rand option
    const base = document.getElementById("status_disp").getElementsByClassName("disp")[0];
        const spnRND = document.createElement("span");
        spnRND.id="xSpnRnd";
        spnRND.setAttribute("rel","tooltip")
        spnRND.dataset["html"]="true";
        spnRND.dataset["toggle"]="tooltip";
        spnRND.title="";
        spnRND.dataset["originalTitle"]="能力値をダイスで決定します。<br>※現在の能力値が上書きされます。";

        spnRND.appendChild(btnRND);
    base.appendChild(spnRND);
}


if ( document.getElementsByClassName("leftsidebar fixed").length ){
    // is CoC's CS page?
    if( document.querySelector("[href=\"https://charasheet.vampire-blood.net/coc_pc_making.html\"]") != null ) vRand();
    // if( document.getElementById("status_disp") != null ) vRand();
    
    // is already registed?
    if( document.getElementsByClassName("show_id").length ) vMain();
}
    
