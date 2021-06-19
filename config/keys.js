dbPassword = 'mongodb+srv://YOUR_USERNAME_HERE:'+ encodeURIComponent('YOUR_PASSWORD_HERE') ;
mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false
module.exports = {
    mongoURI: dbPassword
};
