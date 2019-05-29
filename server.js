/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Robert Dominato__________ Student ID: rdominato@myseneca.ca__ Date: _2019/04/13____
*
* Online (Heroku) Link: https://calm-depths-41440.herokuapp.com/_____________________
*
********************************************************************************/

var dataService = require("./data-service.js");
var dataServiceAuth = require("./data-service-auth.js");
var clientSessions = require("client-sessions");
var express = require("express");
var app = express();
var path = require("path");
var multer = require("multer");
const fs = require('fs');
const bodyParser = require('body-parser');
const exphbs = require("express-handlebars");

app.engine('.hbs', exphbs({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
           }
    }}));
app.set('view engine', '.hbs');

app.use(clientSessions({
    cookieName: "session",
    secret: "helloDarkness",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
   });

function ensureLogin(req,res,next)  {
    if(!req.session.user) {
        res.redirect("/login");
    }
    else {
        next();
    }
}   

app.use(bodyParser.urlencoded({ extended: true }));

var HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart() {
    console.log("Express HTTP server listening on:" + HTTP_PORT );
}

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req,file,cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

app.use(express.static('public')); 

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });

app.get("/", function(req,res) {
    res.render('home');
});

app.get("/about", function(req,res) {
    res.render('about');
});

app.get("/employees/add",ensureLogin, function(req,res) {
    dataService.getDepartments()
    .then(data => res.render("addEmployee", {departments: data}))
    .catch(data => res.render("addEmployee", {departments: []}))
});

app.get("/departments/add",ensureLogin, function(req,res){
    res.render('addDepartment');
});

app.get("/images/add",ensureLogin, function(req,res) {
    res.render('addImage');
});

app.get("/employees",ensureLogin, function(req,res){
    if(req.query.status) {
        dataService.getEmployeesByStatus(req.query.status).then(function(data){
            res.render('employees', {employees: data});
        }).catch(function(err){
            res.render("employees",{message:err});
        });
    } else if(req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department).then(function(data){
            res.render('employees', {employees: data});
        }).catch(function(err){
            res.render('employees',{message:err});
        });
    } else if(req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager).then(function(data){
            res.render('employees', {employees: data});
        }).catch(function(err){
            res.render("employees",{message: err});
        });
    }
    else {
    dataService.getAllEmployees().then(function(data){
        res.render("employees", {employees: data});
    }).catch(function(err){
        res.render("employees",{ message:"No Results"});
    })
    }
})

app.get("/departments",ensureLogin, function(req,res){
    dataService.getDepartments().then(function(data){
        res.render('departments', {departments: data});
    }).catch(function(err){
        res.render({message:"No Results"});
    })
})

app.post("/images/add",ensureLogin, upload.single("imageFile"), function(req,res){
    res.redirect("/images");
})

app.post("/employees/add",ensureLogin, function(req,res){
    dataService.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    })
});

app.post("/departments/add",ensureLogin, function(req,res){
    dataService.addDepartment(req.body).then((data) => {
        res.redirect("/departments");
    }).catch((err) => {
        console.log(err);
    })
});


    app.get("/employee/:empNum",ensureLogin, (req, res) => {
        // initialize an empty object to store the values
        let viewData = {};
        dataService.getEmployeeByNum(req.params.empNum)
        .then((data) => {  
        viewData.data = data; //store employee data in the "viewData" object as "data"
        }).catch(()=>{
        viewData.data = null; // set employee to null if there was an error
        }).then(dataService.getDepartments)
        .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
       
        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching
        // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
        if (viewData.departments[i].departmentId == viewData.data.department) {
        viewData.departments[i].selected = true;
        }
        }
        }).catch(()=>{
        viewData.departments=[]; // set departments to empty if there was an error
        }).then(()=>{
        if(viewData.data == null){ // if no employee - return an error
        res.status(404).send("Employee Not Found");
        }else{
        res.render("employee", { viewData: viewData }); // render the "employee" view
        }
        });
       });


app.get("/department/:departmentId",ensureLogin,function(req,res) {
    dataService.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department", {departments: data});
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    })
})

app.get("/images", ensureLogin, function(req,res){
    fs.readdir("./public/images/uploaded", function(err,files){
        if(err) throw error;
        res.render("images", { data: files});
    })
})

app.post("/employee/update", ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body).then((data) => {
    res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    })
   });
   
app.post("/department/update",ensureLogin, (req,res) => {
    dataService.updateDepartment(req.body).then((data) => {
        res.redirect("/departments");
    }).catch((err) => {
        console.log(err);
    })
});

app.get("/employees/delete/:empNum",ensureLogin,  (req,res) => {
    dataService.deleteEmployeeByNum(req.params.empNum)
    .then(() => res.redirect("/employees"))
    .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"))
})

app.get("/login", (req,res) => {
    res.render("login");
})

app.get("/register", (req,res) => {
    res.render("register");
})

app.post("/register", (req,res) => {
    dataServiceAuth.registerUser(req.body)
    .then(() => res.render("register", {successMessage : "User Created"}))
    .catch((err) => res.render("register", {errorMessage: err, userName: req.body.userName}))
})

app.post("/login", (req,res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .then(user => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
          }
          res.redirect('/employees');
    }).catch(err => {
        res.render("login", {errorMessage: err,userName:req.body.userName})
    })
})

app.get("/logout", (req,res) => {
    req.session.reset();
    res.redirect("/login");
})

app.get("/userHistory", ensureLogin, (req,res) => {
    res.render("userHistory");
})

app.use(function(req,res) {
    res.status(404).send("<img src='https://www.news4daily.com/wp-content/uploads/2018/09/404-error.jpg'/>");
})

dataService.initialize()
.then(dataServiceAuth.initialize)
.then(() => app.listen(HTTP_PORT, onHTTPStart))
.catch((err) => console.log(err));