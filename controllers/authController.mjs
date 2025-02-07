import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.mjs';  
import { returnResponse } from '../utils/response.mjs'; 


export const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {

        let user = await User.findOne({ email });
        if (user) {
            return returnResponse(res, 400, 'User already exists');
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();


        const token = jwt.sign({ id: user._id }, 'love_me', { expiresIn: '1h' });

        return returnResponse(res, 201, { message: 'User registered', token });
    } catch (error) {
        next(error);
    }
};


export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
 
        const user = await User.findOne({ email });
        if (!user) {
            return returnResponse(res, 400, 'Invalid email or password');
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return returnResponse(res, 400, 'Invalid email or password');
        }


        const token = jwt.sign({ id: user._id }, 'love_me', { expiresIn: '1h' });

        return returnResponse(res, 200, { message: 'Logged in successfully', token });
    } catch (error) {
        next(error);
    }
};


export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); 
        return returnResponse(res, 200, user);
    } catch (error) {
        next(error);
    }
};
