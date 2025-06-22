import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    excels: {
        type: [String],
        default: []
    },
    follower: {
        type: [String],
        default: []
    },
    following: {
        type: [String],
        default: []
    },
},{
    timestamps: true
})

const User = mongoose.model('User',userSchema)

export default User