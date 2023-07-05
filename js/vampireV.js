function export_CCF(){
    alert("yeah");
}

function export_JSO(){
    if (location.pathname != "coc_pc_making.html") {
        const temp = document.createElement("a");
        temp.download = (location.pathname+".json").replace("/","");
        temp.href = location.href+".js";
        
        temp.click();temp.remove();
    }
    
}

function vMain(){
    const side = document.querySelector("aside.leftsidebar.fixed");

    const base = document.createElement("section");
        const h4 = document.createElement("h4");
            const title = document.createTextNode("TrpgTool2 Extentions");
            h4.appendChild(title);
        base.appendChild(h4);
    
        const main = document.createElement("div");
            const spnCCF = document.createElement("span");
            spnCCF.setAttribute("rel","tooltip")
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
            spnJSO.dataset["toggle"]="tooltip";
            spnJSO.title="";
            spnJSO.dataset["originalTitle"]="JSOOLIA用の駒データを出力します。<br>※クリップボードが上書きされます。";

                const btnJSO = document.createElement("input");
                btnJSO.onclick=export_JSO;
                btnJSO.value="JSON 出力";
                btnJSO.type="button";
                btnJSO.classList.add("full","xbtn","btn-xjso");
                
                spnJSO.appendChild(btnJSO);
            main.appendChild(spnJSO);

        base.appendChild(main);
    side.appendChild(base);
}

if (
    document.getElementsByClassName("leftsidebar fixed").length & 
    document.getElementsByClassName("show_id").length ) {
        vMain();
}