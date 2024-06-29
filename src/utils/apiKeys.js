import { PaymentGateways } from "./constants.js";

export const ApiKeysSandbox = {
  [PaymentGateways.paypal]: {
    url: "https://api-m.sandbox.paypal.com",
    clientId:
      "AbYAhLlI97qhtm7W-bIk8S7uGrJ9Z9nI9vR2jH188vqXTbE7Y_w4iEz7MSmwSLkfJ_VGSoQjv8p46C9T",
    secretKey:
      "EDTC0mAXpDxJyPmAlKzyq2RlbUmmrzjXuro0Dth2dQi_aMtbtqi-JnnkwTzDhod3Gz_6SacCZncXPlL8",
  },
};

export const ApiKeysLive = {
  [PaymentGateways.paypal]: {
    url: "https://api-m.paypal.com",
    clientId:
      "AbYAhLlI97qhtm7W-bIk8S7uGrJ9Z9nI9vR2jH188vqXTbE7Y_w4iEz7MSmwSLkfJ_VGSoQjv8p46C9T",
    secretKey:
      "EDTC0mAXpDxJyPmAlKzyq2RlbUmmrzjXuro0Dth2dQi_aMtbtqi-JnnkwTzDhod3Gz_6SacCZncXPlL8",
  },
};
