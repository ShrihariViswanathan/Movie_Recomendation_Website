const username = document.getElementById("username");
const password = document.getElementById("password");
const button = document.getElementById('button_submit');




async function sendLoginRequest(event){
    
    
    event.preventDefault(); 
    const loginData = {
    "usernameFromInput" : username.value,
    "passwordFromInput" : password.value
}

    console.log(usernameFromInput, passwordFromInput);

    try{
        console.log(usernameFromInput, passwordFromInput)
        const response = await fetch("http://localhost:8000/account/login", {
            method : "POST",
            
            headers : {
                "Content-Type" : "application/json"
            },

            body: JSON.stringify(loginData)

        });

        if(response.ok){
            const data = await response.json();
            console.log("Login Successful");
            window.location.href = "/login_message.html";
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



button.addEventListener('click', sendLoginRequest);

