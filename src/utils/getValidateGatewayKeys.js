import { Modes, PaymentGateways } from "./constants.js";
import { responseHandler } from "./responseHandler.js";
import { validateHeaders } from "./functionsUtil.js";
import { ApiKeysLive, ApiKeysSandbox } from "./apiKeys.js";

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
        this.headers["X-Gateway-Sandbox-Client-ID"] &&
        this.headers["X-Gateway-Sandbox-Secret-Key"] &&
        this.headers["X-Gateway-Sandbox-Client-ID"] !== undefined &&
        this.headers["X-Gateway-Sandbox-Secret-Key"] !== undefined &&
        this.headers["X-Gateway-Sandbox-Client-ID"] !== "" &&
        this.headers["X-Gateway-Sandbox-Secret-Key"] !== "undefined"
      ) {
        this.gatewayClientID = this.headers["X-Gateway-Sandbox-Client-ID"];
        this.gatewaySecretKey = this.headers["X-Gateway-Sandbox-Secret-Key"];
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
        "X-Gateway-Live-Client-ID",
        "X-Gateway-Live-Secret-Key",
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
        this.headers["X-Gateway-Live-Client-ID"] &&
        this.headers["X-Gateway-Live-Secret-Key"] &&
        this.headers["X-Gateway-Live-Client-ID"] !== undefined &&
        this.headers["X-Gateway-Live-Secret-Key"] !== undefined &&
        this.headers["X-Gateway-Live-Client-ID"] !== "" &&
        this.headers["X-Gateway-Live-Secret-Key"] !== "undefined"
      ) {
        this.gatewayClientID = this.headers["X-Gateway-Live-Client-ID"];
        this.gatewaySecretKey = this.headers["X-Gateway-Live-Secret-Key"];
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
