// Connect to the MySQL Database
const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');

const db = mysql.createConnection(
    {
        user:'root',
        password:'Nyr@2021',
        database:'organization'
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

const chooseCase = (answer)=>{
    let choice = answer.choice;
    switch(choice) {
        case "View All Departments":
        
        db.query(`SELECT id,department.name as department
        FROM department`,(err,rows)=>{
            console.table(rows);
            promptUser();
        });
        break;

        case "View All Roles":
        db.query(`SELECT role.id as 'role id', role.title as 'job title', department.name as department, role.salary
        FROM role
        INNER JOIN department ON department.id =role.department_id;`,(err,rows)=>{
            console.table(rows);
            promptUser();
        });
        break;
        case "View All Employees":
        
        db.query(`SELECT employee.id,employee.first_name,employee.last_name,role.title as 'job title',department.name as department, role.salary, CONCAT(e.first_name,' ',e.last_name) AS manager
        FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department on department.id = role.department_id  LEFT JOIN employee e ON employee.manager_id=e.id ORDER BY id;`,(err,rows)=>{
            console.table(rows);
            promptUser();
        });
        break;

        case "View All Employees By Department":
        console.log("View All Employees By Department");
        break;

        case "View All Employees By Manager":
        console.log("View All Employees By Manager");
        break;

        case "Add Employee":
        console.log("Add Employee");
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

        case "Add Role":
        console.log("Add Role");
        break;

        case "Remove Role":
        console.log("Remove Role");
        break;

        default:
        console.log("Not Valid");
    }
}

promptUser()