export type TestStacktrace {
  description: string;
  error: Error;
  message: string;
  stack: Array<CallSite>;
};
