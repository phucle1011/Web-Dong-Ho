// src/helpers/auth.js
export function setAuthData({ token, user, rememberToken }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  if (rememberToken) {
    // nếu bạn dùng tokenExpire để refresh hoặc auto-logout
    localStorage.setItem("tokenExpire", rememberToken);
  }
}
