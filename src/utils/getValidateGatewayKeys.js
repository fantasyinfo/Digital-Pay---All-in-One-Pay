import {
  Modes,
  PaymentGateways,
} from "./constants.js";
import { responseHandler } from "./responseHandler.js";
import { validateHeaders } from "./functionsUtil.js";
import {
    ApiKeysLive,
    ApiKeysSandbox,
  } from "./apiKeys.js";


export class ValidateGatewayKeys {
  // mode: live, sandbox
  // headers: req.headers
  // res: res,
  // req: req,
  // type: paypal, stripe , payment type
  constructor(mode, headers, req, res, type) {
    this.mode = mode;
    this.headers = headers;
    this.res = res;
    this.req = req;
    this.gatewayClientID = "";
    this.gatewaySecretKey = "";
    this.gatewayURL = "";
    this.type = type;
  }

  get() {
    if (this.mode === Modes.sandbox) {
      // Check if client sent their gateway sandbox details else use own
      if (
        this.headers.gateway_sandbox_client_id &&
        this.headers.gateway_sandbox_secret_key &&
        this.headers.gateway_sandbox_client_id !== undefined &&
        this.headers.gateway_sandbox_secret_key !== undefined &&
        this.headers.gateway_sandbox_client_id !== "" &&
        this.headers.gateway_sandbox_secret_key !== "undefined"
      ) {
        this.gatewayClientID = this.headers.gateway_sandbox_client_id;
        this.gatewaySecretKey = this.headers.gateway_sandbox_secret_key;
        this.gatewayURL = ApiKeysSandbox[PaymentGateways[this.type]].url;
      } else {
        this.gatewayClientID =
          ApiKeysSandbox[PaymentGateways[this.type]].clientId;
        this.gatewaySecretKey =
          ApiKeysSandbox[PaymentGateways[this.type]].secretKey;
        this.gatewayURL = ApiKeysSandbox[PaymentGateways[this.type]].url;
      }
    } else if (this.mode === Modes.live) {

      const requiredValues = [
        "gateway_live_client_id",
        "gateway_live_secret_key",
      ];

      const isValid = validateHeaders(
        this.headers,
        requiredValues,
        this.res,
        this.req
      );
      if (!isValid) {
        return;
      }

      if (
        this.headers.gateway_live_client_id &&
        this.headers.gateway_live_secret_key &&
        this.headers.gateway_live_client_id !== undefined &&
        this.headers.gateway_live_secret_key !== undefined &&
        this.headers.gateway_live_client_id !== "" &&
        this.headers.gateway_live_secret_key !== "undefined"
      ) {
        this.gatewayClientID = this.headers.gateway_live_client_id;
        this.gatewaySecretKey = this.headers.gateway_live_secret_key;
        this.gatewayURL = ApiKeysLive[PaymentGateways[this.type]].url;
      } else {
        return responseHandler.customError(
          this.req,
          this.res,
          "errorMessages.gateway.gatewayCredientialsRequired",
          "errorMessages.gateway.gatewayCredientialsRequired"
        );
      }
    }
  }
}
