const CustomError = require("../../helpers/error/CustomError")
//Error Handler
const customErrorHandler = (err, req, res, next) => {
  let customError = err;
  // console.log(err.name)
  if (err.name === "SyntaxError") {
    customError = new CustomError("Beklenmedik Kod Hatası", 400)
  }
  if (err.name === "ValidationError") {
    customError = new CustomError(err.message, 400)
  }
  if (err.name === "CastError") {
    customError = new CustomError("Lütfen Geçerli Bir ID Giriniz", 400)
  }
  if (err.code === 11000) {
    customError = new CustomError("Lütfen Farklı bir e-posta girin.", 400)
  }
  console.log(customError.name, customError.message, customError.status)
  res.status(customError.status || 500).json({
    success: false,
    message: customError.message || "Dahili Sunucu Hatası"
  })
}

module.exports = customErrorHandler;
