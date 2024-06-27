export const responseHandler = {
  success: (req, res, data, messageKey) => {
    const message = req.t(messageKey);
    return res.status(200).json({ status: req.t('success'), message, data });
  },
  error: (req, res, error, messageKey) => {
    const message = req.t(messageKey);
    return res.status(500).json({ status: req.t('error'), message, error });
  },
  notFound: (req, res) => {
    const route = decodeURIComponent(req?.originalUrl);
    const message = req.t("routeNotFound", { route });
    return res
      .status(404)
      .json({ status: req.t('error'), message, error: route });
  },
  customError: (req, res, errorKey, messageKey, statusCode) => {
    const message = req.t(messageKey);
    const error = req.t(errorKey);
    return res
      .status(statusCode)
      .json({ status: req.t('error'), message, error });
  },
};
