const seed = {
  missing: [
    { id: "MP-2026-014", name: "Ananya Rao", age: 24, last: "Vijayawada", date: "2026-10-18", status: "Open" },
    { id: "MP-2026-021", name: "Rohan Varma", age: 31, last: "Guntur", date: "2026-10-29", status: "Open" },
    { id: "MP-2026-026", name: "Meera Das", age: 27, last: "Eluru", date: "2026-11-03", status: "Under review" }
  ],
  cases: [
    { id: "UP-2026-008", place: "National Highway outskirts, Eluru", date: "2026-11-05", age: "25–35", status: "Pending review" },
    { id: "UP-2026-011", place: "Railway station area, Vijayawada", date: "2026-11-09", age: "20–30", status: "Pending review" }
  ],
  matches: [
    { id: "LEAD-001", mp: "MP-2026-026", up: "UP-2026-008", score: 82, reason: "Illustrative age-range and nearby-location overlap", status: "Pending" },
    { id: "LEAD-002", mp: "MP-2026-014", up: "UP-2026-011", score: 74, reason: "Illustrative age-range and regional overlap", status: "Pending" }
  ],
  reviews: [
    { lead: "LEAD-001", type: "Record consistency review", assignee: "Forensic desk", status: "Pending" },
    { lead: "LEAD-002", type: "Case detail review", assignee: "Forensic desk", status: "Pending" }
  ],
  notifications: [],
  activity: [
    { title: "Demo workspace initialized", detail: "Fictional training records loaded", time: "Today · 09:00" },
    { title: "Two possible leads generated", detail: "Illustrative metadata comparison only", time: "Today · 09:02" },
    { title: "Review queue created", detail: "Human review required before any conclusion", time: "Today · 09:03" }
  ]
};

let data;
let role = "Police Officer";
let formType = "";

function load() {
  try {
    data = JSON.parse(localStorage.getItem("tli_data")) || structuredClone(seed);
  } catch (error) {
    data = JSON.parse(JSON.stringify(seed));
  }
}

function persist() {
  localStorage.setItem("tli_data", JSON.stringify(data));
  updateStats();
}

function setRole(selectedRole) {
  document.getElementById("loginRole").value = selectedRole;
}

function login() {
  if (document.getElementById("loginCode").value !== "IDENTITY2026") {
    toast("Enter the demo access code: IDENTITY2026");
    return;
  }

  role = document.getElementById("loginRole").value;
  load();
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("userRole").textContent = role;
  log("Signed in", role + " opened the demo workspace");
  renderAll();
}

function logout() {
  document.getElementById("app").style.display = "none";
  document.getElementById("login").style.display = "grid";
}

function log(title, detail) {
  data.activity.unshift({
    title,
    detail,
    time: new Date().toLocaleString()
  });
  data.activity = data.activity.slice(0, 30);
  persist();
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.remove("hidden");
  window.setTimeout(() => el.classList.add("hidden"), 2600);
}

document.querySelectorAll(".nav button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav button").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.getElementById("page-" + button.dataset.page).classList.add("active");

    const title = {
      dashboard: "Command Overview",
      missing: "Missing Persons Registry",
      unidentified: "Unidentified Cases",
      matches: "Possible Match Leads",
      review: "Forensic Review Queue",
      notifications: "Family Notifications",
      activity: "System Activity Log"
    }[button.dataset.page];

    document.getElementById("pageTitle").textContent = title;
    document.getElementById("crumb").textContent = title.toUpperCase();
  });
});

function updateStats() {
  if (!data) return;
  document.getElementById("statMissing").textContent = data.missing.length;
  document.getElementById("statCases").textContent = data.cases.length;
  document.getElementById("statMatches").textContent = data.matches.length;
  document.getElementById("statReviews").textContent = data.reviews.filter(item => item.status === "Pending").length;
}

function renderMissing() {
  const query = (document.getElementById("missingSearch")?.value || "").toLowerCase();
  const rows = data.missing
    .filter(item => Object.values(item).join(" ").toLowerCase().includes(query))
    .map(item => `
      <tr>
        <td>${item.id}</td>
        <td><b>${item.name}</b></td>
        <td>${item.age}</td>
        <td>${item.last}<br><span style="color:var(--muted)">${item.date}</span></td>
        <td><span class="tag">${item.status}</span></td>
        <td><button class="btn ghost small" onclick="viewRecord('${item.id}')">View</button></td>
      </tr>`);
  document.getElementById("missingRows").innerHTML = rows.join("") || '<tr><td colspan="6" class="empty">No records found</td></tr>';
}

function renderCases() {
  const query = (document.getElementById("caseSearch")?.value || "").toLowerCase();
  const rows = data.cases
    .filter(item => Object.values(item).join(" ").toLowerCase().includes(query))
    .map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${item.place}</td>
        <td>${item.date}</td>
        <td>${item.age}</td>
        <td><span class="tag amber">${item.status}</span></td>
        <td><button class="btn ghost small" onclick="viewRecord('${item.id}')">View</button></td>
      </tr>`);
  document.getElementById("caseRows").innerHTML = rows.join("") || '<tr><td colspan="6" class="empty">No records found</td></tr>';
}

function renderMatches() {
  document.getElementById("matchCards").innerHTML = data.matches.map(match => `
    <div class="record">
      <div class="record-top"><span class="tag amber">${match.id}</span><span class="match-score">${match.score}%</span></div>
      <div class="bar"><span style="width:${match.score}%"></span></div>
      <p><b>Missing record:</b> ${match.mp}</p>
      <p><b>Unidentified case:</b> ${match.up}</p>
      <p>${match.reason}</p>
      <p>Status: <span class="tag">${match.status}</span></p>
      <button class="btn small" onclick="reviewLead('${match.id}')">Send to review</button>
    </div>`).join("") || '<div class="empty">No leads available</div>';
}

function renderReviews() {
  document.getElementById("reviewRows").innerHTML = data.reviews.map((review, index) => `
    <tr>
      <td>${review.lead}</td>
      <td>${review.type}</td>
      <td>${review.assignee}</td>
      <td><span class="tag ${review.status === "Completed" ? "" : "amber"}">${review.status}</span></td>
      <td>${review.status === "Pending" ? `<button class="btn small" onclick="completeReview(${index})">Mark reviewed</button>` : "Reviewed"}</td>
    </tr>`).join("") || '<tr><td colspan="5" class="empty">No reviews in queue</td></tr>';
}

function renderNotifications() {
  document.getElementById("notificationRows").innerHTML = data.notifications.map(notification => `
    <tr>
      <td>${notification.ref}</td>
      <td>${notification.case}</td>
      <td>${notification.channel}</td>
      <td>${notification.by}</td>
      <td><span class="tag">${notification.status}</span></td>
    </tr>`).join("") || '<tr><td colspan="5" class="empty">No notification records yet</td></tr>';
}

function renderActivity() {
  const html = data.activity.map(item =>
    `<div class="activity-item"><strong>${item.title}</strong><small>${item.detail} · ${item.time}</small></div>`
  ).join("");
  document.getElementById("dashActivity").innerHTML = html.slice(0, 1200);
  document.getElementById("allActivity").innerHTML = html;
}

function renderAll() {
  updateStats();
  renderMissing();
  renderCases();
  renderMatches();
  renderReviews();
  renderNotifications();
  renderActivity();
}

function viewRecord(id) {
  const record = [...data.missing, ...data.cases].find(item => item.id === id);
  if (record) {
    toast(Object.entries(record).map(([key, value]) => key + ": " + value).join(" · "));
  }
}

function reviewLead(id) {
  if (!data.reviews.some(review => review.lead === id)) {
    data.reviews.push({ lead: id, type: "Metadata consistency review", assignee: "Forensic desk", status: "Pending" });
    log("Lead assigned for review", id);
    renderAll();
    toast("Lead added to the human review queue");
  } else {
    toast("This lead is already in the review queue");
  }
}

function completeReview(index) {
  if (role !== "Forensic Expert" && role !== "System Administrator") {
    toast("Only the Forensic Expert or Administrator role can complete a review.");
    return;
  }
  data.reviews[index].status = "Completed";
  log("Review status updated", data.reviews[index].lead + " marked reviewed (demo only)");
  renderAll();
  toast("Review status updated");
}

function showForm(type) {
  formType = type;
  let fields;

  if (type === "missing") {
    fields = [["Person name", "name", "text"], ["Age", "age", "number"], ["Last seen location", "last", "text"], ["Date last seen", "date", "date"]];
  } else if (type === "case") {
    fields = [["Case reference", "id", "text"], ["Found location", "place", "text"], ["Date found", "date", "date"], ["Estimated age range", "age", "text"]];
  } else {
    fields = [["Reference ID", "ref", "text"], ["Case reference", "case", "text"], ["Channel", "channel", "select"], ["Status", "status", "select"]];
  }

  document.getElementById("modalTitle").textContent =
    type === "missing" ? "Add Missing Person" :
    type === "case" ? "Add Unidentified Case" :
    "Log Family Notification";

  document.getElementById("formFields").innerHTML = fields.map((field, index) => `
    <div class="${index === fields.length - 1 ? "full" : ""}">
      <label>${field[0]}</label>
      ${field[2] === "select"
        ? `<select name="${field[1]}">${(field[1] === "channel"
            ? ["Phone", "In-person", "Official letter"]
            : ["Pending", "Recorded after official confirmation"]
          ).map(value => `<option>${value}</option>`).join("")}</select>`
        : `<input required name="${field[1]}" type="${field[2]}">`}
    </div>`).join("");

  document.getElementById("modal").classList.remove("hidden");
}

function closeForm() {
  document.getElementById("modal").classList.add("hidden");
}

function saveForm(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.target));

  if (formType === "missing") {
    values.id = "MP-DEMO-" + String(Date.now()).slice(-5);
    values.status = "Open";
    data.missing.unshift(values);
    log("Missing person record added", values.id);
  } else if (formType === "case") {
    if (data.cases.some(item => item.id === values.id)) {
      toast("That case ID already exists.");
      return;
    }
    values.status = "Pending review";
    data.cases.unshift(values);
    log("Unidentified case added", values.id);
  } else {
    values.by = role;
    data.notifications.unshift(values);
    log("Notification record logged", values.ref);
  }

  persist();
  closeForm();
  renderAll();
  toast("Record saved in this browser");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

load();
