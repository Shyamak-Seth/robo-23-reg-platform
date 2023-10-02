const router = require('express').Router()
const User = require('../schemas/userSchema.js')
const bcrypt = require('bcrypt')
const { loginUser, forwardAuthenticated } = require('../utils/authenticate.js')

router.get('/school', forwardAuthenticated, (req, res) => {
  res.render('schoolReg', { user: req.user })
});

router.get('/indi', forwardAuthenticated, (req, res) => {
  res.render('indiReg', { user: req.user })
});

router.post('/school', async (req, res, next) => {
  let errors = []
  const { schoolName, schoolAddress, schoolEmail, clubName, clubEmail, clubWebsite, teacherName, teacherEmail, teacherPhone, studentName, studentEmail, studentPhone, password, cpassword } = req.body
  if (!schoolName || !schoolAddress || !schoolEmail || !teacherName || !teacherEmail || !teacherPhone || !studentName || !studentEmail || !studentPhone || !password || !cpassword) errors.push({ msg: "All fields are required" })
  if (password != cpassword) errors.push({ msg: "Passwords do not match" })
  await User.findOne({ "school.schoolEmail": schoolEmail }).then((user) => {
    if (user) {
      console.log(user, "already exists")
      errors.push({ msg: "Account already exists, try logging in" })
    }
  })

  if (errors.length > 0) return res.send(errors)
  const newUser = new User({
    regType: 'school',
    school: {
      schoolName,
      schoolEmail,
      schoolAddress,
      clubName,
      clubEmail,
      clubWebsite,
      teacherName,
      teacherEmail,
      teacherPhone,
      studentName,
      studentEmail,
      studentPhone,
      pass: password
    }
  })
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newUser.school.pass, salt, async (err, hash) => {
      if (err) throw err;
      newUser.school.pass = hash;
      await newUser.save().then((user) => {
        console.log(user)
      }).catch(err => console.log(err))
      await loginUser(req, res, next)
    })
  );
})

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});




//export router
module.exports = router;