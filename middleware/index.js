const loggedOut = (req, res, next) => req.session && req.session.userId ? res.redirect('/profile') : next();

const requiresLogin = (req, res, next) =>  {
    if (req.session && req.session.userId) return next()
    const err = new Error('You must be logged in to view this page!');
    err.status = 401;
    return next(err);
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;