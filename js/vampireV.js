const btnRND = document.createElement("input");
    btnRND.id="xBtnRnd";
    btnRND.onclick=random_sure;
    btnRND.value="RANDOMIZE";
    btnRND.type="button";
    btnRND.classList.add("xbtn","btn-xrnd");

function export_CCF(){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        // respnse OK & connection OK then...
        if(req.readyState == 4){
            if (req.status == 200){
                var base ={} , obj = {}, stat = [{},{},{}];
                const source = JSON.parse(req.responseText);

                obj.name = source.pc_name;
                obj.memo = "via TrpgTool2";
                obj.initiative = Number(source.NP4);
                obj.externalUrl = location.href;

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
                
                base.kind = "character";
                base.data = obj;

                const expo = JSON.stringify(base, null,"");
                navigator.clipboard.writeText(expo);

                info("クリップボードへの出力が完了しました。CCFOLIAの部屋上で 貼り付け(Ctrl+V) が可能です。");
            }else{
                alert("データ取得に失敗しました ("+req.status+")");
            }
        }
    };
    req.open("GET", location.href+".js", false);
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

function random_sure(){
    let isValueChanged = 0;
    const xBtnRnd = document.getElementById("xBtnRnd");
    for (let i = 1; i<=8 ; i++){
        isValueChanged += document.getElementById("NA"+i).selectedIndex
    }
    if (isValueChanged){
        if(xBtnRnd != null){
            xBtnRnd.remove()
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
        }
        
    }
}

function random_exec(){


    random_close()
}

function random_close(){
    const xAskSpn = document.getElementById("xAskSpn");
    if ( xAskSpn != null ) xAskSpn.remove();
    
    document.getElementById("xSpnRnd").appendChild(btnRND);
}

function info(text){
    if (document.getElementsByClassName("alert").length){
        document.getElementsByClassName("alert")[0].innerHTML = text;
    }else{
        const content = document.querySelector("div[class=maincontent]");

            const base = document.createElement("div");
            base.classList.add("alert","alert-success");
            base.role="alert";
                const mes = document.createTextNode(text);
                base.appendChild(mes);
    
        content.prepend(base);
    }
}

function vMain(){
    // add object
    const side = document.querySelector("aside.leftsidebar.fixed");

    const base = document.createElement("section");
        const h4 = document.createElement("h4");
            const title = document.createTextNode("TrpgTool2 Extentions");
            h4.appendChild(title);
        base.appendChild(h4);
    
        const main = document.createElement("div");
            const spnCCF = document.createElement("span");
            spnCCF.setAttribute("rel","tooltip")
            spnCCF.dataset["html"]="true";
            spnCCF.dataset["toggle"]="tooltip";
            spnCCF.title="";
            spnCCF.dataset["originalTitle"]="CCFOLIA用の駒データを出力します。<br>※クリップボードが上書きされます。";

                const btnCCF = document.createElement("input");
                btnCCF.onclick=export_CCF;
                btnCCF.value="CCFOLIA 出力";
                btnCCF.type="button";
                btnCCF.classList.add("full","xbtn","btn-xccf");
                
                spnCCF.appendChild(btnCCF);
            main.appendChild(spnCCF);

            const spnJSO = document.createElement("span");
            spnJSO.setAttribute("rel","tooltip")
            spnJSO.dataset["html"]="true";
            spnJSO.dataset["toggle"]="tooltip";
            spnJSO.title="";
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
    // CoC's CS page
    if( document.getElementById("status_disp") != null ) vRand();
    
    // already registed
    if( document.getElementsByClassName("show_id").length ) vMain();
}
    
