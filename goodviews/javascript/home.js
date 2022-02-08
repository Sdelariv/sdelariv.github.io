check_login(loadHomePage);

function loadHomePage() {
        fetch_updates();
        fillInFriendList();
        fillInWantToSees();
        fillInUsername();
        fillInLatestRatings();
        updateNotifications();
        fillInFriendRequests();
}

