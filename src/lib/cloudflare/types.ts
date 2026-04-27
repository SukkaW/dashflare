export interface CloudflareAPIErrorResponse {
  errors: MessageObject[],
  messages: MessageObject[],
  result: null,
  success: false
}

interface MessageObject {
  code: number,
  message: string
}

export function isCloudflareAPIResponseError(input: unknown): input is CloudflareAPIErrorResponse {
  return typeof input === 'object'
    && input !== null
    && 'success' in input
    && input.success === false
    && 'errors' in input;
}
