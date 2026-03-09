type ApiBase = {
  code: number;
  message: string;
};

export type ApiResponse<T> =
  | (ApiBase & {
      success: true;
      data: T;
      error: null;
    })
  | (ApiBase & {
      success: false;
      data: null;
      error: string;
    });
