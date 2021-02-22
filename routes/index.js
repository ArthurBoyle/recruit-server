var express = require('express');
var router = express.Router();

const {UserModel, ChatModel} = require("../db/models");
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
      res.send({code: 0, data: user});
    } else {
      res.send({code: 1, msg: "用户名或密码不正确！"});
    }
  })
})

//更新用户信息
router.post("/update", function (req, res) {
  const userid = req.cookies.userid;
  if(!userid) {
    return res.send({code: 2, msg: "请先登录"});
  }
  const user = req.body;
  UserModel.findByIdAndUpdate({_id: userid}, user, function (error, oldUser) {
    if(!oldUser) {
      res.clearCookie("userid");
      res.send({code: 1, msg: "请先登录"});
    } else {
      const {username, type, _id} = oldUser;
      const data = Object.assign({username, type, _id}, user);
      res.send({code: 0, data});
    }
  })
})

//获取用户信息
router.get("/user", function (req, res) {
  const userid = req.cookies.userid;
  if (!userid) {
    return res.send({code: 1, msg: "请先登录"});
  }
  UserModel.findOne({_id: userid}, filter, function (error, user) {
    if (user) {
      res.send({code: 0, data: user});
    }
  });
})

//获取用户列表
router.get("/userlist", function (req, res) {
  const {type} = req.query;
  UserModel.find({type}, filter, function (error, users) {
    if (type !== "boss" && type !== "expert") {
      res.send({code: 1, msg: "用户类型错误"});
    } else {
      res.send({code: 0, data: users});
    }
  })
})

//获取当前用户的聊天消息列表
router.get("/msglist", function (req, res) {
  const userid = req.cookies.userid;
  UserModel.find(function (error, userDocs) {

    // const users = {};
    // userDocs.map(doc => {
    //   users[doc._id] = {username: doc.usernama, header: doc.header}
    // });
    const users = userDocs.reduce((users, user) => {
      users[user._id] = {username: user.username, header: user.header};
      return users;
    }, {})

    ChatModel.find({"$or": [{from: userid}, {to: userid}]}, filter, function (error, chatMsgs) {
      res.send({code: 0, data: {users, chatMsgs}});
    })
  })
})

//修改指定消息为已读
router.post("/readmsg", function (req, res) {
  const from = req.body.from;
  const to = req.cookies.userid;
  ChatModel.update({from, to, read: false}, {read: true}, {multi: true}, function (error, doc) {
    console.log("/readmsg", doc);
    res.send({code: 0, data: doc.nModified});
  })
})

module.exports = router;
