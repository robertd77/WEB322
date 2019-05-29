const Sequelize = require('sequelize');
var sequelize = new Sequelize('de1eovgv1ru4fd', 'gfabvaekxshhcc', 'cf1ae1f83304106dc627e41fda757b1ab2b41a939081806cbcba018a3bb17465', {
    host: 'ec2-23-23-241-119.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: true
    }
   });

   const Employee = sequelize.define("employee", {
       employeeNum: {
           type: Sequelize.INTEGER,
           primaryKey: true,
           autoIncrement: true
       },
       firstName: Sequelize.STRING,
       lastName: Sequelize.STRING,
       email: Sequelize.STRING,
       SSN: Sequelize.STRING,
       addressStreet: Sequelize.STRING,
       addressCity: Sequelize.STRING,
       addressState: Sequelize.STRING,
       addressPostal: Sequelize.STRING,
       maritalStatus: Sequelize.STRING,
       isManager: Sequelize.BOOLEAN,
       employeeManagerNum: Sequelize.INTEGER,
       status: Sequelize.STRING,
       department: Sequelize.INTEGER,
       hireDate: Sequelize.STRING
   });

   const Department = sequelize.define("department", {
        departmentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        departmentName: Sequelize.STRING
   });

   Department.hasMany(Employee, {
       foreignKey: 'department'
   });

module.exports.initialize = function() {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
       .then(() => resolve ("Tables Synced"))
       .catch(err => reject("Error Syncing to Database"));    
       });
}

module.exports.getAllEmployees = function() {
    return new Promise(function (resolve, reject) {
        Employee.findAll()
        .then((data) => resolve(data))
        .catch((err) => reject("No Results Returned"));
       });
}

module.exports.getManagers = function() {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
            isManager: true
        }
    }) 
        .then(data => resolve(data))
        .catch(err => ("No Results Returned"))
       });
}

module.exports.getDepartments = function() {
    return new Promise(function (resolve, reject) {
        Department.findAll() 
        .then(data => resolve(data))
        .catch(err => reject("No Results Returned"))
       });
}

module.exports.addEmployee = function(employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(let i in employeeData) {
            if(employeeData[i] == "") {
                employeeData[i] = null;
            }
        }
        Employee.create(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        })
        .then(data => resolve("Employee Added"),
        console.log("Employee Added"))
        .catch(err => reject("Unable to Create Employee"),
        console.log("Unable to Add"))
       });
}

module.exports.getEmployeesByStatus = (stat) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
            status: stat
        }
    }) 
        .then(data => resolve(data))
        .catch(err => reject("No Results Returned"))
    });
}

module.exports.getEmployeesByDepartment = (dept) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
            department: dept
        }
    })
        .then(data => resolve(data))
        .catch(er => reject("No Results Returned"))
       });
}

module.exports.getEmployeesByManager = (manager) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
            employeeNum: manager
        }
    }) 
        .then(data => resolve(data))
        .catch(err => reject("No Results Returned"))
       });
}

module.exports.getEmployeeByNum = (empNum) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeNum: empNum
            }
        }) 
        .then(data => resolve(data[0]))
        .catch(err => reject("No Results Returned"))
       });
}

module.exports.updateEmployee = (employeeData) => {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(let i in employeeData) {
            if(employeeData[i] == "") {
                employeeData[i] = null;
            }
        }
        Employee.update(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }) 
        .then(resolve("Employee Update Successful"))
        .catch(err => reject("Unable to Update Employee"))
       });
}

module.exports.addDepartment = function(departmentData) {
    return new Promise(function (resolve, reject) {
        for(let i in departmentData) {
            if(departmentData[i] == "") {
                departmentData[i] = null;
            }
        }
        Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        })
        .then(resolve("Department Added"))
        .catch(err => reject("Unable to Create Department"))
       });
}

module.exports.updateDepartment = function(departmentData) {
    return new Promise (function(resolve,reject){
        for(let i in departmentData) {
            if(departmentData[i] == "") {
                departmentData[i] = null;
            }
        }
        Department.update({
            departmentName: departmentData.departmentName
        },{
            where:{departmentId: departmentData.departmentId}
        }).then(data => resolve("Department Updated"))
        .catch(err => reject("Dept. Update Failed"))
    })
}

module.exports.getDepartmentById = (id) => {
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: {
                departmentId: id
            }
        }) 
        .then(data => resolve(data[0]))
        .catch(err => reject("No Results Returned"))
       });
}

module.exports.deleteEmployeeByNum = (empNum) => {
    return new Promise(function (resolve,reject){
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        })
        .then(() => {resolve("Employee Deleted")})
        .catch(() => {reject("Error: Deletion Failed")})
    })
}