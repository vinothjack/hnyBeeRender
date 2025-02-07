export const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging purposes

    const statusCode = err.statusCode || 500; // Default to 500 if no status code is provided
    const message = err.message || 'Internal Server Error'; // Default error message

    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};
