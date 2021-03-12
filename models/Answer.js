const mongoose = require("mongoose");
const Question = require("./Question")
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    content: {
        type: String,
        required: [true, "Lütfen Bir Başlık Giriniz."],
        minlength: [10, "İçeriğiniz 10 karakterden fazla olması gerekmektedir."]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    question: {
        type: mongoose.Schema.ObjectId,
        ref: "Question",
        required: true
    }
})

AnswerSchema.pre("save", async function (next) {
    if (!this.isModified("user")) return next()

    try {
        const question = await Question.findById(this.question)

        question.answers.push(this._id)
        question.answerCount = question.answers.length;
        await question.save()
        next()
    }
    catch (err) {
        return next(err)
    }


})

module.exports = mongoose.model("Answer", AnswerSchema)