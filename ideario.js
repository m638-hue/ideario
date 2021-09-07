//#region startFunctions
let main = (localStorage.getItem("main")) ? JSON.parse(localStorage.getItem("main")) :  {
                                                                                            folder:[{
                                                                                                name: "Ideario",
                                                                                                texts: [],
                                                                                                folder: [],
                                                                                                folderId: 0,
                                                                                            }],
                                                                                        };

function start(){
    document.querySelector("body").onclick = blurTexts;
    document.querySelector(".addText").onclick = addText;
    document.querySelector(".addFolder").onclick = addFolder;
    loadLS(main.folder[0]);
    allBlurFocus();
    allWordCount();
    allCogsSpin();
}

function allBlurFocus(){
    let allTextContainers = document.querySelectorAll(".mainContainer .textsContainer .indivTextContainer");
    
    for(const container of allTextContainers){
        if(!container.classList.contains("folder")){
            let title = container.children[0];
            let text = container.children[3];

            title.onfocus = focusParent;
            title.onblur = blurParent;

            text.onfocus = focusParent;
            text.onblur = blurParent;
        }
    }
}

function allWordCount(){
    let textElements = document.querySelectorAll(".mainContainer .textsContainer .indivTextContainer .text");
    
    for(const text of textElements){
        var event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
        
        text.dispatchEvent(event);
    }
}

function allCogsSpin(){
    let allCogs = document.querySelectorAll(".mainContainer .textsContainer .indivTextContainer .cog");
    for(const cog of allCogs){
        cog.onclick = displayOptions;
    }
}
//#endregion

//#region LocalStorage
function updateLS(){
    localStorage.setItem("main", JSON.stringify(main));
}

function loadLS(folder){
    let textContainer = document.querySelector(".mainContainer .textsContainer");
    let delay = 5;

    for(const f of folder.folder){
        let folderHTML = createFolder(moment(f.date), f.name, f.folderId, f.hidden, f.folder, f.texts);
        folderHTML.onanimationend = endAddAnimation;
        folderHTML.style.animation = `fadeIn .${delay}s`
        textContainer.appendChild(folderHTML);

        delay++
    }
    
    for(const t of folder.texts){
        let textHTML = createText(t.title, t.text, moment(t.date), t.id, t.hidden);
        textHTML.onanimationend = endAddAnimation;
        textHTML.style.animation = `fadeIn .${delay}s`
        textContainer.appendChild(textHTML);

        delay++;
    }
}

function isTextInLS(id, path){
    let folder = getFolder(path)
    for(const text of folder.texts){
        if(text.id == id) return true;
    }

    return false;
}

function addTextToLS(textContainer){
    textContainer.parentElement.parentElement.querySelector(".addText").classList.remove("fadeButton");

    let folder = getFolder(textContainer.parentElement.parentElement.parentElement.children[0].dataset.path);
    let textTitle = textContainer.children[0].innerText;
    let d = textContainer.children[2].dataset.date
    let t = textContainer.children[3].innerText;
    let i = textContainer.dataset.id;
    let h = textContainer.dataset.hidden;

    folder.texts.unshift({
        title: textTitle,
        text: t,
        date: d,
        id: i,
        hidden: h,
    })

    updateLS();
}

function updateTextInfo(container){
    let textTitle = container.children[0].innerText;
    let t = container.children[3].innerHTML;
    let words = container.children[3].innerText.split(" ");
    let path = container.parentElement.parentElement.parentElement.children[0].dataset.path;
    let folder = getFolder(path);
    let info = getTextInfo(container.dataset.id, folder);

    info.title = textTitle;
    info.text = t;
    info.wordCount = words.length;

    updateLS();
}

function getTextInfo(id, folder){
    for(const text of folder.texts){
        if(id == text.id.toString()) return text;
    }
}

function getLastId(){
    let path = document.querySelector(".header").dataset.path;
    let folder = getFolder(path);
    let lastId = (folder.texts.length > 0) ? parseInt(folder.texts[0].id): 0;

    for(const text of folder.texts){
        let textId = parseInt(text.id)
        lastId = (textId > lastId) ? textId : lastId;
    }

    return lastId + 1;
}

function addFolderToLS(container){
    let path = container.parentElement.parentElement.parentElement.children[0].dataset.path;
    let f = getFolder(path);
    let n = container.children[0].innerText;
    let d = container.children[2].dataset.date;
    let id = parseInt(container.dataset.id);

    let object = {
        name: n,
        date: d,
        folderId: id,
        folder: [],
        texts: [],
        hidden: false,
    };

    f.folder.unshift(object);

    updateLS();
}

function getLastFolderId(f){
    if(f.folder.length == 0) return 0;
    
    let lastId = parseInt(f.folder[0].folderId);
    
    for(const folder of f.folder){
        let folderId = parseInt(folder.folderId);
        lastId = (folderId > lastId) ? folderId : lastId;
    }

    return lastId + 1;
}

function getFolder(path){
    let folder = main;
    for(i = 0; i < path.length; i++){
        for(const f of folder.folder){
            if(f.folderId == path[i]) {
                folder = f;
                break;
            }
        }
    }

    return folder;
}

function getFolderInfo(folder, id){
    for(const f of folder.folder){
        if(f.folderId == id) return f;
    }
}

function updateFolderInfo(e){
    e.stopPropagation();
    
    let container = this.parentElement;
    let t = this.innerText;
    let path = container.dataset.path;
    let folder = getFolder(path); 
    
    folder.name = t;
    updateLS();
}
//#endregion

//#region Add && Delete Text
function createText(title, t, d, id, hidden){
    let counter = document.createElement("div")
    counter.classList.add("wordCount");
    if(hidden) counter.classList.add("hidden");
    num = t.split(" ").length
    w = (num == 1) ? " word" : " words";
    counter.innerText = num + w;

    let text = document.createElement("div");
    text.classList.add("text");
    if(hidden) text.classList.add("hidden");
    text.contentEditable = true;
    text.onfocus = focusParent;
    text.onblur = blurParent;
    text.innerHTML = t;

    let date = document.createElement("div");
    date.contentEditable = false;
    date.classList.add("date");
    date.innerText = (moment().format("YYYY") === d.format("YYYY")) ? d.format("DD MMM") : d.format("DD MMM, YYYY");
    date.dataset.date = d.format("DD MMM YYYY")
    date.style.marginBottom = hidden ? "0%" : "2%";

    let textTitle = document.createElement("h1");
    textTitle.classList.add("textTitle");
    textTitle.contentEditable = true;
    textTitle.onfocus = focusParent;
    textTitle.onblur = blurParent;
    textTitle.innerText = title;

    let icon = document.createElement("i");
    icon.classList.add("fas", "fa-cog");

    let iconSpan = document.createElement("span");
    iconSpan.append(icon);

    let deleteTxt = document.createElement("div");
    deleteTxt.innerText = "Delete";
    deleteTxt.classList.add("option");
    deleteTxt.onclick = triggerDeleteTxt;
    deleteTxt.onanimationend = inOptionsAnim;

    let hideTxt = document.createElement("div");
    hideTxt.innerText = hidden ? "Show" : "Hide";
    hideTxt.classList.add("option");
    hideTxt.onclick = hidden ? triggerShowText : triggerHideTxt;
    hideTxt.onanimationend = inOptionsAnim;

    let optionContainer = document.createElement("div");
    optionContainer.classList.add("optionContainer", "optionSpan");
    optionContainer.append(deleteTxt, hideTxt);

    let cog = document.createElement("div");
    cog.classList.add("cog");
    cog.onclick = displayOptions;
    cog.append(iconSpan, optionContainer);

    let indivTextContainer = document.createElement("div")
    indivTextContainer.classList.add("indivTextContainer");
    indivTextContainer.spellcheck = false;   
    indivTextContainer.dataset.id = id;
    indivTextContainer.onanimationend = deleteText;
    indivTextContainer.onmouseover = function(e){cog.style.opacity = 1;}
    indivTextContainer.onmouseout = function(e){
                                                if(!indivTextContainer.classList.contains("focused")){
                                                    cog.style.opacity = 0;
                                                }}
    indivTextContainer.onclick = function(e){e.stopPropagation()}
    indivTextContainer.append(textTitle, cog, date, text, counter);

    return indivTextContainer;
}

function addText(e){
    e.stopPropagation();
    this.classList.add("fadeButton");

    let textsContainer = this.parentElement.parentElement.querySelector(".textsContainer");
    let container = createText("Add a title :)", "//Write your thoughts", moment(), getLastId(), false);
    let firstText = textsContainer.querySelector(".text")
    
    firstText = (firstText == null) ? undefined : firstText.parentElement;
    
    textsContainer.insertBefore(container, firstText);
    window.getSelection().selectAllChildren(container.children[0]);
}

function triggerDeleteTxt(e){
    e.stopPropagation();
    let parent = this.parentElement.parentElement.parentElement;
    parent.style.animation = `deleteText .7s ease`
}

function deleteText(e){
    e.stopPropagation();
    console.log("si jala este pedo");

    let path = this.parentElement.parentElement.parentElement.children[0].dataset.path;
    let folder = getFolder(path);
    let info = getTextInfo(this.dataset.id, folder);
    
    folder.texts.splice(folder.texts.indexOf(info), 1);
    this.remove();

    updateLS();
}

function endAddAnimation(e){
    e.stopPropagation();

    if(this.classList.contains("folder")) this.onanimationend = deleteFolder;
    else this.onanimationend = deleteText;
}
//#endregion

//#region Add && Delete Folder
function addFolder(e){
    e.stopPropagation();

    let folder = getFolder(this.parentElement.parentElement.parentElement.children[0].dataset.path);
    let textsContainer = this.parentElement.parentElement.querySelector(".textsContainer");
    let container = createFolder(moment(), "Write the folder's name", getLastFolderId(folder), false, [], []);

    textsContainer.insertBefore(container, textsContainer.children[0]);
    window.getSelection().selectAllChildren(container.children[0]);
    addFolderToLS(container);
}

function createFolder(d, title, id, hidden, innerFolders, innerTexts){
    let date = document.createElement("div");
    date.contentEditable = false;
    date.classList.add("date");
    date.innerText = (moment().format("YYYY") === d.format("YYYY")) ? d.format("DD MMM") : d.format("DD MMM, YYYY");
    date.dataset.date = d.format("DD MMM YYYY")
    date.style.marginBottom = hidden ? "0%" : "2%";

    let textTitle = document.createElement("h1");
    textTitle.classList.add("textTitle");
    textTitle.contentEditable = true;
    textTitle.onfocus = focusParent;
    textTitle.onblur = blurParent;
    textTitle.innerText = title;
    textTitle.oninput = updateFolderInfo;

    let icon = document.createElement("i");
    icon.classList.add("fas", "fa-cog");

    let iconSpan = document.createElement("span");
    iconSpan.append(icon);

    let open = document.createElement("div");
    open.innerText = "Open";
    open.classList.add("option");
    open.onclick = openFolder;
    open.onanimationend = inOptionsAnim;

    let deleteTxt = document.createElement("div");
    deleteTxt.innerText = "Delete";
    deleteTxt.classList.add("option");
    deleteTxt.onclick = triggerDeleteTxt;
    deleteTxt.onanimationend = inOptionsAnim;

    let hideTxt = document.createElement("div");
    hideTxt.innerText = hidden ? "Show" : "Hide";
    hideTxt.classList.add("option");
    hideTxt.onclick = hidden ? triggerShowText : triggerHideTxt;
    hideTxt.onanimationend = inOptionsAnim;

    let optionContainer = document.createElement("div");
    optionContainer.classList.add("optionContainer", "optionSpan");
    optionContainer.append(open, deleteTxt, hideTxt);

    let cog = document.createElement("div");
    cog.classList.add("cog");
    cog.onclick = displayOptions;
    cog.append(iconSpan, optionContainer);

    let column1 = document.createElement("div");
    column1.classList.add("folderColumn");

    let column2 = document.createElement("div");
    column2.classList.add("folderColumn");

    addTextsToFolder(column1, column2, innerTexts, innerFolders);
    
    let textInFolderContainer = document.createElement("div");
    textInFolderContainer.classList.add("textInFolderContainer");
    textInFolderContainer.append(column1, column2);

    let indivTextContainer = document.createElement("div")
    indivTextContainer.classList.add("indivTextContainer", "folder");
    indivTextContainer.spellcheck = false;   
    indivTextContainer.dataset.id = id;
    indivTextContainer.dataset.path = document.querySelector(".header").dataset.path + id.toString();
    indivTextContainer.onanimationend = deleteFolder;
    indivTextContainer.onmouseover = function(e){cog.style.opacity = 1;}
    indivTextContainer.onmouseout = function(e){
                                                if(!indivTextContainer.classList.contains("focused")){
                                                    cog.style.opacity = 0;
                                                }}
    indivTextContainer.onclick = function(e){e.stopPropagation()}
    indivTextContainer.append(textTitle, cog, date, textInFolderContainer);

    return indivTextContainer;
}

function addTextsToFolder(col1, col2, texts, folders){
    let counter = 0;

    for(const f of folders){
        let innerFolder = createInnerFolder(f);

        switch(counter % 2){
            case 0: 
                col1.append(innerFolder);
                break;

            case 1: 
                col2.append(innerFolder);
                break;
        }

        counter += 1;
    }

    for(const t of texts){
        let innerText = createInnerText(t) 

        switch(counter % 2){
            case 0: 
                col1.append(innerText);
                break;

            case 1: 
                col2.append(innerText);
                break;
        }

        counter++;
    }

    let f = document.createElement("h2");
    f.innerText = "Add text"
    f.classList.add("folderTitle");
    
    let addButton = document.createElement("div");
    addButton.classList.add("textInFolder", "addTextInFolder");
    addButton.onclick = addTextFromFolder;
    addButton.onanimationend = function(e){
        e.stopPropagation()
    }
    addButton.append(f);

    let lastColumn = (counter % 2 == 0) ? col1 : col2;
    lastColumn.append(addButton);
}

function createInnerFolder(folder){
    let title = document.createElement("h1");
    title.classList.add("textTitle");
    title.innerText = folder.name;
    title.style.fontSize = "1.5em";

    let date = document.createElement("div");
    let mom = moment(folder.date);
    let today = moment();
    date.classList.add("date");
    date.innerText = (today.format("YYYY") == mom.format("YYYY")) ? mom.format("DD MMM") : mom.format("DD MMM, YYYY")

    let f = document.createElement("div");
    f.classList.add("textInFolder");
    f.style.width = "40%";
    f.style.borderBottomRightRadius = "0";
    f.style.borderBottomLeftRadius = "0";
    f.style.marginBottom = "0";
    f.style.margin = '0'
    f.style.padding = "4%";

    let folderHTML = document.createElement("div");
    folderHTML.classList.add("textInFolder");
    folderHTML.append(title, date);
    folderHTML.style.borderTopLeftRadius = "0";

    let container = document.createElement("div");
    container.append(f, folderHTML);

    return container;
}

function createInnerText(text){
    let title = document.createElement("h2");
    title.classList.add("textTitle");
    title.innerText = text.title;    
    title.style.fontSize = "1.5em";

    let date = document.createElement("div");
    let mom = moment(text.date);
    let today = moment();
    date.classList.add("date");
    date.innerText = (today.format("YYYY") == mom.format("YYYY")) ? mom.format("DD MMM") : mom.format("DD MMM, YYYY")
    date.style.marginBottom = "0";

    let folderHTML = document.createElement("div");
    folderHTML.classList.add("textInFolder");
    folderHTML.append(title, date);;

    return folderHTML;
}

function deleteFolder(e){
    e.stopPropagation();

    let path = this.parentElement.parentElement.parentElement.children[0].dataset.path;
    let folderPath = this.dataset.path;
    let folder = getFolder(path);
    let info = getFolder(folderPath);
    
    folder.folder.splice(folder.folder.indexOf(info), 1);
    this.remove();

    updateLS();
}
//#endregion

//#region FolderOptions
function openFolder(e){
    e.stopPropagation();

    let container = this.parentElement.parentElement.parentElement;
    let folder = getFolder(container.dataset.path);
    let textContainer = container.parentElement;
    let path = container.dataset.path;
    let header = container.parentElement.parentElement.parentElement.children[0];
    
    header.dataset.path = path;
    
    removeChildren(textContainer, path)
}

function addTextFromFolder(e){
    e.stopPropagation();

    let container = this.parentElement.parentElement.parentElement;
    let open = container.children[1].children[1].children[0];
    let addText = container.parentElement.parentElement.children[1].children[0];

    open.click();
    addText.click();
}

function openWithoutClick(path){
    path = (path.type) ? this.dataset.path : path;

    let folder = getFolder(path);
    let textContainer = document.querySelector(".mainContainer .textsContainer");
    let header = document.querySelector(".header");

    header.dataset.path = path;

    removeChildren(textContainer, path)
}

function removeChildren(container, path){
    let delay = 5;

    for(const item of container.children){
        if(item == container.lastChild) item.dataset.newPath = path;
        item.onanimationend = endRemoveAnimation;
        item.style.animation = `fadeOut .${delay}s`   
        
        delay++;
    }
}

function endRemoveAnimation(e){
    e.stopPropagation();
    
    if(this == this.parentElement.lastChild){
        let path = this.dataset.newPath;
        let folder = getFolder(path);
        
        this.remove();
        loadLS(folder);
        generatePath(path);
    }
    else this.remove();
}
//#endregion

//#region Focus && Blur
function blurTexts(e){
    e.stopPropagation()
    let focused = document.querySelector(".focused");
    if(focused != null){
        focused.children[0].blur();
        let cog = focused.children[1];
        if(cog.children[1].style.display == "block") cog.click();
        if(!focused.classList.contains("folder")) focused.children[3].blur();
        focused.classList.remove("focused");
    }
}

function focusParent(e){
    e.stopPropagation();
    let parent = this.parentElement;
    let cog = this.parentElement.children[1];
    let path = this.parentElement.parentElement.parentElement.parentElement.children[0].dataset.path;
    let folder = getFolder(path);
    let textInfo = getTextInfo(parent.dataset.id, folder);
    let hidden = (textInfo == undefined) ? false : textInfo.hidden;
    
    parent.classList.add("focused");

    if(this.classList.contains("text")) {
        this.addEventListener('input', wordCount);
        if(!isTextInLS(this.parentElement.dataset.id, path)) window.getSelection().selectAllChildren(this);
    }
    if(cog.children[1].display == "block"){
        cog.click();
    }  
    if(this.classList.contains("textTitle") && hidden){
        cog.children[1].children[1].click();
    }
    
    blurAllExcept(parent);
}

function blurParent(){
    let path = this.parentElement.parentElement.parentElement.parentElement.children[0].dataset.path;

    this.parentElement.classList.remove("focused");
    if(isTextInLS(this.parentElement.dataset.id, path)) updateTextInfo(this.parentElement)

    let cog = this.parentElement.children[1]
    let optionContainer = cog.children[1];

    if(optionContainer.style.display == "block"){
        cog.click();
    }
}

function blurAllExcept(text){
    let focused = document.querySelectorAll(".mainContainer .textsContainer .indivTextContainer");
    
    for(const f of focused){
        if(f != text){
            let options = f.children[1].children[1];

            blurSelected(f);
            if(options.style.display == "block") options.click();
        }
    }
}

function blurSelected(text){
    text.classList.remove("focused");
}

function focusSelected(text){
    text.classList.add("focused");
}
//#endregion

//#region TextOptions 
function displayOptions(e){
    e.stopPropagation();
    let textContainer = this.parentElement;
    let optionContainer = this.children[1];
    let options = optionContainer.children;
    let delay = 0;      

    if(optionContainer.style.display == "block"){
        this.firstChild.style.transform = "none";
        for(i = options.length - 1; i >= 0; i--){
            options[i].style.animation = `fadeOutLeft .5s ease .${delay++}s`;
        }
    }
    else{
        blurAllExcept(textContainer);
        textContainer.classList.add("focused");
        this.firstChild.style.transform = "rotate(720deg)";
        optionContainer.style.display = "block";
        for(const op of options){
            op.style.animation = `fadeInLeft .5s ease .${delay++}s`;
        }
    }
}

function inOptionsAnim(e){
    e.stopPropagation();

    this.style.transform = "translateY(0)";
    this.style.opacity = 1;

    this.onanimationend = outOptionsAnim;
}

function outOptionsAnim(e){
    e.stopPropagation();
    let textElement = this.parentElement.parentElement.parentElement

    this.style.transform = "translateY(100px)"
    this.style.opacity = 0;

    this.onanimationend = inOptionsAnim;

    if(e.target == this.parentElement.firstChild) this.parentElement.style.display = "none";
}

function triggerHideTxt(e){
    e.stopPropagation();

    let cog = this.parentElement.parentElement;
    let textContainer = cog.parentElement;
    let path = textContainer.parentElement.parentElement.parentElement.children[0].dataset.path;
    let folder = getFolder(path);
    let date = textContainer.children[2];
    let text = textContainer.children[3];
    let count = textContainer.children[4];
    let textInfo = getTextInfo(textContainer.dataset.id, folder);
    
    date.style.marginBottom = "0%";

    text.onanimationend = hide;
    count.onanimationend = hide;

    text.style.animation = "hideText .5s";
    count.style.animation = "hideText .5s";

    this.innerText = "Show";
    this.onclick = triggerShowText;

    textInfo.hidden = true;

    textContainer.classList.remove("focused");
    cog.click();
    updateLS()
}

function hide(e){
    e.stopPropagation();
    
    this.style.animation = "";
    this.style.transition = "none";
    this.classList.add("hidden");
}

function triggerShowText(e){
    e.stopPropagation();

    let cog = this.parentElement.parentElement;
    let textContainer = cog.parentElement;
    let path = textContainer.parentElement.parentElement.parentElement.children[0].dataset.path;
    let folder = getFolder(path);
    let date = textContainer.children[2];
    let text = textContainer.children[3];
    let count = textContainer.children[4];
    let textInfo = getTextInfo(textContainer.dataset.id, folder);
    
    date.style.marginBottom = "2%";

    count.style.transition = ".5s";
    text.style.transition = ".5s";

    count.classList.remove("hidden");
    text.classList.remove("hidden")

    this.innerText = "Hide";
    this.onclick = triggerHideTxt;

    textInfo.hidden = false;

    cog.click();
    updateLS();
}
//#endregion

//#region Path
function generatePath(path){
    let currentPath = "";
    let pathContainer = document.querySelector(".mainContainer .path");

    pathContainer.parentElement.style.opacity = "1";
    
    if(path == "0") pathContainer.style.transform = "translateY(-100px)";
    else{
        while(pathContainer.firstChild){
            pathContainer.lastChild.remove();
        }

        for(let i = 0; i < path.length; i++){
            path[i];
            currentPath += path[i];
            let link = createPathLink(currentPath);

            if(i != 0) pathContainer.innerHTML += " > ";

            pathContainer.append(link);
        }

        for(const link of pathContainer.children){
            link.onclick = openWithoutClick;
        }

        pathContainer.style.transform = "none";
    }
}

function createPathLink(path){
    let folder = getFolder(path);

    let link = document.createElement("p");
    link.classList.add("pathLink");
    link.innerText = folder.name;
    link.dataset.path = path;

    return link;
}
//#endregion

function wordCount(e){
    let text = this.innerText;
    let words = (text == '') ? [] : text.split(" ");
    let counter = this.parentElement.querySelector(".wordCount");
    let path = this.parentElement.parentElement.parentElement.parentElement.children[0].dataset.path;

    w = (words.length == 1) ? "word" : "words";
    counter.innerText = words.length + " words";
    
    if(!isTextInLS(this.parentElement.dataset.id, path)) addTextToLS(this.parentElement);
    else if(e.data == " " || e.data == "." || e.data == "?" || e.inputType == "insertByPaste" || e.inputType == "formatBold" || e.inputType == "formatItalic" || e.inputType == "formatUnderline") {
        updateTextInfo(this.parentElement);
    }
}
