import { validationResult } from 'express-validator';

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const err = new Error(
            errors.array().map(e => e.msg).join(', ')
        );
        err.statusCode = 400;
        return next(err);
    }

    next();
};

export default validate;
