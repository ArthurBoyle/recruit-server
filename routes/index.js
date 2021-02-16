var express = require('express');
var router = express.Router();

const {UserModel} = require("../db/models");
const md5 = require("blueimp-md5");
const filter = {password: 0, __v: 0}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

//test
// router.post("/register", function (req, res) {
//   const {username, password} = req.body;
//   if(username === "admin") {
//     res.send({code: 1, msg: "该用户已存在"});
//   } else {
//     res.send({code: 0, data: {id: "123", username, password}});
//   }
// })

//注册的路由
router.post("/register", function (req, res) {
  const {username, password, type} = req.body;
  UserModel.findOne({username}, function (error, user) {
    if(user) {
      res.send({code: 1, msg: "此用户已存在"});
    } else {
      new UserModel({username, password: md5(password), type}).save(function (error, user) {
        res.cookie("userid", user._id, {maxAge: 1000*60*60});
        const data = {username, type, _id: user._id};
        res.send({code: 0, data});
      })
    }
  })
})

//登录的路由
router.post("/login", function (req, res) {
  const {username, password} = req.body;
  UserModel.findOne({username, password: md5(password)}, filter, function (error, user) {
    if(user) {
      res.cookie("userid", user._id, {maxAge: 1000*60*60});
      res.send({code: 0, data: user})
    } else {
      res.send({code: 1, msg: "用户名或密码不正确！"})
    }
  })
})

module.exports = router;
