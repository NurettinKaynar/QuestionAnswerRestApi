const mongoose = require("mongoose");
const slugify = require("slugify");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    title: {
        type: String,
        required: [true, "Lütfen Bir Başlık Giriniz."],
        minlength: [10, "En az 10 karakterlik bir başlık giriniz."],
        unique: true
    },
    content: {
        type: String,
        required: [true, "Lüften İçeriği Boş Geçmeyiniz."],
        minlength: [20, "Lütfen içerik bölümünü en az 20 karakter olacak şekilde doldurunuz."]
    },
    slug: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    likeCount: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ],
    answerCount: {
        type: Number,
        defult: 0
    },
    answers: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Answer"
        }
    ]
});

QuestionSchema.pre("save", function (next) {
    if (!this.isModified("title")) {
        next()
    }
    this.slug = this.makeSlug();
    next()
})
QuestionSchema.methods.makeSlug = function () {
    return slugify(this.title, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true
    })


}

module.exports = mongoose.model("Question", QuestionSchema);