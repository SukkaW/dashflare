declare global {
  namespace Cloudflare {
    export interface MessageObject {
      code: number,
      message: string
    }

    export type APIResponse<Result = any> = {
      errors: never[],
      messages: Cloudflare.MessageObject[],
      result: Result,
      success: true
    } | {
      errors: Cloudflare.MessageObject[],
      messages: Cloudflare.MessageObject[],
      result: null,
      success: false,
    };
  }
}

export const isCloudflareAPIResponse = (input: unknown): input is Cloudflare.APIResponse => {
  return (
    typeof input === 'object'
    && input !== null
    && 'success' in input
    && 'errors' in input
    && 'messages' in input
    && 'result' in input
  );
};
