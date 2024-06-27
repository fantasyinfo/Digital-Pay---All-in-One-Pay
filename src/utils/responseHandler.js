export const responseHandler = {
  success: (res, data, message = 'Success') => {
    return res.status(200).json({ status: 'success', message, data });
  },
  error: (res, error, message = 'Error') => {
    return res.status(500).json({ status: 'error', message, error });
  },
  notFound: (res, route ) => {
    const message = `Route '${route}' does not match any known routes. Please check the route or contact support.`;
    return res.status(404).json({ status: 'error', message });
  },
};
