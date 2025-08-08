// Auth is not implemented since Supabase was removed.
// These stubs keep the UI functional without user sessions.

export async function signUp(_email: string, _password: string, _fullName: string) {
  throw new Error('Auth not implemented');
}

export async function signIn(_email: string, _password: string) {
  throw new Error('Auth not implemented');
}

export async function signOut() {
  return { error: null };
}

export type CurrentUser = null;

export async function getCurrentUser(): Promise<CurrentUser> {
  return null;
}

export async function getUserRole(_userId: string): Promise<string | null> {
  return 'diner';
}