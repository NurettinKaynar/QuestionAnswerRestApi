const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const { sendJwtToClient } = require("../helpers/authoraziton/tokenHelpers");
const { validateUserInput, comparePassword } = require("../helpers/authoraziton/input/inputHelpers")
const sendEmail = require("../helpers/libraries/sendEmail")
//POST DATA
const register = asyncErrorWrapper(async (req, res, next) => {


  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  sendJwtToClient(user, res)
});
const login = asyncErrorWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!validateUserInput(email, password)) {
    return next(new Error("Lütfen Girişlerinizi Kontrol edin.", 400))
  }
  const user = await User.findOne({ email }).select("+password")
  if (!comparePassword(password, user.password)) {
    return next(new CustomError("Lütfen Şifrenizi Tekrar Girin", 400))
  }
  sendJwtToClient(user, res)
})
const logout = asyncErrorWrapper(async (req, res, next) => {
  const { NODE_ENV } = process.env

  return res.status(200).cookie({
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: NODE_ENV === "development" ? false : true
  }).json({
    succes: true,
    message: "Çıkış Yapıldı"
  })
})
const getUser = (req, res, next) => {
  res.json({
    succes: true,
    data: {
      id: req.user.id,
      name: req.user.name
    }
  })
};
const imageUpload = asyncErrorWrapper(async (req, res, next) => {
  //Image Upload Success
  const user = await User.findByIdAndUpdate(req.user.id, { "profile_image": req.savedProfileImage }, {
    new: true,
    runValidators: true
  })
  res.status(200)
    .json({
      succes: true,
      message: "Resim Yüklemesi Tamamlandı.",
      data: user
    })
})

//forgot Password
const forgotPassword = asyncErrorWrapper(async (req, res, next) => {
  const resetEmail = req.body.email
  const user = await User.findOne({ email: resetEmail })
  if (!user) {
    return next(new CustomError("Bu mail adresine kayıtlı kullanıcı bulunamadı.", 400))
  }

  const resetPasswordToken = user.getResetPasswordTokenFromUser();
  await user.save()



  const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`

  const emailTemplate = `
    <h3> Şifrenizi Sıfırlayın</h3>
    <p> Şifrenizi <a href='${resetPasswordUrl}' target='_blank'>buraya</a> tıklayarak sıfırlayabilirsiniz.</br>
    Bu link 1 saat sonra geçerliliğini yitirecektir.</p> `;

  try {
    await sendEmail({
      from: process.env.SMTP_USER,
      to: resetEmail,
      subject: "Şifrenizi Sıfırlayın",
      html: emailTemplate
    });
    return res.status(200).json({
      success: true,
      message: "Şifre yenileme anahtarı gönderildi."
    })
  }
  catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(err, new CustomError("Mail Gönderilemedi", 500))
  }
})

const resetPassword = asyncErrorWrapper(async (req, res, next) => {
  const { resetPasswordToken } = req.query;
  const { password } = req.body;
  if (!resetPasswordToken) {
    return next(new CustomError("Hatalı işlem lütfen tekrar deneyiniz", 400))
  }
  let user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }

  })
  if (!user) {
    return next(new CustomError("Geçersiz oturum işlemi", 404))
  }
  user.password = password;
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()
  return res.status(200)
    .json({
      success: true,
      message: "Sıfırlam işlemi Başarıyla Tamamlandı"
    })
})


const editDetails = asyncErrorWrapper(async (req, res, next) => {
  const editInformation = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, editInformation, { new: true, runValidators: true })
  return res.status(200).json({
    success: true,
    data: user
  })
})

module.exports = {
  register,
  login,
  logout,
  getUser,
  imageUpload,
  forgotPassword,
  resetPassword,
  editDetails
}
