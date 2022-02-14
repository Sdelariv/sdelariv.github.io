check_login(loadRatingPage);


function loadRatingPage() {
    fetch_rating(check_page_ratingId());
    fillInFriendList();
    fillInWantToSees();
    fillInUsername();
    fillInLatestRatings();
    updateNotifications();
    fillInFriendRequests();
    document.getElementsByClassName("footer")[0].style.position = "relative";
}

function fetch_rating(ratingId) {
    wall_html = '';
 // TODO: start over
    fetch(server_url + "/rating/findByIdforUser?ratingId=" + ratingId + "&username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( logUpdate => {
            console.log(logUpdate);
            wall_html = wall_html + createRatingUpdateHTML(logUpdate);
            if (logged_in_username !== '') document.getElementsByClassName("content-center")[0].innerHTML = wall_html;
        })
}

function check_page_ratingId() {
    var  ratingId = '';

    if (queryString.includes("ratingId=")) ratingId = getParameterByName("ratingId");

    return ratingId;
}