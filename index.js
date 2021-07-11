// Connect to the MySQL Database
const mysql = require('mysql2');
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
    'View All Employees',
    'View All Employees By Department',
    'View All Employees By Manager',
    'Add Employee',
    'Remove Employee',
    'Update Employee Role',
    'Update Employee Manager',
    'View All Roles',
    'Add Role',
    'Remove Role',
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
}

const chooseCase = (answer)=>{
    let choice = answer.choice;
    switch(choice) {
        case "View All Employees":
        console.log("View All Employees");
        db.query(`SELECT * FROM employee`,(err,rows)=>{
            console.log(rows)
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

        case "View All Roles":
        console.log("View All Roles");
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
    .then(answer=>chooseCase(answer))
    .catch(error=>console.log(error));