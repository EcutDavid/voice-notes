const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
// TODO: inject config at build time when multi envs provisioned.
const auth0Conifg = {
  domain: "davidguan.auth0.com",
  clientId: "luC7PVwEEmjBTCC3HUenRepY5U3Zgrru"
};

function updateAuthUi(auth0) {
  auth0.isAuthenticated().then(authed => {
    loginBtn.disabled = authed;
    logoutBtn.disabled = !authed;
  });
}

createAuth0Client({
  domain: auth0Conifg.domain,
  client_id: auth0Conifg.clientId
}).then(auth0 => {
  updateAuthUi(auth0);
  const pageCur = window.location.origin + window.location.pathname;
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

  const query = window.location.search;
  // Back from the login page.
  if (query.includes("code=") && query.includes("state=")) {
    auth0.handleRedirectCallback().then(() => {
      window.history.replaceState({}, document.title, "/");
      updateAuthUi(auth0);
    });
  }
});
