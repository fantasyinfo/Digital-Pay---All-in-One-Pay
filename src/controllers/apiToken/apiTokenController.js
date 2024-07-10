import ApiToken from "../../models/user/ApiToken.js";
import { APIstatusCodes } from "../../utils/constants.js";
import { responseHandler } from "../../utils/responseHandler.js";
import { v4 as uuidv4 } from "uuid";

export const generateSandboxToken = async (req, res) => {
  const userId = req?.userId;

  const sanboxKeys = await ApiToken.findOne({ user_id: userId });

  if (
    sanboxKeys &&
    sanboxKeys.sandbox_keys &&
    sanboxKeys.sandbox_keys.client_id &&
    sanboxKeys.sandbox_keys.secret_key
  ) {
    return responseHandler.customError(
      req,
      res,
      null,
      "apiToken.sandbox.tokenAlreadyExits",
      APIstatusCodes[400]
    );
  }

  try {
    const keys = generateTokens();

    const obj = {
      user_id: userId,
      sandbox_keys: {
        client_id: keys.clientId,
        secret_key: keys.clientSecret,
      },
    };
    const apiTokens = new ApiToken(obj);
    await apiTokens.save();

    return responseHandler.success(
      req,
      res,
      apiTokens,
      "apiToken.sandbox.tokenGenerated"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "apiToken.sandbox.tokenNotGenerated"
    );
  }
};

export const generateLiveToken = async (req, res) => {
  const userId = req?.userId;

  try {
    const apiToken = await ApiToken.findOne({ user_id: userId });
    // Check if sandbox keys exist to generate live keys
    const keys = generateTokens();

    // Update live keys in the existing ApiToken document
    apiToken.live_keys = {
      client_id: keys.clientId,
      secret_key: keys.clientSecret,
    };
    await apiToken.save();

    return responseHandler.success(
      req,
      res,
      apiToken,
      "apiToken.live.tokenGenerated"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "apiToken.live.tokenNotGenerated"
    );
  }
};

export const getSandboxKeys = async (req, res) => {
  const userId = req?.userId;

  const sanboxKeys = await ApiToken.findOne({ user_id: userId });

  if (
    sanboxKeys &&
    sanboxKeys.sandbox_keys &&
    sanboxKeys.sandbox_keys.client_id &&
    sanboxKeys.sandbox_keys.secret_key
  ) {
    const _response = {
      sandbox_keys: sanboxKeys.sandbox_keys,
      createdAt: sanboxKeys.createdAt,
    };
    return responseHandler.success(
      req,
      res,
      _response,
      "successMessages.apiKeys.sandbox.apiKeys"
    );
  }

  return responseHandler.error(
    req,
    res,
    "errorMessages.apiKeys.sandbox.apiKeys",
    "errorMessages.apiKeys.sandbox.apiKeys"
  );
};

export const getLiveKeys = async (req, res) => {
  const userId = req?.userId;

  const liveKeys = await ApiToken.findOne({ user_id: userId });

  if (
    liveKeys &&
    liveKeys.live_keys &&
    liveKeys.live_keys.client_id &&
    liveKeys.live_keys.secret_key
  ) {
    const _response = {
      live_keys: liveKeys.live_keys,
      createdAt: liveKeys.createdAt,
    };
    return responseHandler.success(
      req,
      res,
      _response,
      "successMessages.apiKeys.live.apiKeys"
    );
  }

  return responseHandler.error(
    req,
    res,
    "errorMessages.apiKeys.live.apiKeys",
    "errorMessages.apiKeys.live.apiKeys"
  );
};
const generateRandomString = (length) => {
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

const generateTokens = () => {
  const clientIdLength = 10;
  const clientSecretLength = 32;

  const clientId = generateRandomString(clientIdLength);
  const clientSecret = generateRandomString(clientSecretLength);

  return { clientId, clientSecret };
};
