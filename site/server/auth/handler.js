const login = (req, res) =>
    res.redirect('/admin/trials')

const logout = (req, res) => {
    req.logout();
    res.redirect('/?logout=true');
};

module.exports = {
    login,
    logout,
};