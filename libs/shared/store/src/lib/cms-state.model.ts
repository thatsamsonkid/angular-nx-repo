export interface CmsPage {
  id: string;
  title: string;
  path: string;
}

export interface CmsState {
  locale: string;
  page: CmsPage | null;
}

export type CmsBootstrapState = Partial<CmsState>;

export const initialCmsState: CmsState = {
  locale: 'en',
  page: null,
};

declare global {
  interface Window {
    __CMS_STATE__?: CmsBootstrapState;
  }
}
