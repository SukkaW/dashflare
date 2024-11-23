declare global {
  namespace Cloudflare {
    export interface MessageObject {
      code: number,
      message: string
    }

    export interface PaginationInfo {
      /** Total number of results for the requested service */
      count: number,
      /** Current page within paginated list of results */
      page: number,
      /** Number of results per page of results */
      per_page: number,
      /** Total results available without any search parameters */
      total_count: number,
      total_pages: number
    }

    export interface APIResponse<Result = any> {
      errors: never[],
      messages: MessageObject[],
      result: Result,
      success: true,
      result_info?: PaginationInfo
    }

    export interface APIResponseError {
      errors: MessageObject[],
      messages: MessageObject[],
      result: null,
      success: false
    }
  }
}

export function isCloudflareAPIResponseError(input: unknown): input is Cloudflare.APIResponseError {
  return typeof input === 'object'
    && input !== null
    && 'success' in input
    && input.success === false
    && 'errors' in input;
}
