exports.getLogobble = (req, res, next) => {
    res.render('logobble/logobble.ejs', {
        pageTitle: "Log-ooble!",
        path: '/logobble'
    });
}