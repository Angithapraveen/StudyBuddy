const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    console.error('[Error] Multer file size limit:', err.message);
    return res.status(413).json({
      success: false,
      message: 'File too large. Please upload a smaller file (max 10MB).',
    });
  }

  if (err.status === 413 || err.type === 'entity.too.large') {
    console.error('[Error] Payload too large:', err.message);
    return res.status(413).json({
      success: false,
      message: 'File too large. Please upload a smaller file.',
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  console.error(`[Error] ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
