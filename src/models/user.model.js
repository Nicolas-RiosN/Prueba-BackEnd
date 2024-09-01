import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    first_name:{
        type:String
    },
    last_name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        trim:true
    },
    age:{
        type:Number
    },
    password:{
        type:String
    },
    role:{
        type:String,
        default:"user"
    },
    previousPasswords: { type: [String], default: [] },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
})

export default mongoose.model('User', userSchema)