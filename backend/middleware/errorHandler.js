const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // MongoDB Cast Error
    if (err.name === 'CastError') {
        message = `Resource not found with id ${err.value}`;
        statusCode = 404;
    }

    // MongoDB Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
        statusCode = 400;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors)
            .map(val => val.message)
            .join(', ');
        statusCode = 400;
    }

    // Multer File Size Error
    if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File size is too large';
        statusCode = 400;
    }

    // JWT Invalid Token
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token, please login again';
        statusCode = 401;
    }

    // JWT Expired Token
    if (err.name === 'TokenExpiredError') {
        message = 'Token expired, please login again';
        statusCode = 401;
    }

    // Log error (only stack in development)
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;
