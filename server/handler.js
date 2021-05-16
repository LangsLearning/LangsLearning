const logger = require('./logger');

class Handler {
    constructor(fn) {
        this.fn = fn;
    }

    onErrorRedirect(path) {
        return this.wrapFn((res, err) => {
            logger.info("Redirecting...")
            res.redirect(path);
        });
    }

    onErrorRender(path, buildParamsFn = err => ({})) {
        return this.wrapFn((res, err) => {
            res.render(path, buildParamsFn(err));
        });
    }

    onErrorReturnJson(status, buildJsonFn = err => ({})) {
        return this.wrapFn((res, err) => {
            res.status(status).json(buildJsonFn(err));
        });
    }

    onErrorRespondJson(status) {
        return this.wrapFn((res, err) => {
            res.status(status).json({ message: err.message });
        });
    }

    wrapFn(onErrorFn) {
        return async(req, res, next) => {
            try {
                const _ = await this.fn(req, res, next);
            } catch (err) {
                logger.error(err);
                onErrorFn(res, err);
            }
        }
    }
}

module.exports = Handler;