import { AuthClient }  from "./auth.js";
import messages from "./messages.js";
import "./main.css";

const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const noteForm = document.querySelector("#noteForm");
const submitTextBtn = document.querySelector("#submitTextBtn");
const submitTextSpinner = document.querySelector("#submitTextSpinner");
const heading = document.querySelector(".cover-heading h2");
const homeTabLink = document.querySelector("#homeTabLink");
const homeTabTextPrompt = document.querySelector("#homeTabTextPrompt");
const titleInput = document.querySelector("#titleInput");
const contentInput = document.querySelector("#contentInput");
const notesContainer = document.querySelector("#notes");
const notesSpinner = document.querySelector("#notesSpinner");
const audio = document.querySelector("audio");

const tabKeys = ["homeTab", "noteSubmitTab"];
let activeTabContent = document.querySelector("#homeTabContent");
let activeTabLink = document.querySelector("#homeTabLink");
function setupTabs() {
  for (const tab of tabKeys) {
    const link = document.querySelector(`#${tab}Link`);
    const content = document.querySelector(`#${tab}Content`);
    link.addEventListener("click", () => {
      activeTabContent.style.display = "none";
      activeTabContent = content;
      activeTabContent.style.display = "block";

      activeTabLink.classList.remove("active");
      activeTabLink = link;
      activeTabLink.classList.add("active");
    });
  }
}
setupTabs();

function genHeaders({ acc }) {
  const headers = {};
  if (acc) {
    headers["Authorization"] = `Bearer ${acc}`;
  }
  return headers;
}

function submitNote(acc, noteSet) {
  const title = titleInput.value;
  const content = contentInput.value;
  const postBody = JSON.stringify({ title, content });
  submitTextSpinner.style.display = "inline-block";
  submitTextBtn.style.display = "none";
  fetch(`${API_URL_BASE}/voice-notes`, {
    method: "POST",
    headers: {
      ...genHeaders({ acc }),
      "Content-Type": "application/json"
    },
    body: postBody
  }).then(() => {
    submitTextBtn.style.display = "inline-block";
    titleInput.value = "";
    contentInput.value = "";
    submitTextSpinner.style.display = "none";
    updateMainTabContent(acc, noteSet)
  });
}

function forceHomeTab() {
  notesContainer.style.display = "none";
  homeTabLink.click();
  for (const tab of tabKeys) {
    const link = document.querySelector(`#${tab}Link`);
    link.style.visibility = "hidden";
  }
}

function updateMainTabContent(acc, noteSet) {
  if (location.search.includes("error=")) {
    notesSpinner.style.display = "none";
    homeTabTextPrompt.innerText = messages.errorCodePrompt();
    forceHomeTab();
    return;
  }
  fetch(`${API_URL_BASE}/voice-notes`, {
    headers: {
      ...genHeaders({ acc })
    }
  })
    .then(ret => {
      if (ret.status != 200) {
        notesSpinner.style.display = "none";
        homeTabTextPrompt.innerText = messages.apiWhiteListPrompt();
        forceHomeTab();
      }
      return ret.json();
    })
    .then(ret => {
      if (!Array.isArray(ret)) {
        return;
      }
      notesSpinner.style.display = "none";
      if (ret.length == 0) {
        homeTabTextPrompt.innerText = messages.nonNotePrompt();
        return;
      }
      audio.style.display = "block";
      ret.forEach(d => {
        if (noteSet.has(d.key)) return;
        noteSet.add(d.key);
        const button = document.createElement("button");
        button.innerText = d.name;
        button.className = "btn btn-outline-primary note";
        const url = `${S3_BUCKET_URL}/${d.key}`;
        button.addEventListener("click", () => {
          audio.src = url;
          audio.play();
        });
        notesContainer.append(button);
      });
    })
    .catch(e => {
      notesSpinner.style.display = "none";
      throw e;
    });
}

function setupNoteForm(acc) {
  const noteSet = new Set();
  noteForm.style.display = "block";
  notesSpinner.style.display = "block";
  submitTextBtn.addEventListener("click", event => {
    event.preventDefault();
    submitNote(acc, noteSet);
  });

  updateMainTabContent(acc, noteSet);
}

const authClient = new AuthClient();
function updateUi(authClient) {
  authClient.queryIsAuthenticated().then(authed => {
    loginBtn.disabled = authed;
    logoutBtn.disabled = !authed;

    if (!authed) {
      return;
    }
    authClient.queryAccToken().then(acc => {
      setupNoteForm(acc);
    });

    authClient.queryNickName().then(nickname => {
      if (!nickname) return;
      heading.innerText = messages.welcome(nickname);
    });
  });
}
authClient.init().then(() => {
  updateUi(authClient);
  loginBtn.addEventListener("click", () => {
    authClient.login();
  });

  logoutBtn.addEventListener("click", () => {
    authClient.logout();
  });
});
