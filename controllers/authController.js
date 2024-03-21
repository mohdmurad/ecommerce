import userModel from "../models/userModel.js";
import orderModel from '../models/orderModel.js'
import {comparePassword, hashPassword} from '../helpers/authHelper.js'
import  jwt  from "jsonwebtoken";

export const registerController = async(req, res)=>{
try {
    const {name, email, password,phone, address, answer}  = req.body;
    // check validations
    if(!name){
        return res.send({message: "Name is Required"})
    }
    if(!email){
        return res.send({message: "email is Required"})
    }
    if(!password){
        return res.send({message: "password is Required"})
    }
    if(!phone){
        return res.send({message: "phone is Required"})
    }
    if(!address){
        return res.send({message: "address is Required"})
    }
    if(!answer){
        return res.send({message: "answer is Required"})
    }

    const exixtingUser = await userModel.findOne({email})
    if(exixtingUser){
         return res.status(200).send({
            success:false,
            message:'Already Register please login'
         })
    }
    // register user
    const hashedPasssword = await hashPassword(password)
    //save
    const user = await new userModel({
        name,
        email,
        phone,
        address,
        password:hashedPasssword,
        answer
    }).save()

    res.status(201).send({
        success:true,
        message:'User Register Successfully',
        user
    })
} catch (error) {
    console.log(error)
    res.status(500).send({
        success:false,
        message:'error in registration',
        error
    })
}
}




// login
export const loginController =  async(req, res)=>{
    try {
        const {email, password}  = req.body;

    // validation 
    if(!email || !password){
        return res.satus(404).send({
            success:false,
            message:'invalid email or password'
        })
    }
    //check user
    const user = await userModel.findOne({email})
    if(!user){
        return res.status(404).send({
            success: false,
            message:"email is not registered"
        })
    }

    const match  = await comparePassword(password, user.password)
    if(!match){
        return res.status(404).send({
            success: false,
            message:"invalid credentials"
        })
    }

    //token
    const token   = await jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
        expiresIn: "7d",
    })
    res.status(200).send({
        success:true,
        message:"login successfull",
        user:{
            name:user.name,
            email:user.email,
            phone:user.phone,
            address:user.address,
            role: user.role,
        },
        token,
    })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'error in login',
            error,
        })
    }
}





// forgot password 

export const forgotPasswordController = async (req, res) => {
    try {
      const { email, answer, newPassword } = req.body;
      if (!email) {
        res.status(400).send({ message: "Emai is required" });
      }
      if (!answer) {
        res.status(400).send({ message: "answer is required" });
      }
      if (!newPassword) {
        res.status(400).send({ message: "New Password is required" });
      }
      //check
      const user = await userModel.findOne({ email, answer });
      //validation
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Wrong Email Or Answer",
        });
      }
      const hashed = await hashPassword(newPassword);
      await userModel.findByIdAndUpdate(user._id, { password: hashed });
      res.status(200).send({
        success: true,
        message: "Password Reset Successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Something went wrong",
        error,
      });
    }
  };
  





export const test = async (req, res)=>{
    res.send("this is checking website")
}




//update prfole
export const updateProfileController = async (req, res) => {
    try {
      const { name, email, password, address, phone } = req.body;
      const user = await userModel.findById(req.user._id);
      //password
      if (password && password.length < 6) {
        return res.json({ error: "Passsword is required and 6 character long" });
      }
      const hashedPassword = password ? await hashPassword(password) : undefined;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
          name: name || user.name,
          password: hashedPassword || user.password,
          phone: phone || user.phone,
          address: address || user.address,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated SUccessfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error WHile Update profile",
        error,
      });
    }
  };


//orders
 export const getOrdersController = async (req, res) => {
   try {
     const orders = await orderModel
       .find({ buyer: req.user._id })
       .populate("products", "-photo")
       .populate("buyer", "name");
     res.json(orders);
   } catch (error) {
     console.log(error);
     res.status(500).send({
       success: false,
       message: "Error WHile Geting Orders",
       error,
     });
   }
 };




//all orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
     .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};


//order status
 export const orderStatusController = async (req, res) => {
   try {
     const { orderId } = req.params;
     const { status } = req.body;
     const orders = await orderModel.findByIdAndUpdate(
       orderId,
       { status },
       { new: true }
     );
     res.json(orders);
   } catch (error) {
     console.log(error);
     res.status(500).send({
       success: false,
       message: "Error While Updateing Order",
       error,
     });
   }
 };

