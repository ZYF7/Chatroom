const { json } = require('body-parser');

var app = require('express')();//引入express库
var http = require('http').Server(app);//将express注册到http中
var io = require('socket.io')(http);
var usocket = [];//全局变量保存每一个用户的`socket`实例。
var anonymitycount = 0;


// 登录的用户
var loginUsers =[];

//登录次数
var frequencyobj = {}

//当访问根目录时，返回Hello World
app.get('/', function (req, res) {
  // res.send("<h1>Hello World</h1>");
  res.sendFile(__dirname + '/index.html');
});
app.get('/login', function (req, res) {
  // res.send("<h1>Hello World</h1>");
  res.sendFile(__dirname + '/login.html');
});
app.get('/register', function (req, res) {
  // res.send("<h1>Hello World</h1>");
  res.sendFile(__dirname + '/register.html');
});

//新加入的内容的意思就是，当有新的socket连接成功之后，就打印一下信息。
io.on('connection', function (socket) {
  // 保存用户信息·
  let user = "";

  // 控制台打印
  console.log('a user connected');
  console.log('连接成功');


  // 登录状态验证=========================
  socket.on("loginstate", function (n) {
    console.log(loginUsers);
    console.log(n);
    console.log("用户们" + loginUsers.includes(n));

    if (loginUsers.includes(n)) {
      socket.emit("loginreturn", 1);
      console.log("登录了");
      //在线人数+list
      var newloginUsers = JSON.stringify(loginUsers);
      io.emit("countuser", newloginUsers);
    } else {
      socket.emit("loginreturn", 0);
    }
  })
  //退出=======================退出=========
  socket.on("exit7", function (data) {

    if (frequencyobj.hasOwnProperty(data)) {
      frequencyobj[data] = 0;
    } else {
      frequencyobj[data] = 0;
    }


    var index;
    index = loginUsers.indexOf(data);
    if (index == -1) {
      io.emit("exitR", data);
      io.emit("quit", data + "已退出群聊")
    } else {
      loginUsers.splice(index, 1);
      //在线人数+list
      var newloginUsers = JSON.stringify(loginUsers);
      io.emit("countuser", newloginUsers);
      io.emit("exitR", data);
      io.emit("quit", data + "已退出群聊")
    }
  })


  // 登录方法===========================登录方法================
  socket.on("login", function (data) {
    //处理数据=
    var obj = JSON.parse(data);
    console.log(obj.account);
    var uacc = obj.account;
    var upwd = obj.pwd;
    // 先判断是否登录了
    // if (loginUsers.includes(uacc)) {
    //   socket.emit("Rloing", 2);
    // } else {

    var fs = require('fs');
    fs.readFile('text.txt', function (error, data) {
      if (error) {
        console.log('读取文件失败了')
      } else {
        console.log(data.toString())
        var udata = data.toString();
        udata = JSON.parse(udata);
      }
      var isuser = false;
      for (let i = 0; i < udata.length; i++) {
        if (udata[i].account == uacc && udata[i].pwd == upwd) {
          isuser = true;
          console.log("数据库有11111111");
          break;
        }
      }
      // 成功
      if (isuser == true) {
        // 加入已经登录的用户列表
        if (loginUsers.includes(uacc)) {

        } else {
          loginUsers.push(uacc);
        }

        socket.emit("Rloing", uacc);

      } else {
        // 失败
        socket.emit("Rloing", 0);
      }

    })

    // }
    // console.log(udata2[0].pwd);

  });

  //注册方法============================注册方法=====================
  socket.on("register", function (data) {
    var stateU;
    var fs = require('fs');
    var mydata = JSON.parse(data);
    var olddata;
    var newData;
    //获取数据===========
    fs.readFile('./text.txt', function (error, data) {

      if (error) {
        console.log('读取文件失败了')
        socket.emit("registerR", 0);
      } else {
        stateU = false;
        console.log(data.toString())
        olddata = data.toString();
        olddata = JSON.parse(olddata);
        // 判断用户名是否重复！！！！！！！！！！！
        for (let i = 0; i < olddata.length; i++) {
          if (olddata[i].account == mydata.account) {
            stateU = true;
            console.log("用户已经存在,dfjsaljflsajflasjflsajf");
          }
        }

        if (stateU == true) {
          // 相应注册
          console.log("用户已经存在");
          socket.emit("registerR", 2);
        } else {
          //拼装数据======================拼装数据============
          // console.log("获取到的数据----------------------" + olddata);
          olddata.push(mydata);
          newData = JSON.stringify(olddata);
          console.log(newData);
          //写入==================写入====
          fs.writeFile('./text.txt', newData, function (error) {
            if (error) {
              console.log('写入失败');
              socket.emit("registerR", 0);
            } else {
              console.log('写入成功了');
              socket.emit("registerR", 1);
            }
          });
        }

      }
    })

  })

  // 加入次数显示
  // var jiaru=0;
  //登录次数
  var loginMun = 0;
  //监听join事件
  socket.on("join", function (name) {
    // usocket[name] = socket
    usocket.push(name);
    //发送到客户新加入
    if (name == null || name == "" || name == "null") {
      anonymitycount++;
      user = "匿名用户" + anonymitycount;
      io.emit("join", "匿名用户" + anonymitycount)
    } else {
      user = name;
    
      if (frequencyobj.hasOwnProperty(name)) {
        var n = frequencyobj[name];
        n = n + 1;
        frequencyobj[name] = n;
        loginMun = frequencyobj[name]
        console.log("20000"+loginMun);
      } else {
        frequencyobj[name] = 1;
        loginMun = frequencyobj[name]
        console.log("20000"+loginMun);
      }


      if (loginUsers.includes(name) && loginMun > 1) {
        var obj = {
          name: user,
          islogin: 1
        }
        obj = JSON.stringify(obj);
        io.emit("join", obj)
      } else if (loginUsers.includes(name) && loginMun <=1) {
        var obj = {
          name: user,
          islogin: 0
        }
        obj = JSON.stringify(obj);
        io.emit("join", obj)
      }
    }
  });
  socket.on("message", function (msg) {
    io.emit("message", msg) //将新消息广播出去
  })

  //   var isRefresh = false;
  //   var mytime = null;
  //   //检测刷新====================================================================================================================
  //   socket.on("Refresh", function (data) {
  //     // if (data == null) {
  //     isRefresh = true;
  //     // }
  //     // mytime = null;
  //     // mytime = setTimeout(function () {
  //     //   isRefresh = false;
  //     //   var index;
  //     //   index = loginUsers.indexOf(user);
  //     //   if (index == -1) {
  //     //   } else {
  //     //     loginUsers.splice(index, 1);
  //     //   }
  //     // }, 30000);
  //   });
  // socket.on("myclose",function(data){
  //   isRefresh = false;
  // });

  //当有客户端关闭浏览器，就触发该事件（disconnect事件名是固定的，不能改变）
  socket.on("disconnect", (data) => {
    console.log("客户已退出群聊");
    // if (user == null || user == "") {

    // } else {
    //   if (isRefresh == false) {
    //     var index;
    //     index = loginUsers.indexOf(user);
    //     if (index == -1) {
    //     } else {
    //       loginUsers.splice(index, 1);
    //     }
    //     io.emit("quit", user + "已退出群聊")
    //     //在线人数+list
    //     var newloginUsers = JSON.stringify(loginUsers);
    //     io.emit("countuser", newloginUsers);
    //   }
    // }
  })
});

//启动监听，监听3000端口
http.listen(3000, function () {
  console.log('listening on *:3000');
});