const { Router } = require('express')
const route = Router()
var crypto = require('crypto');
const { User } = require('../../db/index')
const AuthHelper = require('./authhelper')
const Auth = require('./auth')

route.use('/login',require('./login'))


route.post('/',AuthHelper.valiadteUserData,AuthHelper.checkUserExist,async (req,res)=>{
    console.log("================registartion procedure statred===========");
        const newUser = await User.create({
            username:req.body.user.username,
            email: req.body.user.email,
            hash: req.body.user.password
        })
        console.log("=============registartion procedure ended========");
        res.status(200).json({user: newUser.toAuthFor()});
        console.log("------------reposnse sended-------------");
  })
  /**
   * get current user 
   */
  route.get('/',Auth.required,async (req,res)=>{
    console.log("==========get current user api============")
    const user = await User.findOne({ where: { id: req.payload.id } })
        if(!user)
        { 
           res.sendStatus(401).json({"errors": {"msg": ["authfailed"]}}); 
        }
        else 
        {
          res.json({user: user.toAuthFor()});
        }
      })



















      setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  };

module.exports = route
/**
 *
 */
