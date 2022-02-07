loadHomePage();

function loadHomePage() {
    logged_in_username = check_login();
    friendlist_html = '';
    document.getElementById("myfilms").href = "user.html?username=" + logged_in_username;

    fetch_updates();
    fillInFriendList();
    fillInWantToSees();
    fillInUsername();
    fillInLatestRatings();
    updateNotifications();
    fillInFriendRequests();
}