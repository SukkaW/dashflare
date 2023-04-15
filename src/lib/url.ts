export const generateAbsoluteURL = (url: string) => (url.includes('://') ? url : `https://${url}`);
