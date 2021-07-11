const inquirer = require('inquirer');

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

inquirer
    .prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: mainMenu
        }
    ])
    .then(answer=>console.log(answer))
    .catch(error=>console.log(error));