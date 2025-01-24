let randomCount = 0;

const export_options = {
    "sort_order" : 1,
    "changed_only" : true,
    "dice_prefix" : "CCB",
    "secret" : false,
    "invisible" : false,
    "hide_status" : false
};

const btnRND = document.createElement("input");
    btnRND.id="xBtnRnd";
    btnRND.onclick=random_sure;
    btnRND.value="ALL RANDOMIZE";
    btnRND.type="button";
    btnRND.classList.add("xbtn","btn-xrnd");

const ability_labels = ["STR","CON","POW","DEX","APP","SIZ","INT","EDU"];

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
                    pram = Array(8).fill({}).map(() => ({}));

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
                    pram.forEach((item, index) => {
                        item.label = ability_labels[index];
                        item.value = source[`NP${index + 1}`];
                    });
                    // damage bonus
                    pram.push({"label":"db", "value":source.dmg_bonus});
                    obj.params = pram;
    
                    // commands - chat pallet
                    obj.commands = chat_palette(source, 0);
                    
                    // advanced options
                    obj.secret = export_options.secret;
                    obj.invisible = export_options.invisible;
                    obj.hideStatus = export_options.hide_status;

                    // format
                    base.kind = "character";
                    base.data = obj;
                    
                    const expo = JSON.stringify(base, null,"");
                    navigator.clipboard.writeText(expo);
                    
                    info("クリップボードへの出力が完了しました。CCFOLIAの部屋上で 貼り付け(Ctrl+V) が可能です。");
                    
                } catch (error) {
                    warn("データ取得に失敗しました。\n保存してから行いましたか？", error, "JSON parse");
                    
                }

            }else{
                warn("データ取得に失敗しました。\n保存してから行いましたか？", req.status, "HTTP request");
            }

        }
    };
    req.open("GET", location.href + ".js", true);
    req.send(null);
    
}

function chat_palette(source, mode){
    var cmd;

    if ( mode == 1 && export_options.sort_order == 0 ) {
        warn("チャットパレットが 出力しない に設定されています！", "chat_palette", "no export");
        return -1;
    };
    
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
    const yomi_order = [
        [211, 223, 232, 252, 332, 451, 712, 243, 310, 325, 711, 910],
        [151, 213, 214, 215, 222, 321, 322, 342, 430, 452, 453, 740],
        [130, 221, 323, 324, 331, 341, 350, 422, 441, 510, 640],
        [121, 326, 344, 540, 652],
        [122, 152, 212, 231, 241, 242, 251, 253, 327, 328, 343, 421, 442, 443, 610, 630, 651, 810, 940]
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
            yomi_order[index] = yomi_order[index].concat(Array(3).fill( (index + 1) * 1000 ));
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
    if (mode == 1){
        // chat palette only?
        ability_labels.forEach( (item, index) => {
            cmd += `${export_options.dice_prefix}<=(${source[`NP${index + 1}`]}*5) 【${item}】\n`
        });
    } else {
        ability_labels.forEach( element => {
            cmd += `${export_options.dice_prefix}<=({${element}}*5) 【${element}】\n`
        });
    }
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
            line.yomi = yomi_order[k_index][index];
            
            if ( ( export_options.changed_only && source[`${key}D`][index] != item ) || !export_options.changed_only ) queue.push(line);
        });
    });

    // data sort
    var last_value = null;
    switch ( export_options.sort_order ){
        // No
        case 0:
            cmd = "";
            break;
        // 標準
        case 1:
            queue.forEach( element => {
                cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}】\n`
            });
            break;

        // 降順
        case 2:
            queue.sort( (a, b) => {
                return (a.value > b.value) ? -1 : 1;
            });
            queue.forEach( element => {
                cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}】\n`
            });
            break;

        // 降順 まとめる
        case 3:
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
        case 4:
            queue.sort( (a, b) => {
                return (a.value < b.value) ? -1 : 1;
            });
            queue.forEach( element => {
                cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}】\n`
            });
            break;

        // 昇順 まとめる
        case 5:
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
        // 五十音順
        case 6:
            queue.sort( (a, b) => {
                return (a.yomi < b.yomi) ? -1 : 1;
            });
            queue.forEach( element => {
                cmd += `${export_options.dice_prefix}<=${element.value} 【${element.label}】\n`
            });
            break;
    };

    return cmd;
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
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        // respnse OK & connection OK then...
        if( req.readyState == 4 ){
            if ( req.status == 200 ){
                try {    
                    const source = JSON.parse(req.responseText);
                    var expo = chat_palette(source, 1);
                    if ( expo != -1 ){
                        navigator.clipboard.writeText(expo);
    
                        info("クリップボードへの出力が完了しました。貼り付け(Ctrl+V) が可能です。");
                    }

                } catch (error) {
                    warn("データ取得に失敗しました。\n保存してから行いましたか？", error, "JSON parse");
                }
            }else{
                warn("データ取得に失敗しました。\n保存してから行いましたか？", req.status, "HTTP request");
            }
        }
    };
    req.open("GET", location.href + ".js", true);
    req.send(null);
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
    selects.forEach( element =>{
        isValueChanged += element.selectedIndex;
    });

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

function warn(text, detail, type){
    const preInfo = document.getElementById("xInfo");
    const context = `${text} (${detail})`;

    if (preInfo != null){
        preInfo.innerText = context;
        preInfo.classList.replace("alert-success", "alert-danger");
    }else{
        const content = document.querySelector("div[class=maincontent]");

            const base = document.createElement("div");
            base.id = "xInfo";
            base.classList.add("alert","alert-danger");
            base.role="alert";
            base.innerText = context;
    
        content.prepend(base);

    }

    console.log(`${type}: ${detail}`);
    scroll_top();
}

function info(text){
    const preInfo = document.getElementById("xInfo");
    if (preInfo != null){
        preInfo.innerText = text;
        preInfo.classList.replace("alert-danger", "alert-success");
    }else{
        const content = document.querySelector("div[class=maincontent]");

            const base = document.createElement("div");
            base.id = "xInfo";
            base.classList.add("alert","alert-success");
            base.role="alert";
            base.innerText = text;
    
        content.prepend(base);
    }

    scroll_top();
}

function vMain(){
    // prepare option
    let opt;
    // custion line
    const xhr = document.createElement("hr");
    xhr.classList.add("xhr");
    // add object
    const side = document.querySelector("aside.leftsidebar.fixed");
    document.getElementsByClassName("leftsidebar fixed")[0].children[3].children[1].onclick
    // option contexts
    const optCHP = ["X 出力しない","= 標準", "↓ 降順", "↓) 降順/まとめる", "↑ 昇順", "↑) 昇順/まとめる","あ 五十音順"],
          optPRF = ["CCB", "CC", "1d100"],
          optADV = ["ステータスを非公開", "発言時キャラ表示しない", "盤面キャラ一覧に表示しない"];
    // configure
    const cfgADV = ["secret", "invisible", "hide_status"];

    // temporary fix
    document.getElementsByClassName("trifull btn btn-info")[0].innerHTML = "<span class=\"fa fa-file-text-o\"></span> TXT"
    
    const base = document.createElement("section");
    base.id = "trpgtool2";
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
                    

                    optCHP.forEach( (item, index) => {
                        opt = document.createElement("option");
                        opt.setAttribute("value", item);
                        opt.innerText = item;
                        if (index == export_options.sort_order) opt.setAttribute("selected", true);
                        
                        selCHP.appendChild(opt);
                    });
                    
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
                        
                        optPRF.forEach( element => {
                            opt = document.createElement("option");
                            opt.setAttribute("value", element);
                            opt.innerText = element;

                            if ( element == export_options.dice_prefix ) opt.setAttribute("selected", true);
                            
                            selPRF.appendChild(opt);
                        });

                        selPRF.onchange = function(){
                            export_options.dice_prefix = this.value;
                        };

                    lblPRF.appendChild(selPRF);
                spnOPT.appendChild(lblPRF);

                // changed only?
                optADV.forEach( (item, index) => {
                    const lblADV = document.createElement("label");
                        const chkADV = document.createElement("input");
                        chkADV.type = "checkbox";
                        chkADV.onchange = function(){
                            export_options[`${cfgADV[index]}`] = this.checked;
                        }
                        lblADV.appendChild(chkADV);
                        lblADV.appendChild(document.createTextNode(` ${item}`));
                    spnOPT.appendChild(lblADV);
                });

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
                btnCPE.value="チャットパレット 出力";
                btnCPE.type="button";
                btnCPE.classList.add("full","xbtn","btn-xccf");
                
                spnCPE.appendChild(btnCPE);
            main.appendChild(spnCPE);

            main.appendChild(xhr);

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

    // accordion option
    for (var i = 3; i <= 5; i++){
        const accHeader = side.children[i];
        const guideContext = document.createElement("span");
        // guideContext.id = "xguide";
        guideContext.innerText = " ↑ ヘッダ クリックで展開 ↑";
        guideContext.className = "acc-hide";
        accHeader.appendChild(guideContext);

        accHeader.children[0].onclick = function() {
            accHeader.children[1].classList.toggle("acc-hide");
            accHeader.children[2].classList.toggle("acc-hide");
        };

        // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        if (i == 3 || i == 4) accHeader.children[0].click();
    }
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

// character main
if ( document.getElementsByClassName("leftsidebar fixed").length ){
    // is CoC's CS page?
    if( document.querySelector("[href=\"https://charasheet.vampire-blood.net/coc_pc_making.html\"]") != null ) vRand();
    // if( document.getElementById("status_disp") != null ) vRand();
    
    // is already registed?
    if( document.getElementsByClassName("show_id").length ) vMain();
}
    
// help main
if (location.href.indexOf("https://charasheet.vampire-blood.net/help") === 0){
    const main = document.getElementsByClassName("maincontent")[0],
          display_base = document.createElement("section"),
          header = document.createElement("h4"),
          context = document.createElement("p");

    header.innerText = "★★★ TrpgTool2 の お問い合わせ ★★★★★";
    context.innerHTML = 'TrpgTool2 についての 不具合報告 または お問い合わせ につきましては、 <u>キャラクター保管所様 ではなく</u>、<br/> <b>必ず</b> <a href="https://chromewebstore.google.com/detail/ngjonoelmonhcjejhdiedhaicnmcjjop">TrpgTool2 のストアページ</a> からお問い合わせください。';
    
    display_base.appendChild(header);
    display_base.appendChild(context);

    main.prepend(display_base);
};