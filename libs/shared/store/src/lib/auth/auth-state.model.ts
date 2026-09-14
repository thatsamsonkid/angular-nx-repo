export interface AuthProfile {
  id: string;
  name: string;
}

export interface AuthSession {
  profile: AuthProfile;
  token: string;
}

export interface AuthState {
  session: AuthSession | null;
  loaded: boolean;
}

export const initialAuthState: AuthState = {
  session: null,
  loaded: false,
};

export const CMS_AUTH_SIGNED_IN = 'cms:signin';
export const CMS_AUTH_SIGNED_OUT = 'cms:logout';
