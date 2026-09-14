export interface CmsUser {
  id: string;
  name: string;
  authenticated: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  path: string;
}

export interface CmsState {
  locale: string;
  user: CmsUser | null;
  page: CmsPage | null;
}

export type CmsBootstrapState = Partial<CmsState>;

export const initialCmsState: CmsState = {
  locale: 'en',
  user: null,
  page: null,
};

declare global {
  interface Window {
    __CMS_STATE__?: CmsBootstrapState;
  }
}
