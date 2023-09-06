document.addEventListener('DOMContentLoaded', function() {
    // when documents load completed

    // version load
    getVersion();

    // add elements
    manualDice();

    // linkage button functions
    execLink();
});

function getVersion(){
    const vBase = document.getElementById("version");
    const vInfo = document.createTextNode(chrome.runtime.getManifest().version);

    vBase.appendChild(vInfo);
}

function manualDice(){
    const preDice = document.getElementById("preD");

    for (let i = 1; i <= 6; i++){
        let opt = document.createElement("option");
        opt.setAttribute("value", i);
        opt.innerHTML = i;
        if (i == 1) opt.setAttribute("selected", true);

        preDice.appendChild(opt);
    }
}

function execLink(){
    document.getElementById("pop1x").onclick= popupClose;
    document.getElementById("verMain").onclick= popupShow;

}



var ScrollPositionKeep = 0;

function popupShow() {
    ScrollPositionKeep = document.documentElement.scrollTop;

    var pop = document.getElementById("pop1");
    pop.style.display = "block";
    pop.classList.add("popAnm");

    var mainb = document.getElementById("mainBase");
    mainb.style.display = "none";

    document.documentElement.scrollTop = 0;
}

function popupClose() {
    var pop = document.getElementById("pop1");
    pop.style.display = "none";
    pop.classList.remove("popAnm");

    var mainb = document.getElementById("mainBase");
    mainb.style.display = "block";

    document.documentElement.scrollTop = ScrollPositionKeep;
    ScrollPositionKeep = 0;
}