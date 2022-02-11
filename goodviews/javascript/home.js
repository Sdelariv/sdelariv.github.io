check_login(loadHomePage);

function loadHomePage() {
        fetch_updates();
        fillInFriendList();
        fillInWantToSees();
        fillInUsername();
        fillInLatestRatings();
        updateNotifications();
        fillInFriendRequests();
        document.getElementsByClassName("footer")[0].style.position = "relative";
}

