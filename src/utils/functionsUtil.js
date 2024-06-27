import { responseHandler } from "./responseHandler.js";


export const formatedDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};


export const validateBody = (body, requiredValues,res)=>{
    
    const errorMessages = {};

    requiredValues.forEach(value => {
        if (!body[value]) {
            errorMessages[value] = `${value} is missing`;
        }
    });

    if (Object.keys(errorMessages).length > 0) {
        responseHandler.customError(res, 'Required Parameters are missing', errorMessages, 422);
        return false; // Indicating validation failed
    }

    return true;
}