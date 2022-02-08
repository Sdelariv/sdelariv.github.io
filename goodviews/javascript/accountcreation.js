
function tryAccountCreation() {
    var new_username = document.getElementById("new_username_input").value;
    var new_password = document.getElementById("new_password_input_1").value;
    var confirm_password = document.getElementById("new_password_input_2").value;
    var new_first_name = document.getElementById("new_first_name_input").value;
    var new_last_name = document.getElementById("new_last_name_input").value;

    if (new_username === '') {
        document.getElementById("create_account_response").innerHTML = "No username supplied";
        return
    }

    if (new_password === '') {
        document.getElementById("create_account_response").innerHTML = "No password supplied";
        return
    }

    if (confirm_password === '') {
        document.getElementById("create_account_response").innerHTML = "No confirmation password supplied";
        return
    }

    if (new_password !== confirm_password) {
        document.getElementById("create_account_response").innerHTML = "Confirmation password doesn't match password";
        return
    }

    console.log('trying to create account');

    var new_user = {
        "username":new_username,
        "passwordHash":new_password,
        "firstName":new_first_name,
        "lastName":new_last_name
    }

    fetch(server_url + "/user/add", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(new_user)
    }).then(resp => {
        if (resp.status === 200) {
            document.getElementById("create_account_response").innerHTML = "ACCOUNT SUCCESFULLY CREATED!<br> REDIRECTING TO LOGIN";

            delay(2000).then(() => window.location.href="login.html");
        } else if (resp.status === 405) {
            document.getElementById("create_account_response").innerHTML = "Username already exists";
        } else {
            document.getElementById("create_account_response").innerHTML = "Account creation failed";
        }
    })

}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
