export const APIstatusCodes = {
  // Informational responses (100–199)
  100: 100, //"Continue",
  101: 101, //"Switching Protocols",
  102: 102, //"Processing",

  // Successful responses (200–299)
  200: 200, //"OK",
  201: 201, //"Created",
  202: 202, // "Accepted",
  204: 204, //"No Content",

  // Redirection messages (300–399)
  300: 300, //"Multiple Choices",
  301: 301, //"Moved Permanently",
  302: 302, //"Found",
  304: 304, //"Not Modified",
  307: 307, //"Temporary Redirect",
  308: 308, //"Permanent Redirect",

  // Client error responses (400–499)
  400: 400, //"Bad Request",
  401: 401, //"Unauthorized",
  403: 403, //"Forbidden",
  404: 404, //"Not Found",
  405: 405, //"Method Not Allowed",
  409: 409, //"Conflict",
  410: 410, //"Gone",
  422: 422, //"Unprocessable Entity",

  // Server error responses (500–599)
  500: 500, //"Internal Server Error",
  501: 501, //"Not Implemented",
  502: 502, //"Bad Gateway",
  503: 503, //"Service Unavailable",
  504: 504, //"Gateway Timeout",
  505: 505, //"HTTP Version Not Supported",
};

export const DBtables = {
  user: "User",
  api_keys: "Apikey",
  transaction:"Transaction",
  tmp:"Tmp"
};

export const PaymentStatus = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed"
}

export const SupportedCurrency = {
  USD: "USD",
  INR: "INR"
}


export const Modes = {
  live: "LIVE",
  sandbox: "SANDBOX",
};

export const __company = {
  name: "DIGI 1 PAY",
  client:'Client Details'
};

// step 1
export const PaymentGateways = {
  paypal: "Paypal",
  stripe: "Stripe",
};

// step 2
export const PaymentGatewayCode = {
  1: PaymentGateways.paypal,
  2: PaymentGateways.stripe,
};
