class Router {
    constructor(builder) {
        this.builder = builder;
    }

    apply(app) {
        return this.builder(app);
    }
}

module.exports = Router;