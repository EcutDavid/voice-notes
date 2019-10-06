const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const noteForm = document.querySelector("#noteForm");
const submitTextBtn = document.querySelector("#submitTextBtn");
const submitTextSpinner = document.querySelector("#submitTextSpinner");
const heading = document.querySelector(".cover-heading");
const titleInput = document.querySelector("#titleInput");
const contentInput = document.querySelector("#contentInput");
const notesContainer = document.querySelector("#notes");
const audio = document.querySelector("audio");
// TODO(inject URL via build tool)
const API_URL_BASE = "http://52.63.221.219:8080";
// const API_URL_BASE = "http://localhost:8080";
const BUCKET_URL = "https://voice-notes-app.s3-ap-southeast-2.amazonaws.com";
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

function setupNoteForm(acc) {
  noteForm.style.display = "block";
  submitTextBtn.addEventListener("click", event => {
    event.preventDefault();
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
      submitTextSpinner.style.display = "none";
    });
  });
  fetch(`${API_URL_BASE}/voice-notes`, {
    headers: {
      ...genHeaders({ acc })
    }
  })
    .then(ret => ret.json())
    .then(notes => {
      notes.forEach(d => {
        const button = document.createElement("button");
        button.innerText = d.name;
        button.className = "btn btn-outline-primary";
        const url = `${BUCKET_URL}/${d.key}`;
        button.addEventListener("click", () => {
          audio.src = url;
          audio.play();
        });
        notesContainer.append(button);
      });
    });
}

// TODO: inject config at build time when multi envs provisioned.
// (and prevent the two copies of config).
const auth0Conifg = {
  domain: "davidguan.auth0.com",
  clientId: "luC7PVwEEmjBTCC3HUenRepY5U3Zgrru",
  audience: "https://davidguan.app/voice-notes-app/api"
};

function updateAuthUi(auth0) {
  auth0.isAuthenticated().then(authed => {
    loginBtn.disabled = authed;
    logoutBtn.disabled = !authed;

    if (authed) {
      auth0.getTokenSilently().then(acc => {
        setupNoteForm(acc);
      });

      auth0.getUser().then(info => {
        if (info.nickname) {
          heading.innerText = `Hello ${info.nickname}`;
        }
      });
    }
  });
}

createAuth0Client({
  domain: auth0Conifg.domain,
  client_id: auth0Conifg.clientId,
  audience: auth0Conifg.audience
}).then(auth0 => {
  updateAuthUi(auth0);
  const pageCur = location.origin + location.pathname;
  loginBtn.addEventListener("click", () => {
    auth0.loginWithRedirect({
      redirect_uri: pageCur
    });
  });

  logoutBtn.addEventListener("click", () => {
    auth0.logout({
      returnTo: pageCur
    });
  });

  const query = location.search;
  // Back from the login page.
  if (query.includes("code=") && query.includes("state=")) {
    auth0.handleRedirectCallback().then(() => {
      history.replaceState(
        {},
        document.title,
        location.origin + location.pathname
      );
      updateAuthUi(auth0);
    });
  }

  // TODO: handle the auth error case(query string would give clue).
});
