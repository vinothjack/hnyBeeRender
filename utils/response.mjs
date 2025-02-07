export const returnResponse = (res, statusCode, data = '') => {
    const response = {
        status: statusCode,
        response: data,
    };
    
    return res.status(statusCode).json(response);
};
