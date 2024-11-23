const mongoose=require('mongoose')

const userScehma=mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Fullname cannot be blank']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be blank'],
        unique: true, // Ensures the email is unique in the database
        match: [/.+@.+\..+/, 'Please enter a valid email address'] // Regex to validate email format
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
})

module.exports=mongoose.model('user_news',userScehma);