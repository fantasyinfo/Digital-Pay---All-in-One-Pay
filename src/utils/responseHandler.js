import i18next from "./i18nextTranslate.js";

// create translate fun
export const translate = (req, key, options = {}) => {
  if (typeof req.t === "function") {
    return req.t(key, options);
  }
  return i18next.t(key, options);
};


class ResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = "ResponseError";
  }
}


export const sendResponse = (req, res, statusCode, body) => {
  if (res && typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(body);
  }
  const errorMessage = "Response object is invalid. Unable to send response.";
  console.error(errorMessage);
  console.error({
    statusCode,
    body,
  });
  throw new ResponseError(errorMessage);
};

// default responses
export const responseHandler = {
  success: (req, res, data, messageKey) => {
    const responseBody = {
      status: translate(req, "success"),
      message: translate(req, messageKey),
      data,
    };
    return sendResponse(req, res, 200, responseBody);
  },
  error: (req, res, error, messageKey) => {
    const responseBody = {
      status: translate(req, "error"),
      message: translate(req, messageKey),
      error,
    };
    return sendResponse(req, res, 500, responseBody);
  },
  notFound: (req, res) => {
    const responseBody = {
      status: translate(req, "error"),
      message: translate(req, "routeNotFound"),
      error: req?.originalUrl,
    };
    return sendResponse(req, res, 404, responseBody);
  },
  customError: (req, res, errorKey, messageKey, statusCode) => {
    const responseBody = {
      status: translate(req, "error"),
      message: typeof messageKey !== 'object' ? translate(req, messageKey) : messageKey ,
      error: translate(req, errorKey),
    };
    return sendResponse(req, res, statusCode, responseBody);
  }
};
