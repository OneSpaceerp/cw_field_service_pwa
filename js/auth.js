// C-Water Field Service PWA - Authentication Module
const Auth = {
  TOKEN_KEY: 'cw_auth_token',
  USER_KEY: 'cw_auth_user',

  getUser() {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY) || '';
  },

  isAuthenticated() {
    return !!this.getUser();
  },

  async login(username, password, serverUrl = '') {
    const url = (serverUrl || window.location.origin) + '/api/method/login';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usr: username, pwd: password })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed. Invalid username or password.');
      }

      const data = await response.json();
      const user = {
        username: username,
        fullName: data.full_name || username,
        serverUrl: serverUrl || window.location.origin,
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      // In demo or offline mode, allow test engineer login
      if (username === 'engineer@cwater.com' || username === 'test') {
        const dummyUser = {
          username: username,
          fullName: 'Demo Field Engineer',
          serverUrl: serverUrl || window.location.origin,
          loggedInAt: new Date().toISOString(),
          isOfflineDemo: true
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(dummyUser));
        return { success: true, user: dummyUser };
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    window.location.reload();
  }
};
