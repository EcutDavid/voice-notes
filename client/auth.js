export class AuthClient {
  constructor(auth0Config = AUTH0_CONFIG) {
    this.auth0Config = auth0Config;
    this.auth0Client = undefined;
  }

  init() {
    return createAuth0Client({
      domain: this.auth0Config.domain,
      client_id: this.auth0Config.clientId,
      audience: this.auth0Config.audience
    }).then(auth0Client => {
      this.auth0Client = auth0Client;
      const query = location.search;
      if (query.includes("code=") && query.includes("state=")) {
        return auth0Client.handleRedirectCallback().then(() => {
          history.replaceState(
            {},
            document.title,
            this.getCurrentPage()
          );
        });
      }
      return;
    });
  }

  getCurrentPage() {
    return location.origin + location.pathname;
  }

  login() {
    this.auth0Client.loginWithRedirect({
      redirect_uri: this.getCurrentPage(),
    });
  }

  logout() {
    this.auth0Client.logout({
      returnTo: this.getCurrentPage()
    });
  }

  queryAccToken() {
    return this.auth0Client.getTokenSilently();
  }

  queryIsAuthenticated() {
    return this.auth0Client.isAuthenticated();
  }

  queryNickName() {
    return this.auth0Client.getUser().then(info =>
      info && info.nickname
    );
  }
}
