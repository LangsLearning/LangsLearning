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
            res.status(status)(path, buildJsonFn(err));
        });
    }

    onErrorRespondJson(status) {
        return this.wrapFn((res, err) => {
            res.status(status)(path, { message: err.message });
        });
    }

    wrapFn(onErrorFn) {
        return (req, res) => {
            try {
                this.fn(req, res).then(bla => logger.info("Done")).catch(err => {
                    logger.error(err);
                    onErrorFn(res, err);
                });
            } catch (err) {
                logger.error(err);
                onErrorFn(res, err);
            }
        }
    }
}

module.exports = Handler;