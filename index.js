// Connect to the MySQL Database
const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');

const con = mysql.createConnection(
    {
        user:'root',
        password:'Nyr@2021',
        database:'organization',
    },
    console.log('Connected to the organization database.')
);

const mainMenu = [
    'View All Departments',
    'View All Roles',
    'View All Employees',
    'Add A Department',
    'Add A Role',
    'Add An Employee',
    'Update An Employee Role',
    'Update Employee Manager',
    'View Employees By Manager',
    'View Employees By Department',
    'Remove Employee',
    'Remove Role',
    'Remove Department',
    'Total Utilized Budget'
]
    
const promptUser = () => {
    return inquirer.prompt(
        [
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: mainMenu
            }
        ]
    )
    .then(answer=>chooseCase(answer))
    .catch(error=>console.log(error)); 
}

const addDept = ()=>{
    return inquirer.prompt(
        [
            {
                type:'input',
                name:'name',
                message: 'Enter the department name to add:'
            }
        ]
    );
}

const addRole = ()=>{
    const deptArray = [];
    con.query(`SELECT * FROM department;`,(err,rows)=>{
        for (let i=0;i<rows.length;i++){
            deptArray.push(rows[i].name);
        }
    });    
    return inquirer.prompt(
        [
            {
                type:'input',
                name:'name',
                message: 'Enter the role name to add:'
            },
            {
                type:'input',
                name: 'salary',
                message: 'Enter the salary for the role:'
            },
            {
                type:'list',
                name:'department',
                message: 'Choose a department:',
                choices: deptArray
            }
        ]
    );
}

getDeptID = (answer)=> {
    con.promise().query(`SELECT * FROM department WHERE name=?`,answer.department)
    .then(([rows,fields])=>{
        const dept = rows[0].id;
        const params=[answer.name,answer.salary,dept]
        console.log(params);
        con.query(`INSERT INTO role (title,salary,department_id) VALUES (?,?,?);`,params ,(err,rows)=>{
            promptUser();
        });
    }); 
};

const addEmployee = ()=>{
    const roleArray = [];
    const managerArray =[];
    con.query(`SELECT title FROM role;`,(err,rows)=>{
        for (let i=0;i<rows.length;i++){
            roleArray.push(rows[i].title);
        }
    }); 
    con.query(`SELECT CONCAT(first_name,' ',last_name) AS name FROM employee;`,(err,rows)=>{
        for (let i=0;i<rows.length;i++){
            managerArray.push(rows[i].name);
        }
    });     
    return inquirer.prompt(
        [
            {
                type:'input',
                name:'first_name',
                message: "Enter the employee's first name:"
            },
            {
                type:'input',
                name:'last_name',
                message: "Enter the employee's last name:"
            },
            {
                type:'list',
                name:'role',
                message: 'Choose a role:',
                choices: roleArray
            },
            {
                type:'list',
                name:'manager',
                message: 'Choose a manager:',
                choices: managerArray
            }
        ]
    );
}

getEmployee = (answer)=> {
    console.log(answer);
    con.promise().query(`SELECT * FROM role WHERE title=?`,answer.role)
    .then(([rows,fields])=>{
        const role = rows[0].id;
        let managerParams=answer.manager.split(" ");
        console.log(managerParams);
        con.promise().query(`SELECT * FROM employee WHERE ((first_name = ?) AND (last_name = ?))`,managerParams)
        .then(([rows,field])=>{
            console.log(rows);
            const manager = rows[0].id;
            const params=[answer.first_name,answer.last_name,role,manager]
            console.log(params);
            con.query(`INSERT INTO employee (first_name,last_name,role_id, manager_id) VALUES (?,?,?,?);`,params ,(err,rows)=>{
                promptUser();
            });
        });
    });  
};
const chooseCase = (answer)=>{
    let choice = answer.choice;
    switch(choice) {
        case "View All Departments":
        
        con.query(`SELECT id,department.name as department
        FROM department`,(err,rows)=>{
            console.table(rows);
            promptUser();
        });
        break;

        case "View All Roles":
        con.query(`SELECT role.id as 'role id', role.title as 'job title', department.name as department, role.salary
        FROM role
        INNER JOIN department ON department.id =role.department_id;`,(err,rows)=>{
            console.table(rows);
            promptUser();
        });
        break;
        case "View All Employees":
        
        con.query(`SELECT employee.id,employee.first_name,employee.last_name,role.title as 'job title',department.name as department, role.salary, CONCAT(e.first_name,' ',e.last_name) AS manager
        FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department on department.id = role.department_id  LEFT JOIN employee e ON employee.manager_id=e.id ORDER BY id;`,(err,rows)=>{
            console.table(rows);
            promptUser();
        });
        break;

        case "Add A Department":
            addDept().then(answer=>{
                console.log(answer.name);
                con.query(`INSERT INTO department (name) VALUES (?);`,answer.name ,(err,rows)=>{
                    console.table(rows);
                    promptUser();
                });
            });
        break;

        case "Add A Role":
            addRole().then(answer=>{
                getDeptID(answer);
            });
        break;

        case "Add An Employee":
            addEmployee().then(answer=>{
                getEmployee(answer);
            })
        break;

        case "View All Employees By Manager":
        console.log("View All Employees By Manager");
        break;

        case "Remove Employee":
        console.log("Remove Employee");
        break;

        case "Update Employee Role":
        console.log("Update Employee Role");
        break;

        case "Update Employee Manager":
        console.log("Update Employee Manager");
        break;

        case "Remove Role":
        console.log("Remove Role");
        break;

        default:
        console.log("Not Valid");
    }
}

promptUser();