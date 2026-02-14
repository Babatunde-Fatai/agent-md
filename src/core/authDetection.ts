export function looksLikeAuthRedirect(originalUrl: string, finalUrl: string): boolean {
  if (originalUrl === finalUrl) {
    return false;
  }

  const authPatterns = [
    '/login',
    '/signin',
    '/sign-in',
    '/auth',
    '/authenticate',
    '/session/new',
    '/users/sign_in'
  ];
  const final = finalUrl.toLowerCase();

  return authPatterns.some((pattern) => final.includes(pattern));
}

export function looksLikeLoginWall(markdownBody: string): boolean {
  if (markdownBody.length > 2000) {
    return false;
  }

  const lower = markdownBody.toLowerCase();
  const signals = [
    'sign in',
    'log in',
    'login',
    'password',
    'forgot your password',
    'create an account'
  ];
  const matches = signals.filter((signal) => lower.includes(signal)).length;

  return matches >= 2;
}
