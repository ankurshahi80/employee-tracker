// Connect to the MySQL Database
const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');
// const { async } = require('rxjs');

// Create Connection
const con = mysql.createConnection(
    {
        user:'root',
        password:'Nyr@2021',
        database:'organization',
    },
    console.log('Connected to the organization database.')
);

// async function to return emp id from the concatanated name
const getEmpIdFromName = async (empName) => {
    const name = empName.split(" ");
    query="SELECT id FROM employee WHERE ((first_name = ?) AND (last_name = ?));";
    const[rows, field]=await con.promise().query(query,name);
    const id = rows[0].id;
    return id;
}

// async function to return the role id from role name
const getRoleIdFromRoleName = async (roleName) => {
    const role = roleName;
    query="SELECT id FROM role WHERE title = ?;";
    const [rows, field] = await con.promise().query(query,role);
    const id = rows[0].id;
    return id;
}

// async function to get a list of all the employee names from the database
const getEmpName = async () =>{
    const empArray = [];
    let query= "SELECT CONCAT(first_name,' ',last_name) AS name FROM employee;"
    const [rows,field] = await con.promise().query(query);
    for (let i=0;i<rows.length;i++){
        empArray.push(rows[i].name);
    }
    return empArray;
};

// async function to get a list of all the role titles from the database
const getEmpRole = async () =>{
    const roleArray = [];
    let query= "SELECT title FROM role;"
    const [rows,field] = await con.promise().query(query);
    for (let i=0;i<rows.length;i++){
        roleArray.push(rows[i].title);
    }
    return roleArray;
};

// main menu array
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

// Starting Prompt
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

// Adding a department prompt
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

// Adding a role prompt
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
        con.query(`INSERT INTO role (title,salary,department_id) VALUES (?,?,?);`,params ,(err,rows)=>{
            promptUser();
        });
    }); 
};

const addEmployee = async () => {
    
    const roleArray= await getEmpRole();
    const managerArray= await getEmpName();
        
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

const getEmployee = async (answer)=> {
    const role = await getRoleIdFromRoleName(answer.role);
    const manager = await getEmpIdFromName(answer.manager);  
    const params=[answer.first_name,answer.last_name,role,manager];
    let query = `INSERT INTO employee (first_name,last_name,role_id, manager_id) VALUES (?,?,?,?);`;
    con.query(query,params);    
    promptUser();
};

const updateRole = async ()=> {
    // get the names of the existing empoyees from the database
    // use await to populate the variable
    const emp = await getEmpName();

    // get the titles of the exisitng roles from the database
    // use await to populate the variable
    const role= await getEmpRole();

    // prompt the user to select the employee and the new role
    return inquirer
        .prompt([
            {
                type: "list",
                name: "emp",
                message: "Select the employee to update:",
                choices: emp
            },
            {
                type: "list",
                name: "role",
                message: "Select the employee role.",
                choices: role
            }
        ]).
        then(answer=>{

            // pass the user response to write function to update the new role.
            updateNewRole(answer);
        })
}

const updateNewRole = async (answer) =>{
    
    const empIdtoUpdate = await getEmpIdFromName(answer.emp);
    const getRoleToUpdate = await getRoleIdFromRoleName(answer.role);         

    // set the passing pararmeters for the perepared query
    let params=[getRoleToUpdate,empIdtoUpdate];
    // prepare query
    let query = `UPDATE employee SET role_id = ? WHERE id = ?;`;
    // call perepared query
    con.query(query,params);
    
    // send the user to the main menu
    promptUser();
}

const chooseCase = (answer)=>{
    let choice = answer.choice;
    switch(choice) {
        case "View All Departments":
            let deptQuery = `SELECT id,department.name as department FROM department;`;
            con.query(deptQuery,(err,rows)=>{
                console.table(rows);
                promptUser();
            });
        break;

        case "View All Roles":
            let roleQuery = `SELECT role.id as 'role id', role.title as 'job title', department.name as department, role.salary
            FROM role
            INNER JOIN department ON department.id =role.department_id;`
            con.query(roleQuery,(err,rows)=>{
                console.table(rows);
                promptUser();
            });
        break;
        
        case "View All Employees":
            let empQuery = `SELECT employee.id,employee.first_name,employee.last_name,role.title as 'job title',department.name as department, role.salary, CONCAT(e.first_name,' ',e.last_name) AS manager
                            FROM employee 
                            INNER JOIN role 
                            ON role.id = employee.role_id 
                            INNER JOIN department on department.id = role.department_id  
                            LEFT JOIN employee e ON employee.manager_id=e.id ORDER BY id;`;
            con.query(empQuery,(err,rows)=>{
                console.table(rows);
                promptUser();
            });
        break;

        case "Add A Department":
            addDept().then(answer=>{
                con.query(`INSERT INTO department (name) VALUES (?);`,answer.name ,(err,rows)=>{
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

        case "Update An Employee Role":
            updateRole();
        break;

        case "View All Employees By Manager":
        console.log("View All Employees By Manager");
        break;

        case "Remove Employee":
        console.log("Remove Employee");
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