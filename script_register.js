const username = document.getElementById("username_text");
const password = document.getElementById("password_text");
const confirmPassword = document.getElementById("confirm_password_text");
const button = document.querySelector('button');


const registerData = {
    "username" : username,
    "password" : password,
    "confrimPassword" : confirmPassword
}

async function sendRegisterRequest(event){
    event.preventDefault(); 

    try{
        const response = await fetch("http://localhost:8000/account/login", {
            method : "POST",
            
            headers : {
                "Content Type" : "application/json"
            },

            body: JSON.stringify(registerData)

        });

        if(response.ok){
            const data = await response.json();
            console.log("Register Successful");
            window.location.href = "/login.html";
        }

        else{
            const error = await response.json();
            console.error(error);
            alert("Error" + error.error);
        }

    } catch(error){
        console.error("Error occured" + error);
        alert(error);
    }
}


button.addEventListener('click', sendRegisterRequest);

