import ApiToken from "../models/user/ApiToken.js";
import { APIstatusCodes, Modes } from "../utils/constants.js";
import { validateHeaders } from "../utils/functionsUtil.js";
import { responseHandler } from "../utils/responseHandler.js";

export const validateApiKeys = async (req, res, next) => {
  const requiredValues = ["mode"];
  const isValid = validateHeaders(req.headers, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  const mode = req.headers["mode"];

  let findObj = {};

  if (mode === Modes.sandbox) {
    const requiredValues = ["x-sandbox-client-id", "x-sandbox-secret-key"];
    const isValid = validateHeaders(req.headers, requiredValues, res, req);

    if (!isValid) {
      return;
    }

    const sandboxClientId = req.headers["x-sandbox-client-id"];
    const sandboxSecretKey = req.headers["x-sandbox-secret-key"];

    findObj.sandbox_keys = {};
    findObj.sandbox_keys.client_id = sandboxClientId;
    findObj.sandbox_keys.secret_key = sandboxSecretKey;
  } else if (mode === Modes.live) {
    const requiredValues = ["x-live-client-id", "x-live-secret-key"];
    const isValid = validateHeaders(req.headers, requiredValues, res, req);

    if (!isValid) {
      return;
    }
    const liveClientId = req.headers["x-live-client-id"];
    const liveSecretKey = req.headers["x-live-secret-key"];

    findObj.live_keys = {};
    findObj.live_keys.client_id = liveClientId;
    findObj.live_keys.secret_key = liveSecretKey;
  } else {
    return responseHandler.customError(
      req,
      res,
      "errorMessages.apiKeys.modeNotMatch",
      "errorMessages.apiKeys.modeNotMatch",
      APIstatusCodes[401]
    );
  }

  try {
    const validateApiKeys = await ApiToken.findOne(findObj);

    if (!validateApiKeys) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.apiKeys.keysNotMatch",
        "errorMessages.apiKeys.keysNotMatch",
        APIstatusCodes[404]
      );
    }

    req.mode = mode;
    req.userId = validateApiKeys.user_id;

    next();
  } catch (error) {
    responseHandler.error(req, res, error, "Internal Server Error");
  }
};
