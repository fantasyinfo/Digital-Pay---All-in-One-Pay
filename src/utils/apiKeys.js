import { PaymentGateways } from "./constants.js";

const _callback = "https://api.fantasyinfo.cloud/api/v1/callback/return";
const _cancel = "https://api.fantasyinfo.cloud/api/v1/callback/cancel";

export const ApiKeysSandbox = {
  [PaymentGateways.paypal]: {
    url: "https://api-m.sandbox.paypal.com",
    clientId:
      "AbYAhLlI97qhtm7W-bIk8S7uGrJ9Z9nI9vR2jH188vqXTbE7Y_w4iEz7MSmwSLkfJ_VGSoQjv8p46C9T",
    secretKey:
      "EDTC0mAXpDxJyPmAlKzyq2RlbUmmrzjXuro0Dth2dQi_aMtbtqi-JnnkwTzDhod3Gz_6SacCZncXPlL8",
  },
  [PaymentGateways.stripe]: {
    url: "https://api.stripe.com",
    clientId: "pk_test_o6ScAy3rikKa1jKhsNZ9HwLn00HIrNEESf",
    secretKey: "sk_test_ZpiCxEOHseka5xDnfwoRoG0700L2MOuJkS",
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
  [PaymentGateways.stripe]: {
    url: "https://api.stripe.com",
    clientId: "pk_test_o6ScAy3rikKa1jKhsNZ9HwLn00HIrNEESf",
    secretKey: "sk_test_ZpiCxEOHseka5xDnfwoRoG0700L2MOuJkS",
  },

};

export const CallBackUrl = {
  paypal: `${_callback}?method=paypal`,
  stripe: `${_callback}?method=stripe`,

};
export const CancelBackUrl = {
  paypal: `${_cancel}?method=paypal`,
  stripe: `${_cancel}?method=stripe`,

};
