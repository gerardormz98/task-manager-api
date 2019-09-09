const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0)
                throw new Error('Age must be a positive number');
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error('Invalid email format');
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate: function(value) {
            if (value.toLowerCase().includes('password'))
                throw new Error('Invalid password');
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

// Virtual property to set relationship. Creates a property that is not stored in the database, it's just for mongoose.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// This method will be accessed in the instance (that's why it's a normal function, to be able to access 'this').
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    
    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
}

// Overwriting toJSON method to manipulate what we return everytime a user is sent back to the client
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;
    delete userObject.avatar;

    return userObject;
}

// This method will be accesed directly in the class (it's static)
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user)
        throw new Error('Email or password is incorrect.');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) 
        throw new error('Email or password is incorrect.');
    
    return user;
}

// Hash the plain text password before saving
userSchema.pre("save", async function (next) { //Normal function as arrow functions does not bind "this".
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next(); //Continue normal flow.
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;