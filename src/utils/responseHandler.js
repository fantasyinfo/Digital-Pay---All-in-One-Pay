import i18next from "./i18nextTranslate.js";

export const translate = (req, key, options = {}) => {
  if (typeof req.t === "function") {
    return req.t(key, options);
  }
  return i18next.t(key, options);
};

export const responseHandler = {
  success: (req, res, data, messageKey) => {
    const message = translate(req, messageKey);
    return res
      .status(200)
      .json({ status: translate(req, "success"), message, data });
  },
  error: (req, res, error, messageKey) => {
    const message = translate(req, messageKey);
    return res
      .status(500)
      .json({ status: translate(req, "error"), message, error });
  },
  notFound: (req, res) => {
    const route = decodeURIComponent(req?.originalUrl);
    const message = translate(req, "routeNotFound", { route });
    return res
      .status(404)
      .json({ status: translate(req, "error"), message, error: route });
  },
  customError: (req, res, errorKey, messageKey, statusCode) => {
    const message = translate(req, messageKey);
    const error = translate(req, errorKey);
    return res
      .status(statusCode)
      .json({ status: translate(req, "error"), message, error });
  },
};
