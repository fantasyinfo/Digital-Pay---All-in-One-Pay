import i18next from "./i18nextTranslate.js";

// create translate function
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
  if (
    res &&
    typeof res.status === "function" &&
    typeof res.json === "function"
  ) {
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
    let statusCode = 500; // Default to Internal Server Error

    if (error.response && error.response.status) {
      statusCode = error.response.status;
    } else if (error.statusCode) {
      statusCode = error.statusCode;
    }

    let errorMessage = translate(req, messageKey);

    // Customize error messages based on status codes
    switch (statusCode) {
      case 401:
        errorMessage = translate(req, "unauthorizedError");
        break;
      case 400:
        errorMessage = translate(req, "badRequestError");
        break;
      // Add more cases as needed for specific status codes
    }

    const responseBody = {
      status: translate(req, "error"),
      message: errorMessage,
      error: error.message || translate(req, "unknownError"),
    };
    return sendResponse(req, res, statusCode, responseBody);
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
      message:
        typeof messageKey !== "object"
          ? translate(req, messageKey)
          : messageKey,
      error: translate(req, errorKey),
    };
    return sendResponse(req, res, statusCode, responseBody);
  },
};
