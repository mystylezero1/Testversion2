document.addEventListener("DOMContentLoaded", () => {
  initAdminEvents();
  initTabSwitching();
});

function initTabSwitching() {
  const tabGaesteBtn = document.getElementById("tabGaesteBtn");
  const tabAddBtn = document.getElementById("tabAddBtn");
  const tabActionsBtn = document.getElementById("tabActionsBtn");

  const gaesteTab = document.getElementById("gaesteTab");
  const addGastTab = document.getElementById("addGastTab");
  const actionsTab = document.getElementById("actionsTab");

  function setTab(activeBtn, activeTab) {
    [tabGaesteBtn, tabAddBtn, tabActionsBtn].forEach(b => b?.classList.remove("active"));
    [gaesteTab, addGastTab, actionsTab].forEach(t => t?.classList.add("hidden"));

    activeBtn?.classList.add("active");
    activeTab?.classList.remove("hidden");
  }

  if (tabGaesteBtn) tabGaesteBtn.onclick = () => setTab(tabGaesteBtn, gaesteTab);
  if (tabAddBtn) tabAddBtn.onclick = () => setTab(tabAddBtn, addGastTab);
  if (tabActionsBtn) tabActionsBtn.onclick = () => setTab(tabActionsBtn, actionsTab);
}
