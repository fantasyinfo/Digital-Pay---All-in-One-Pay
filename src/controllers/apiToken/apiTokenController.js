import ApiToken from "../../models/user/ApiToken.js";
import { responseHandler } from "../../utils/responseHandler.js";

export const generateSandboxToken = async (req, res) => {
  const userId = req?.userId;

  const sanboxKeys = await ApiToken.findOne({ user_id: userId });

  if (
    sanboxKeys &&
    sanboxKeys.sandbox_keys &&
    sanboxKeys.sandbox_keys.client_id &&
    sanboxKeys.sandbox_keys.secret_key
  ) {
    return responseHandler.error(
      req,
      res,
      null,
      "apiToken.sandbox.tokenAlreadyExits"
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

    // Check if live keys already exist
    if (
      apiToken &&
      apiToken.live_keys &&
      apiToken.live_keys.client_id &&
      apiToken.live_keys.secret_key
    ) {
      return responseHandler.error(
        req,
        res,
        null,
        "apiToken.live.tokenAlreadyExists"
      );
    }

    // Check if sandbox keys exist to generate live keys
    if (
      apiToken &&
      apiToken.sandbox_keys &&
      apiToken.sandbox_keys.client_id &&
      apiToken.sandbox_keys.secret_key
    ) {
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
    } else {
      return responseHandler.error(
        req,
        res,
        null,
        "apiToken.live.createSandboxKeysFirst"
      );
    }
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
    return responseHandler.success(
      req,
      res,
      sanboxKeys.sandbox_keys,
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
    return responseHandler.success(
      req,
      res,
      liveKeys.live_keys,
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
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const generateTokens = () => {
  const clientIdLength = 32;
  const clientSecretLength = 64;

  const clientId = generateRandomString(clientIdLength);
  const clientSecret = generateRandomString(clientSecretLength);

  return { clientId, clientSecret };
};
