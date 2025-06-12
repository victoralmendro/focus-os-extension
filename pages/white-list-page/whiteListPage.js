document.addEventListener('DOMContentLoaded', async function() {
    var btnSaveWhitelist = document.getElementById("btn-save-whitelist");
    var btnTestWhitelist = document.getElementById("btn-test-whitelist");
    var btnCancelTestWhitelist = document.getElementById("btn-cancel-test-whitelist");
    var btnCancelSaveWhitelist = document.getElementById("btn-cancel-save-whitelist");
    var btnOpenFrmWhitelist = document.getElementById("btn-open-frm-whitelist");
    var btnOpenFrmWhitelistTest = document.getElementById("btn-open-frm-whitelist-test");
    var frmWhitelistSave = document.getElementById("frm-whitelist-save");
    var frmWhitelistTest = document.getElementById("frm-whitelist-test");
    var elemResultWhitelistTest = document.getElementById("result-whitelist-test");
    var elemResultWhitelistSave = document.getElementById("result-whitelist-save");
    var tbWhitelists = document.getElementById("tb-whitelist");
    var lblTotalWhitelists = document.getElementById("lbl-total-whitelists");
    var elemContainerMainActions = document.getElementById("container-main-actions");
    let draggedRow = null;

    btnOpenFrmWhitelist.addEventListener("click", ()=>{
        openFrmWhitelist(undefined);
    });

    // btnOpenFrmWhitelistTest.addEventListener("click", ()=>{
    //     toggleContainerMainAction(false);
    //     toggleFrmWhitelistTest(true);
    // });
    
    btnSaveWhitelist.addEventListener("click", async ()=>{
        await saveWhitelist();
        loadWhitelists();
    });
    
    // btnTestWhitelist.addEventListener("click", testWhitelist);
    
    // btnCancelTestWhitelist.addEventListener("click", ()=>{
    //     toggleFrmWhitelistTest(false);
    //     toggleContainerMainAction(true);
    //     hideResultWhitelistTestError();
    // });
    
    btnCancelSaveWhitelist.addEventListener("click", ()=>{
        toggleFrmWhitelist(false);
        toggleContainerMainAction(true);
    });

    document.addEventListener("click", async (event)=>{
        if(event.target.type === "button"){
            if(event.target.hasAttribute("data-action")){
                const dataAction = event.target.getAttribute("data-action");
                const dataId = event.target.getAttribute("data-id");

                if(dataAction === "whitelist-delete"){
                    
                    const result = confirm("Are you sure you want to delete this whitelist?");

                    if(result === true){
                        await whitelistDelete(dataId);
                        loadWhitelists();
                        clearFrmSaveWhitelist();
                    }

                    return;
                }

                if(dataAction === "whitelist-edit"){
                    openFrmWhitelist();

                    const result = await WhiteListService.list({id: dataId});

                    if(result.length > 0){
                        fillFrmWhitelist(result[0]);
                    }

                    return;
                }

                if(dataAction == "whitelist-test"){
                    const value = event.target.getAttribute("data-value");
                    
                    toggleFrmWhitelistTest(true);
                    fillFrmWhitelistTest("", value);
                }

                return;
            }
        }
    });
    
    async function saveWhitelist(){
        // clearResultTestWhitelist();
    
        var formData = new FormData(frmWhitelistSave);
        const data = Object.fromEntries(formData.entries());
        
        if(data.rule == ""){
            return;
        }

        const rule = RegexUtils.escapeStringForRegex(data.rule);
    
        const result = await WhiteListService.save(data.id, rule, true);
        if(result.status === "0"){
            showResultWhitelistSaveError(result.message);
        }else{
            hideResultWhitelistSaveError();
            clearFrmSaveWhitelist();
        }
    }

    async function showResultWhitelistSaveError(message){
        elemResultWhitelistSave.innerText = message;
        elemResultWhitelistSave.style.color = "red";
        elemResultWhitelistSave.classList.remove("hidden");
    }

    async function hideResultWhitelistSaveError(){
        elemResultWhitelistSave.innerText = "";
        elemResultWhitelistSave.style.color = "";
        elemResultWhitelistSave.classList.add("hidden");
    }

    // async function showResultWhitelistTestError(message){
    //     elemResultWhitelistTest.innerText = message;
    //     elemResultWhitelistTest.style.color = "red";
    //     elemResultWhitelistTest.classList.remove("hidden");
    // }

    // async function hideResultWhitelistTestError(){
    //     elemResultWhitelistTest.innerText = "";
    //     elemResultWhitelistTest.style.color = "";
    //     elemResultWhitelistTest.classList.add("hidden");
    // }
    
    async function testWhitelist(){
        var formData = new FormData(frmWhitelistTest);
        const data = Object.fromEntries(formData.entries());
    
        const success = new RegExp(data.whitelist, "gm").test(data.url);

        if(success){
            showResultWhitelistTestError("This URL will be blocked")
        }else{
            showResultWhitelistTestError("This URL won't be blocked by this whitelist")
        }
    }
    
    // function clearResultTestWhitelist(){
    //     elemResultWhitelistTest.innerText = "";
    //     elemResultWhitelistTest.classList.add("hidden");
    // }

    async function loadWhitelists(){
        const tbody = tbWhitelists.getElementsByTagName("tbody")[0];
        tbody.innerHTML = "";

        const result = await WhiteListService.list();
        
        if(result.length == 0){
            return;
        }

        result.forEach(dbWhitelist => {
            const tr = document.createElement("tr");
            tr.setAttribute("data-id", dbWhitelist.id);
            tr.setAttribute("draggable", true);
            
            let td = document.createElement("td");
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = dbWhitelist.isActive;
            checkbox.disabled = true;
            td.appendChild(checkbox);
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerText = dbWhitelist.rule;
            tr.appendChild(td);

            td = document.createElement("td");
            let btnDelete = document.createElement("button");
            btnDelete.type = "button";
            btnDelete.innerText = "X";
            btnDelete.setAttribute("data-action", "whitelist-delete");
            btnDelete.setAttribute("data-id", dbWhitelist.id);
            td.appendChild(btnDelete);

            let btnEdit = document.createElement("button");
            btnEdit.type = "button";
            btnEdit.innerText = "E";
            btnEdit.setAttribute("data-action", "whitelist-edit");
            btnEdit.setAttribute("data-id", dbWhitelist.id);
            td.appendChild(btnEdit);

            let btnTest = document.createElement("button");
            btnTest.type = "button";
            btnTest.innerText = "T";
            btnTest.setAttribute("data-action", "whitelist-test");
            btnTest.setAttribute("data-value", dbWhitelist.whitelist);
            td.appendChild(btnTest);
            
            tr.appendChild(td);

            tbody.appendChild(tr);
        });

        lblTotalWhitelists.innerText = result.length;
    }

    async function whitelistDelete(whitelistId){
        const result = await WhiteListService.delete(whitelistId);

        if(result.status == 0){
            alert(result.message);
        }
    }

    function toggleFrmWhitelist(show){
        if(show){
            frmWhitelistSave.classList.remove("hidden");
        }else{
            frmWhitelistSave.classList.add("hidden");
        
            clearFrmSaveWhitelist();

            hideResultWhitelistSaveError();
        }
    }

    function clearFrmSaveWhitelist(){
        const inpRule = frmWhitelistSave.querySelector("input[name='rule']");
        inpRule.value = "";

        const inpId = frmWhitelistSave.querySelector("input[name='id']");
        inpId.value = "";
    }

    function toggleContainerMainAction(show){
        if(show){
            elemContainerMainActions.classList.remove("hidden");
        }else{
            elemContainerMainActions.classList.add("hidden");
        }
    }

    // function toggleFrmWhitelistTest(show){
    //     if(show){
    //         frmWhitelistTest.classList.remove("hidden");
    //     }else{
    //         frmWhitelistTest.classList.add("hidden");

    //         const inpUrl = frmWhitelistTest.querySelector("input[name='url']");
    //         inpUrl.value = "";

    //         const inpWhitelist = frmWhitelistTest.querySelector("input[name='whitelist']");
    //         inpWhitelist.value = "";
    //     }
    // }

    function openFrmWhitelist(whitelist){
        toggleContainerMainAction(false);
        toggleFrmWhitelist(true);

        if(whitelist){
            const inpWhitelist = frmWhitelistSave.querySelector("input[name='whitelist']");
            inpWhitelist.value = whitelist;
        }
    }

    function fillFrmWhitelist(dbWhitelist){
        const inpId = frmWhitelistSave.querySelector("input[name='id']");
        inpId.value = dbWhitelist.id;

        const inpRule = frmWhitelistSave.querySelector("input[name='rule']");
        inpRule.value = RegexUtils.unscapeStringForRegex(dbWhitelist.rule);
    }

    function fillFrmWhitelistTest(url, whitelist){
        const inpUrl = frmWhitelistTest.querySelector("input[name='url']");
        inpUrl.value = url;

        const inpWhitelist = frmWhitelistTest.querySelector("input[name='whitelist']");
        inpWhitelist.value = whitelist;
    }

    loadWhitelists();
});