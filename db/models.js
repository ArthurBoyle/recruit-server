/*
测试使用mongoose操作mongodb数据库
1. 连接数据库
  1.1. 引入mongoose
  1.2. 连接指定数据库(URL只有数据库是变化的)
  1.3. 获取连接对象
  1.4. 绑定连接完成的监听(用来提示连接成功)
2. 得到对应特定集合的Model
  2.1. 字义Schema(描述文档结构)
  2.2. 定义Model(与集合对应, 可以操作集合)
3. 通过Model或其实例对集合数据进行CRUD操作
  3.1. 通过Model实例的save()添加数据
  3.2. 通过Model的find()/findOne()查询多个或一个数据
  3.3. 通过Model的findByIdAndUpdate()更新某个数据
  3.4. 通过Model的remove()删除匹配的数据
 */

const mongoose = require("mongoose");
mongoose.connect(
    "mongodb://localhost:27017/recruit",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
const conn = mongoose.connection;
conn.on("connected", () => {
    console.log("MongoDB connect success !");
});

const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    type: {type: String, required: true},
    header: {type: String}, //头像名称
    post: {type: String},   //职位
    info: {type: String},   //个人或职位简介
    company: {type: String},
    salary: {type: String}
});
const UserModel = mongoose.model("user", userSchema);
exports.UserModel = UserModel;