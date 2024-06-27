
import {responseHandler} from '../utils/responseHandler.js';

export const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  responseHandler.error(res, err.data, err.message, err.statusCode);
};
