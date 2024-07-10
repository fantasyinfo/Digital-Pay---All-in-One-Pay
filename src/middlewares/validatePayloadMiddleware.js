import { APIstatusCodes } from "../utils/constants.js";
import { validate_data, validators } from "../utils/functionsUtil.js";
import { ValidateGatewayKeys } from "../utils/getValidateGatewayKeys.js";
import { responseHandler } from "../utils/responseHandler.js";

export const CheckPayloadForInit = (req, res, next) => {

  const payload = req.body;
  
  const mode = req.mode;
  const gatewayType = req.paymentMethod.toLowerCase();

  // Check keys...
  const validator = new ValidateGatewayKeys(
    mode,
    req.headers,
    req,
    res,
    gatewayType
  );
  validator.get();

  req.gatewayClientID = validator.gatewayClientID;
  req.gatewaySecretKey = validator.gatewaySecretKey;
  req.gatewayURL = validator.gatewayURL;

  const errors = [];

  // Required fields
  const requiredFields = [
    "order_id",
    "total_amount",
    "currency",
    "return_url",
    "cancel_url",
    "orderdata",
  ];
  const requiredCustomerFields = ["name", "email", "phone", "address"];
  const requiredAddressFields = [
    "line1",
    "city",
    "state",
    "postal_code",
    "country",
  ];

  // Validate required fields
  requiredFields.forEach((field) => {
    if (!payload[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Validate customer fields
  if (payload.customer) {
    requiredCustomerFields.forEach((field) => {
      if (!payload.customer[field]) {
        errors.push(`customer.${field} is required`);
      }
    });

    // Validate customer address fields
    if (payload.customer.address) {
      requiredAddressFields.forEach((field) => {
        if (!payload.customer.address[field]) {
          errors.push(`customer.address.${field} is required`);
        }
      });
    } else {
      errors.push("customer.address is required");
    }
  }

  // Validate payment details based on payment method
  if (!payload.payment_details) {
    errors.push("payment_details is required");
  } else {
    switch (payload.payment_method) {
      case "card":
        const cardFields = ["number", "expiry_month", "expiry_year", "cvv"];
        cardFields.forEach((field) => {
          if (!payload.payment_details.card[field]) {
            errors.push(`payment_details.card.${field} is required`);
          }
        });
        break;
      case "bank_transfer":
        const bankFields = ["account_number", "routing_number"];
        bankFields.forEach((field) => {
          if (!payload.payment_details.bank_transfer[field]) {
            errors.push(`payment_details.bank_transfer.${field} is required`);
          }
        });
        break;
    }
  }

  // Validate optional fields if provided
  if (payload.shipping) {
    requiredAddressFields.forEach((field) => {
      if (!payload.shipping.address[field]) {
        errors.push(`shipping.address.${field} is required`);
      }
    });
  }

  // Check for errors and respond accordingly
  if (errors.length > 0)
    responseHandler.customError(req, res, "", errors, APIstatusCodes[400]);

  // Validate data types and structure
  if (!validate_data(payload.total_amount, validators.isNumber)) {
    errors.push(`"total_amount" should be a number`);
  }
  if (!validate_data(payload.currency, validators.isString)) {
    errors.push(`"currency" should be a string`);
  }
  if (!validate_data(payload.order_id, validators.isString)) {
    errors.push(`"order_id" should be a string`);
  }
  if (!validate_data(payload.return_url, validators.isURL)) {
    errors.push(`"return_url" should be a string`);
  }
  if (!validate_data(payload.cancel_url, validators.isURL)) {
    errors.push(`"cancel_url" should be a string`);
  }

  if (errors.length > 0)
    responseHandler.customError(req, res, "", errors, APIstatusCodes[400]);

  // Validate orderdata array
  if (!validate_data(payload.orderdata, validators.isArrayOfObjects)) {
    errors.push(`"orderdata" should be an array of objects`);
  } else {
    payload.orderdata.forEach((item, index) => {
      if (!validate_data(item.product_name, validators.isString)) {
        errors.push(
          `"orderdata[${index}].product_name" should be a string & must required`
        );
      }
      if (!validate_data(item.qty, validators.isNumber)) {
        errors.push(
          `"orderdata[${index}].qty" should be a number & must required`
        );
      }
      if (!validate_data(item.price, validators.isNumber)) {
        errors.push(
          `"orderdata[${index}].price" should be a number & must required`
        );
      }
    });
  }

  // Optional Parameters (optional_params)
  if (payload.optional_params) {
    if (!validate_data(payload.optional_params, validators.isObject)) {
      errors.push(`"optional_params" should be an object`);
    }
  }

  if (errors.length > 0)
    responseHandler.customError(req, res, "", errors, APIstatusCodes[400]);

  next();
};

export const CheckPayloadForStatus = (req,res,next)=>{
  const payload = req.body;
  const headers = req.headers;
  const mode = req.mode;
  const gatewayType = req.paymentMethod.toLowerCase();

  // Check keys...
  const validator = new ValidateGatewayKeys(
    mode,
    headers,
    req,
    res,
    gatewayType
  );
  validator.get();

  req.gatewayClientID = validator.gatewayClientID;
  req.gatewaySecretKey = validator.gatewaySecretKey;
  req.gatewayURL = validator.gatewayURL;

  next();
}
