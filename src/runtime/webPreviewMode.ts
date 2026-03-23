const runtime = globalThis as typeof globalThis & {
  __APP_APICOLA_WEB_PREVIEW_MODE__?: boolean;
};

export const setWebPreviewModeActive = (enabled: boolean) => {
  runtime.__APP_APICOLA_WEB_PREVIEW_MODE__ = enabled;
};

export const isWebPreviewModeActive = () => runtime.__APP_APICOLA_WEB_PREVIEW_MODE__ === true;
