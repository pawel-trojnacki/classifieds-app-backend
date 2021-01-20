export const cookieExtractor = (req: any): null | string => {
  return req && req.cookies ? req.cookies.jwt ?? null : null;
};
