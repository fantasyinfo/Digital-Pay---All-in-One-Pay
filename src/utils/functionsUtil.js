import axios from "axios";
import { responseHandler } from "./responseHandler.js";
import { v4 as uuidv4 } from "uuid";

export const formatedDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

export const validateBody = (body, requiredValues, res, req) => {
  const errorMessages = {};

  requiredValues.forEach((value) => {
    if (!body[value]) {
      errorMessages[value] = `${value} is missing`;
    }
  });

  if (Object.keys(errorMessages).length > 0) {
    responseHandler.customError(
      req,
      res,
      "Required Parameters are missing",
      errorMessages,
      422
    );
    return false; // Indicating validation failed
  }

  return true;
};

export const validateHeaders = (headers, requiredValues, res, req) => {
  const errorMessages = {};

  requiredValues.forEach((value) => {
    if (!headers[value]) {
      errorMessages[value] = `${value} Headers is missing`;
    }
  });

  if (Object.keys(errorMessages).length > 0) {
    responseHandler.customError(
      req,
      res,
      "Required Headers are missing",
      errorMessages,
      422
    );
    return false; // Indicating validation failed
  }

  return true;
};

export const validateParams = (body, requiredValues, res, req) => {
  const errorMessages = {};

  requiredValues.forEach((value) => {
    if (!body[value]) {
      errorMessages[value] = `${value} is missing`;
    }
  });

  if (Object.keys(errorMessages).length > 0) {
    responseHandler.customError(
      req,
      res,
      "Required Parameters are missing",
      errorMessages,
      422
    );
    return false; // Indicating validation failed
  }

  return true;
};

export const validate_isString = (value) => {
  return typeof value === "string" || value instanceof String;
};

export const validate_isURL = (value) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i" // fragment locator
  );
  return !!urlPattern.test(value);
};

export const validate_isObject = (value) => {
  return value && typeof value === "object" && value.constructor === Object;
};

export const validate_isArrayOfObjects = (value) => {
  return Array.isArray(value) && value.every((item) => validate_isObject(item));
};

export const validate_isNumber = (value) => {
  return typeof value === "number" && isFinite(value);
};

export const validate_isFloat = (value) => {
  return validate_isNumber(value) && !Number.isInteger(value);
};

export const validators = {
  isString: validate_isString,
  isObject: validate_isObject,
  isArrayOfObjects: validate_isArrayOfObjects,
  isNumber: validate_isNumber,
  isFloat: validate_isFloat,
  isURL: validate_isURL,
};

export const validate_data = (value, functionName) => functionName(value);

export const getRandomTmpStringId = () => {
  const length = 16;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  // Generate a random string of length 16
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  // Append a UUIDv4
  result += uuidv4();

  // Append an additional random string of length 16
  let resultNegative = "";
  for (let i = 0; i < length; i++) {
    resultNegative += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  result += resultNegative;

  return result;
};


export const formatDateTime = (date) => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, // Use 12-hour format with AM/PM
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', options).format(date);
  return formattedDate;
};

export const parseDateTime = (formattedDateString) => {
  // Parse the formatted date string into a JavaScript Date object
  const parsedDate = new Date(formattedDateString);
  return parsedDate;
}