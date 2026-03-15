
exports.getLogobble = (req, res) => {
    res.render('logobble/logobble.ejs', {
        pageTitle: "Log-ooble!",
        path: '/logobble',
        
    });
}