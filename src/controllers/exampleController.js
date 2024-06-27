import Example from "../models/exampleModel.js";
import { responseHandler } from "../utils/responseHandler.js";

export const getExamples = async (req, res) => {
  try {
    const examples = await Example.find();
    responseHandler.success(res, examples);
  } catch (err) {
    responseHandler.error(res, err.message);
  }
};

export const createExample = async (req, res) => {
  try {
    const example = new Example(req.body);
    await example.save();
    responseHandler.success(res, example, "Example created successfully");
  } catch (err) {
    responseHandler.error(res, err.message);
  }
};
