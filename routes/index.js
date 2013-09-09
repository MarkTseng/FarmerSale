
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

module.exports = function(app){
  app.get('/', function(req, res){
    Post.get(null, function(err, posts){
      if(err){
        posts = [];
      }
      res.render('index',{
        title: '首页',
	posts: posts,
      });
    });
  });

// ejs-locala layout : render 'layout' into 'boilerplate':
app.get('/layout',function(req,res,next){
  res.render('layout', { what: 'best', who: 'me', muppets: [ 'Kermit', 'Fozzie', 'Gonzo' ] });
});
app.get('/foo.js', function(req,res,next){
	res.sendfile('foo.js');
})

app.get('/foo.css', function(req,res,next){
	res.sendfile('foo.css');
})



  app.get('/reg', checkNotLogin);
  app.get('/reg', function(req, res){
    res.render('reg', {
      title: '用户注册',
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function(req, res){
    //檢驗用戶兩次輸入的口令是否一致
    if(req.body['password-repeat'] != req.body['password']){
      req.flash('error', '两次输入的口令不一致');
      return res.redirect('/reg');
    }

    //檢驗用戶兩次輸入的口令是否一致
    if(req.body['email-repeat'] != req.body['email']){
      req.flash('error', '两次输入的email不一致');
      return res.redirect('/reg');
    }
    
    // 生成口令的散列值
    var md5 = crypto.createHash('md5'); 
    var password = md5.update(req.body.password).digest('base64');

    var newUser = new User({
      name: req.body.username,
      password: password,
      email: req.body.email
    });

    //检查用户名是否存在
    User.get(newUser.name, function(err, user){
      if(user)
        err = 'Username already exists.';
      if(err){
        req.flash('error', err);
        return res.redirect('/reg');
      }
      //如果不存在则新增用户
      newUser.save(function(err){
        if(err){
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = newUser;
        req.flash('success', '注册成功');
        res.redirect('/');
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res){
    res.render('login', {
      title: '用户登入',
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res){
    //生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.body.username, function(err, user){
      if(!user){
        req.flash('error', '用户不存在');
        return res.redirect('/login');
      }
      if(user.password != password){
        req.flash('error', '用户口令错误');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', '登入成功');
      res.cookie('username', 'test_name', { maxAge: 60000 , signed: true })
      res.redirect('/');
    });
  });

  // forget_password
  app.get('/forget_password', checkNotLogin);
  app.get('/forget_password', function(req, res){
    res.render('forget_password', {
      title: 'forget password',
    });
  });

  app.post('/forget_password', checkNotLogin);
  app.post('/forget_password', function(req, res){

    //检查用户名是否存在
    User.getemail(req.body.username, req.body.email, function(err, user){
      if(!user){
        req.flash('error', '用户不存在');
        return res.redirect('/forget_password');
      }
      else
      {
        req.flash('success', user.password);
        return res.redirect('/forget_password');
      }
    });
  });
  
  
  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res){
    req.session.user = null;
    req.flash('success', '登出成功');
    res.redirect('/');
  });

  app.get('/u/:user', function(req, res){
    User.get(req.params.user, function(err, user){
      if(!user){
        req.flash('error', '用户不存在');
        return res.redirect('/');
      }
      Post.get(user.name, function(err, posts){
      	if(err){
	  req.flash('error', err);
	  return res.redirect('/');
	}
	res.render('user', {
	  title: user.name,
	  posts: posts
	});
      });
    });
  });
  
  app.post('/post', checkLogin);
  app.post('/post', function(req, res){
    var currentUser = req.session.user;
    var post = new Post(currentUser.name, req.body.post);
    post.save(function(err){
      if(err){
        req.flash('error', err);
	return res.redirect('/');
      }
      req.flash('success', '发表成功');
      res.redirect('/u/'+currentUser.name);
    });
  });
  
// google_map
  app.get('/google_map', checkNotLogin);
  app.get('/google_map', function(req, res){
    res.render('google_map');
  });  
  
};



function checkLogin(req, res, next){
  if(!req.session.user){
    req.flash('error', '未登录');
    return res.redirect('/');
  }
  next();
}

function checkNotLogin(req, res, next){
  if(req.session.user){
    req.flash('error', '已登入');
    return res.redirect('/');
  }
  next();
}

