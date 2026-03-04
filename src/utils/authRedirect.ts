const LOGIN_PATH = "/login";

export const redirectToLogin = () => {
  localStorage.removeItem("token");

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.href = LOGIN_PATH;
  }
};
