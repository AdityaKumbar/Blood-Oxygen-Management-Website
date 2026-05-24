const ADMIN_SCOPE = "admin";
const HOSPITAL_SCOPE = "hospital";

const scopeFromPath = (pathname = "") => {
  return pathname.startsWith("/hospital") ? HOSPITAL_SCOPE : ADMIN_SCOPE;
};

export const getCurrentAuthScope = () => {
  if (typeof window === "undefined") return ADMIN_SCOPE;
  return scopeFromPath(window.location.pathname || "");
};

export const getAuthStorageKeys = (scope = getCurrentAuthScope()) => {
  return {
    tokenKey: `hem_access_token_${scope}`,
    userKey: `hem_user_${scope}`,
  };
};

export const readScopedAuthSession = (scope = getCurrentAuthScope()) => {
  const { tokenKey, userKey } = getAuthStorageKeys(scope);
  const token = localStorage.getItem(tokenKey);
  const rawUser = localStorage.getItem(userKey);

  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  return { token, user };
};

export const writeScopedAuthSession = (payload, scope = getCurrentAuthScope()) => {
  const { tokenKey, userKey } = getAuthStorageKeys(scope);
  localStorage.setItem(tokenKey, payload.accessToken);
  localStorage.setItem(userKey, JSON.stringify(payload.user));
};

export const clearScopedAuthSession = (scope = getCurrentAuthScope()) => {
  const { tokenKey, userKey } = getAuthStorageKeys(scope);
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
};
