let rulesPageState = {
    rules: []
};

document.addEventListener('DOMContentLoaded', async function () {
    var btnSaveRule = document.getElementById("btn-save-rule");
    var btnTestRule = document.getElementById("btn-test-rule");
    var btnCancelTestRule = document.getElementById("btn-cancel-test-rule");
    var btnCancelSaveRule = document.getElementById("btn-cancel-save-rule");
    var btnOpenFrmRule = document.getElementById("btn-open-frm-rule");
    var btnOpenFrmRuleTest = document.getElementById("btn-open-frm-rule-test");
    var frmRuleSave = document.getElementById("frm-rule-save");
    var frmRuleTest = document.getElementById("frm-rule-test");
    var elemResultRuleTest = document.getElementById("result-rule-test");
    var elemResultRuleSave = document.getElementById("result-rule-save");
    var tbRules = document.getElementById("tb-rules");
    var lblTotalRules = document.getElementById("lbl-total-rules");
    var elemContainerMainActions = document.getElementById("container-main-actions");
    let draggedRow = null;

    configureDraggableTable();

    btnOpenFrmRule.addEventListener("click", () => {
        openFrmRule(undefined);
    });

    btnOpenFrmRuleTest.addEventListener("click", () => {
        toggleContainerMainAction(false);
        toggleFrmRuleTest(true);
    });

    btnSaveRule.addEventListener("click", async () => {
        await saveRule();
        loadRules();
    });

    btnTestRule.addEventListener("click", testRule);

    btnCancelTestRule.addEventListener("click", () => {
        toggleFrmRuleTest(false);
        toggleContainerMainAction(true);
        hideResultRuleTestError();
    });

    btnCancelSaveRule.addEventListener("click", () => {
        toggleFrmRule(false);
        toggleContainerMainAction(true);
    });

    document.addEventListener("click", async (event) => {
        if (event.target.type === "button") {
            if (event.target.hasAttribute("data-action")) {
                const dataAction = event.target.getAttribute("data-action");
                const dataId = event.target.getAttribute("data-id");

                if (dataAction === "rule-delete") {

                    const result = confirm("Are you sure you want to delete this rule?");

                    if (result === true) {
                        await ruleDelete(dataId);
                        loadRules();
                        clearFrmSaveRule();
                    }

                    return;
                }

                if (dataAction === "rule-edit") {
                    openFrmRule();

                    const result = await RulesService.list({ id: dataId });

                    if (result.length > 0) {
                        fillFrmRule(result[0]);
                    }

                    return;
                }

                if (dataAction == "rule-test") {
                    const value = event.target.getAttribute("data-value");

                    toggleFrmRuleTest(true);
                    fillFrmRuleTest("", value);
                }

                return;
            }
        }
    });

    async function saveRule() {
        clearResultTestRule();

        var formData = new FormData(frmRuleSave);
        const data = Object.fromEntries(formData.entries());

        if (data.maxUsageHour == "" || data.maxUsageMin == "" || data.maxUsageSec == "") {
            return;
        }

        if (data.rule == "") {
            return;
        }

        const rule = RegexUtils.escapeStringForRegex(data.rule);

        const result = await RulesService.save(data.id, rule, TimeUtils.timeToSeconds(data.maxUsageHour, data.maxUsageMin, data.maxUsageSec), true);
        if (result.status === "0") {
            showResultRuleSaveError(result.message);
        } else {
            hideResultRuleSaveError();
            clearFrmSaveRule();
        }
    }

    async function showResultRuleSaveError(message) {
        elemResultRuleSave.innerText = message;
        elemResultRuleSave.style.color = "red";
        elemResultRuleSave.classList.remove("hidden");
    }

    async function hideResultRuleSaveError() {
        elemResultRuleSave.innerText = "";
        elemResultRuleSave.style.color = "";
        elemResultRuleSave.classList.add("hidden");
    }

    async function showResultRuleTestError(message) {
        elemResultRuleTest.innerText = message;
        elemResultRuleTest.style.color = "red";
        elemResultRuleTest.classList.remove("hidden");
    }

    async function hideResultRuleTestError() {
        elemResultRuleTest.innerText = "";
        elemResultRuleTest.style.color = "";
        elemResultRuleTest.classList.add("hidden");
    }

    async function testRule() {
        var formData = new FormData(frmRuleTest);
        const data = Object.fromEntries(formData.entries());

        const rule = RegexUtils.escapeStringForRegex(data.rule);

        const success = new RegExp(rule, "gm").test(data.url);

        if (success) {
            showResultRuleTestError("This URL will be blocked")
        } else {
            showResultRuleTestError("This URL won't be blocked by this rule")
        }
    }

    function clearResultTestRule() {
        elemResultRuleTest.innerText = "";
        elemResultRuleTest.classList.add("hidden");
    }

    async function loadRules() {
        const tbody = tbRules.getElementsByTagName("tbody")[0];
        tbody.innerHTML = "";

        const result = await RulesService.list([], "order", "asc");

        rulesPageState.rules = result;

        if (result.length == 0) {
            return;
        }

        result.forEach(dbRule => {
            const tr = document.createElement("tr");
            tr.setAttribute("data-id", dbRule.id);
            tr.setAttribute("draggable", true);

            let td = document.createElement("td");
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("checkbox");
            checkbox.checked = dbRule.isActive;
            checkbox.disabled = true;
            td.appendChild(checkbox);
            tr.appendChild(td);

            td = document.createElement("td");
            td.innerText = dbRule.rule;
            tr.appendChild(td);

            const timeMaxDailyUsage = TimeUtils.secondsToTime(dbRule.maxDailyUsageTimeSeconds);
            const hours = timeMaxDailyUsage.hours < 10 ? `0${timeMaxDailyUsage.hours}` : timeMaxDailyUsage.hours;
            const minutes = timeMaxDailyUsage.minutes < 10 ? `0${timeMaxDailyUsage.minutes}` : timeMaxDailyUsage.minutes;
            const seconds = timeMaxDailyUsage.seconds < 10 ? `0${timeMaxDailyUsage.seconds}` : timeMaxDailyUsage.seconds;

            td = document.createElement("td");
            td.innerText = `${hours}:${minutes}:${seconds}`;
            tr.appendChild(td);

            td = document.createElement("td");
            let group = document.createElement("div");
            group.classList.add("button-group");
            td.appendChild(group);

            let btnDelete = document.createElement("button");
            btnDelete.type = "button";
            btnDelete.innerText = "X";
            btnDelete.classList.add("button");
            btnDelete.setAttribute("data-action", "rule-delete");
            btnDelete.setAttribute("data-id", dbRule.id);
            btnDelete.setAttribute("title", "delete rule");
            group.appendChild(btnDelete);

            let btnEdit = document.createElement("button");
            btnEdit.type = "button";
            btnEdit.innerText = "E";
            btnEdit.classList.add("button");
            btnEdit.setAttribute("data-action", "rule-edit");
            btnEdit.setAttribute("data-id", dbRule.id);
            btnEdit.setAttribute("title", "edit rule");
            group.appendChild(btnEdit);

            let btnTest = document.createElement("button");
            btnTest.type = "button";
            btnTest.innerText = "T";
            btnTest.classList.add("button");
            btnTest.setAttribute("data-action", "rule-test");
            btnTest.setAttribute("data-value", dbRule.rule);
            btnTest.setAttribute("title", "test rule");
            group.appendChild(btnTest);

            tr.appendChild(td);

            tbody.appendChild(tr);
        });

        lblTotalRules.innerText = result.length;
    }

    async function ruleDelete(ruleId) {
        const result = await RulesService.delete(ruleId);

        if (result.status == 0) {
            alert(result.message);
        }
    }

    function toggleFrmRule(show) {
        if (show) {
            frmRuleSave.classList.remove("hidden");
        } else {
            frmRuleSave.classList.add("hidden");

            clearFrmSaveRule();

            hideResultRuleSaveError();
        }
    }

    function clearFrmSaveRule() {
        const inpRule = frmRuleSave.querySelector("input[name='rule']");
        inpRule.value = "";

        const inpId = frmRuleSave.querySelector("input[name='id']");
        inpId.value = "";

        const maxUsageHour = frmRuleSave.querySelector("input[name='maxUsageHour']");
        maxUsageHour.value = "";

        const maxUsageMin = frmRuleSave.querySelector("input[name='maxUsageMin']");
        maxUsageMin.value = "";

        const maxUsageSec = frmRuleSave.querySelector("input[name='maxUsageSec']");
        maxUsageSec.value = "";
    }

    function toggleContainerMainAction(show) {
        if (show) {
            elemContainerMainActions.classList.remove("hidden");
        } else {
            elemContainerMainActions.classList.add("hidden");
        }
    }

    function toggleFrmRuleTest(show) {
        if (show) {
            frmRuleTest.classList.remove("hidden");
        } else {
            frmRuleTest.classList.add("hidden");

            const inpUrl = frmRuleTest.querySelector("input[name='url']");
            inpUrl.value = "";

            const inpRule = frmRuleTest.querySelector("input[name='rule']");
            inpRule.value = "";
        }
    }

    function openFrmRule(rule) {
        toggleContainerMainAction(false);
        toggleFrmRule(true);

        if (rule) {
            const inpRule = frmRuleSave.querySelector("input[name='rule']");
            inpRule.value = rule;
        }
    }

    function fillFrmRule(dbRule) {
        const inpId = frmRuleSave.querySelector("input[name='id']");
        inpId.value = dbRule.id;

        const inpRule = frmRuleSave.querySelector("input[name='rule']");
        inpRule.value = RegexUtils.unscapeStringForRegex(dbRule.rule);

        const time = TimeUtils.secondsToTime(dbRule.maxDailyUsageTimeSeconds);

        const inpMaxUsageHour = frmRuleSave.querySelector("input[name='maxUsageHour']");
        inpMaxUsageHour.value = time.hours;

        const inpMaxUsageMin = frmRuleSave.querySelector("input[name='maxUsageMin']");
        inpMaxUsageMin.value = time.minutes;

        const inpMaxUsageSec = frmRuleSave.querySelector("input[name='maxUsageSec']");
        inpMaxUsageSec.value = time.seconds;
    }

    function fillFrmRuleTest(url, rule) {
        const inpUrl = frmRuleTest.querySelector("input[name='url']");
        inpUrl.value = url;

        const inpRule = frmRuleTest.querySelector("input[name='rule']");
        inpRule.value = rule;
    }

    function configureDraggableTable() {
        const tbody = tbRules.querySelector('tbody');
        tbody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('dragstart', (e) => {
                draggedRow = row;
                setTimeout(() => {
                    row.classList.add('dragging');
                }, 0);
            });

            row.addEventListener('dragend', () => {
                setTimeout(() => {
                    row.classList.remove('dragging');
                    draggedRow = null;

                    updateRulesOrderFromTable();
                }, 0);
            });

            row.addEventListener('dragover', (e) => {
                e.preventDefault();
                const targetRow = getDragAfterElement(tbody, e.clientY);

                if (targetRow === null) {
                    tbody.appendChild(draggedRow);
                } else {
                    tbody.insertBefore(draggedRow, targetRow);
                }
            });
        });
    }

    function getDragAfterElement(container, y) {
        const rows = [...container.querySelectorAll('tr:not(.dragging)')];

        return rows.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async function updateRulesOrderFromTable() {
        const tbody = tbRules.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.forEach((row, index) => {
            const id = row.getAttribute('data-id');
            const rule = rulesPageState.rules.find(r => r.id == id);
            if (rule) {
                rule.order = index;
            }
        });

        const result = await RulesService.updateMany(rulesPageState.rules);
    }

    loadRules().then(() => {
        configureDraggableTable();
    });
});