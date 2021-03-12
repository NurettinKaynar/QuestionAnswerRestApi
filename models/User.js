const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Question = require("./Question")
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Lütfen İsminizi Girin"],
  },
  email: {
    type: String,
    required: [true, "Lütfen E-posta Adresinizi Girin"],
    unique: true,
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/],
  },
  role: {
    type: String,
    dafeult: "user",
    enum: ["user", "admin"],
  },
  password: {
    type: String,
    minlength: [6, "Şifreniz 6 karakter uzunluğunda olmalıdır."],
    required: [true, "Lütfen Şifrenizi tanımlayın."],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
  },
  place: {
    type: String
  },
  about: {
    type: String,
  },
  website: {
    type: String,
  },
  profile_image: {
    type: String,
    default: "default.jpg",
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }
});

UserSchema.methods.generateJwtFromUsers = function () {
  const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;
  const payload = { id: this._id, name: this.name };
  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE
  })
  return token;
}
UserSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex")
  const { RESET_PASSWORD_EXPIRE } = process.env
  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex")
  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE)
  return resetPasswordToken;
}
UserSchema.pre("save", function (next) {
  //Parola Değişmemişse
  if (!this.isModified("password")) {
    next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err)
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) next(err)
      this.password = hash
      next()
    });
  });
})
UserSchema.post("remove", async function () {
  await Question.deleteMany({
    user: this._id
  })
})
module.exports = mongoose.model("User", UserSchema);
