loadFilmPage();

function loadFilmPage() {
    logged_in_username = check_login();
    page_user = check_page_user();

    fetch_updates();
    fillInUsername();
    fillInFriendList();
    updateNotifications();
    fillInFriendRequests();

    console.log(logged_in_username);
    document.getElementById("user_username").innerText = logged_in_username;
    document.getElementById("user_name").innerText = "name here";
}

function check_page_user() {
    var username = 'Not found';

    if (queryString.includes("username=")) {
        username = getParameterByName("username");
    }

    return username;
}