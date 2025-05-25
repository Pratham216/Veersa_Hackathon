const geolocationErrorHandler = (err, req, res, next) => {
  if (err.isAxiosError) {
    console.error('Geoapify API Error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });

    return res.status(err.response?.status || 500).json({
      error: 'Geolocation Service Error',
      details: err.response?.data?.message || err.message
    });
  }
  next(err);
};

module.exports = geolocationErrorHandler;