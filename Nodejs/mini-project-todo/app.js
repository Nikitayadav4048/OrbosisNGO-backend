import { log } from "console";
import readline from "readline" ; 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout 
});

const todos = [] ; 

const showMenu = () => {
  console.log("\n1. Add a Task");
  console.log("2. View Task");
  console.log("3. Exit");
  
  rl.question("choose an option :- " , handleInput) ; 
  
}

const handleInput = (Option) =>{
    if(Option === "1"){
        rl.question("Enter your Task:-   " , (task) => {
          todos.push(task) ; 
          console.log("Task added:-  " , task);
          showMenu() ; 
          
        })
    }
     else if(Option === "2"){
        console.log("\n ----------Your Todo List--------- ");
        console.log("");
        
        todos.forEach((task , index) => {
        console.log(`${index+1} . ${task}`);
        
        
    })
    console.log("----------------------------------------");
        showMenu()
    }else if(Option === "3"){
        console.log("Exiting");
        rl.close() ; 
        
    }else{
        console.log("Invalid option : Try Again");
        showMenu() ; 
    }
}

showMenu() ; 