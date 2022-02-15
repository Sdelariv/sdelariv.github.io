// GENERAL VARIABLES

var wall_html ='';
var logged_in_username = '';
var friendlist_html = '';
var ratingid_list = [];
const queryString = window.location.search;

const server_url = "http://localhost:8080";
const film_url = "film.html?filmId=";
const user_url = "user.html?username=";
const notifications_url = "";
const rating_url = "rating.html?ratingId=";
const home_url = "/home.html"


// METHODS


function check_login(loadPage) {
    console.log('check_login called');
    document.getElementsByClassName("footer")[0].style.position = "absolute";

    if (logged_in_username !== '') {
        console.log('hardcoded login');
        return logged_in_username
    }
    fetch(server_url + "/login/findIpsLogin")
        .then(resp => {
            if (resp.status === 404) {
                console.log('this user hasn\'t logged in yet');
                window.location.href="login.html";
            } else if (!resp.ok) {
                window.location.href="login.html";
            }
            else {
                return resp.json();
            }
        } )
        .then(Login => {
            console.log(Login.user.username + ' was still logged in');
            logged_in_username = Login.user.username;
            if (logged_in_username !== null) loadPage();

        }).catch((error) => {
    })
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}



function fetch_updates() {
    wall_html = '';

    fetch(server_url + "/timeline/" + logged_in_username)
        .then( resp => resp.json() )
        .then( logUpdates => {

            if (logUpdates.length === 0) document.getElementsByClassName("content-center")[0].innerHTML = '<p style="text-align:center">No updates yet.</p>'

            logUpdates.forEach( logUpdate => {
                console.log(logUpdate);

                if (logUpdate.type === 'FRIENDS') {
                    wall_html = wall_html + createFriendHTML(logUpdate);
                }

                if (logUpdate.type === 'RATING') {
                    wall_html = wall_html + createRatingUpdateHTML(logUpdate);
                    ratingid_list.push(logUpdate.rating.id);
                }

                if (logUpdate.type === 'COMMENT') {
                    wall_html = wall_html + createNewCommentHTML(logUpdate);
                    ratingid_list.push(logUpdate.rating.id);
                }

                if (logUpdate.type === 'WTS') {
                    wall_html = wall_html + createWtsHTML(logUpdate);
                }

                if (logged_in_username !== '') document.getElementsByClassName("content-center")[0].innerHTML = wall_html;
            })
        })
}

function tryLogin() {
    var username = document.getElementById("username_input").value;
    var password = document.getElementById("password_input").value;

    var user = {
        "username":username,
        "passwordHash":password
    }

    fetch(server_url + "/login/login", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(resp => {
        if (resp.status === 200) {
            window.location.href="home.html"
        } else {
            document.getElementById("login_response").innerHTML = "YOU SHALL NOT PASS! <br> <span style=\"font-size:smaller\">Wrong username/password</span>";
        }
    })
}

function logout() {
    logged_in_username = '';
    ratingid_list = [];

    window.location.href = "login.html"
}

function hideNotifications() {
    document.getElementById("notification_wrapper").style.display = 'none';
    document.getElementById("friendrequests_wrapper").style.display = 'none';
    document.getElementById("messages_wrapper").style.display = 'none';
}



// CREATE HTML

function updateNotifications() {
    console.log('updating notifications');
    fillInNotificationCount();
    fillInNotifications();
    setTimeout(updateNotifications,30000);
}

function fillInNotificationCount() {
    fetch(server_url + "/notifications/findNumberByUsername?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( count => {
            if (count > 0) document.getElementById("notifications_icon").innerHTML = '<p>' + count + '</p>'
            if (count === 0) document.getElementById("notifications_icon").innerHTML = '';
        })

    fetch(server_url + "/notifications/findNumberOfFriendRequestsByUsername?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( count => {
            if (count > 0) document.getElementById("friendrequest_icon").innerHTML = '<p>' + count + '</p>'
            if (count === 0) document.getElementById("friendrequest_icon").innerHTML = '';
        })
}

function fillInNotifications() {
    fetch(server_url + "/notifications/findTenNotifications?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( notifications => {
            var notification_html = '';
            previous_comment_notification = [];
            notifications.forEach(notification => {
                notification_html = notification_html + createNotificationString(notification, previous_comment_notification)
            })

            notification_html = notification_html + '<a href="' + notifications_url + '" style="color:black;font-size:small;text-shadow: none;text-decoration:none"> SEE MORE NOTIFICATIONS </a><br> <br>'

            document.getElementById("notification_wrapper").innerHTML =  notification_html
        })
}


function createNotificationString(notification, comment_notification) {
    html = ''

    // Differentiate between seen and not seen
    if (!notification.seen) html = html + '<p>'
    if (notification.seen) html = html + '<p class="seen">'

    // Middle
    if (notification.message.includes("has liked your rating")) {
        html = html + '<a href="' + user_url + notification.originUser.username + '">' + notification.originUser.username + '</a> liked <a href="' + rating_url + notification.rating.id + '"> your rating of ' + notification.rating.film.title + ' (' + notification.rating.film.releaseYear + ')</a>'
    } else if (notification.message.includes("commented on your")) {
        html = html + '<a href="' + user_url + notification.originUser.username + '">' + notification.originUser.username + '</a> commented on <a href="' + rating_url + notification.rating.id + '"> your rating of ' + notification.rating.film.title + ' (' + notification.rating.film.releaseYear + ')</a>'
    } else if (notification.message.includes("has replied to a")) {
        html = html + '<a href="' + user_url + notification.originUser.username + '">' + notification.originUser.username + '</a> commented on <a href="' + rating_url + notification.rating.id + '"> a conversation you are in </a>'
    } else if (notification.message.includes("has accepted your friendrequest")) {
        html = html + '<a href="' + user_url + notification.originUser.username + '">' + notification.originUser.username + '</a> has accepted your friendrequest'
    } else {
        html = html + notification.message
    }

    // Ending
    html = html + '</p>';

    return html;
}

function updateNotificationsAsSeen() {
    console.log('checking notifications');

    fetch(server_url + "/notifications/markAllAsSeen?username=" + logged_in_username,  {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }})
        .then(resp => {
            if (resp.status === 200) console.log('Notifications seen');
        })

    fillInNotificationCount();
    fillInNotifications()
}

function displayNotifications() {
    var notification_display = document.getElementById("notification_wrapper").style.display

    if (notification_display === 'block') {
        document.getElementById("notification_wrapper").style.display= 'none';
    } else {
        document.getElementById("notification_wrapper").style.display = 'block';
        document.getElementById("friendrequests_wrapper").style.display= 'none';
        document.getElementById("messages_wrapper").style.display='none';
        updateNotificationsAsSeen();
    }
}

//TODO: use
function fillInAllNotifications() {
    fetch(server_url + "/notifications/findNotifications?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( notifications => {
            var notification_html = '';
            notifications.forEach(notification => {
                notification_html = notification_html + createNotificationString(notification, previous_comment_notification)
            })

            document.getElementById("notification_wrapper").innerHTML =  notification_html
        })
}

function displayFriendrequests() {
    var friendrequest_display = document.getElementById("friendrequests_wrapper").style.display;

    if (friendrequest_display ==='block') {
        document.getElementById("friendrequests_wrapper").style.display='none';
    } else {
        document.getElementById("notification_wrapper").style.display = 'none';
        document.getElementById("friendrequests_wrapper").style.display= 'block';
        document.getElementById("messages_wrapper").style.display='none';
    }
}

function displayMessages() {
    var messages_display = document.getElementById("messages_wrapper").style.display;

    if (messages_display ==='block') {
        document.getElementById("messages_wrapper").style.display='none';
    } else {
        document.getElementById("notification_wrapper").style.display = 'none';
        document.getElementById("friendrequests_wrapper").style.display= 'none';
        document.getElementById("messages_wrapper").style.display='block';
    }
}

function fillInFriendRequests() {
    fetch(server_url + "/notifications/findFriendRequests?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( notifications => {
            var notification_html = '';
            notifications.forEach(notification => {
                console.log(notification);
                notification_html = notification_html + createFriendRequestString(notification);
            })

            document.getElementById("friendrequests_wrapper").innerHTML =  notification_html
        })
}

function createFriendRequestString(notification) {
    html = '';



    // Start
    if (!notification.seen) html = html + '<p>'
    if (notification.seen) _html = html + '<p style="color:grey">'

    html = html + '<a href="' + user_url + notification.friendRequest.friendA.username + '">' + notification.friendRequest.friendA.username + '</a> wants to be friends with you </p>';

    html = html + '<p><a onclick="acceptFriendship(\'' + notification.friendRequest.id + '\')">ACCEPT</a> | <a onclick="denyFriendship(\'' + notification.friendRequest.id + '\')"> DECLINE </u></p>'

    return html
}

function acceptFriendship(friendId) {
    console.log('accepting ' + friendId);

    fetch(server_url + "/friendship/acceptRequest?friendshipRequestId=" + friendId,  {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }})
        .then(resp => {
            if (resp.status === 200) console.log('Friend accepted');
            updateNotifications();
            fillInFriendList();
        })
}

function denyFriendship(friendId) {
    console.log('denying ' + friendId);

    fetch(server_url + "/friendship/denyFriendRequest?friendshipRequestId=" + friendId,  {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
        }})
        .then(resp => {
            if (resp.status === 200) console.log('Friendship denied');
            updateNotifications();
        })
}

function createFriendHTML(logUpdate) {
    friendA = 'unknownUser';
    friendB = 'unknownUser';
    you = '<a class="color_pink-purple" href="' + user_url + logged_in_username + '">' + logged_in_username + '</a>'

    if (logUpdate.user != null && logUpdate.user.username != null) friendA = '<a class="color_pink-purple" href="' + user_url + logUpdate.user.username+ '">' + logUpdate.user.username + '</a>'
    if (logUpdate.otherUser != null && logUpdate.otherUser.username != null)  friendB = '<a class="color_pink-purple" href="' + user_url + logUpdate.otherUser.username + '">' + logUpdate.otherUser.username + '</a>';

    if (friendA === you) friendA = '<span class="color_pink-purple"> you </span>';
    if (friendB === you) friendB = '<span class="color_pink-purple"> you </span>';

    html =  '<div class="update" style="background:var(--friend)">' +
        '<p class="update_date">' + createTimeStamp(logUpdate.dateTime) + '</p>' +
        '<p>'+ friendA + ' and '+ friendB + ' have become friends </p>' +
        '</div>'
    return html;
}

function createTimeStamp(dt) {
    var dateTime = new Date(dt);
    var now = new Date();
    var date_html = ''
    if (datesAreOnSameDay(dateTime,now)) {
        date_html = 'today';
    } else {
        date_html = dateTime.toLocaleDateString()
    }
    return date_html;
}

function datesAreOnSameDay(first, second) {
    if (first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate()) {
        return true;
    }
    return false;
}


function createNewCommentHTML(logUpdate) {
    var html = '';
    var rating = logUpdate.rating;
    var commentList = logUpdate.commentList;

    if (ratingid_list.includes(rating.id)) {
        return '';
    }

    var ratingUser = logUpdate.rating.user.username + '\'s'

    if (ratingUser === logged_in_username  + '\'s') ratingUser = 'your'

    if (logUpdate.user.username !== null) username = logUpdate.user.username;
    else username = 'UnknownUser';
    if ((username + '\'s') === ratingUser) ratingUser = 'their'

    // New Comment heading
    html = '<div class="update"  style="background:var(--comment)"><p><a class="color_pink-purple"  href="' + user_url + username + '">' + username + '</a> commented on ' + ratingUser + ' rating: <span style="font-size:11px;">' + getRatingString(logUpdate.rating.ratingValue) + '</span></p>'

    // Film info
    html = html + createFilmInfo(rating.film, logUpdate.userWantsToSee, logUpdate.userHasRated) + createLikesHTML(rating) + '</div>'

    // Adding comments
    html = html + createCommentHTML(commentList, rating.id);

    return html;
}

function createWtsHTML(logUpdate) {
    var html = '<div class="update" style="background:var(--wts)">'
        + '<p class="update_date">' + createTimeStamp(logUpdate.dateTime)  + '</p>'
        + '<p><a class="color_pink-purple" href="' + user_url + logUpdate.user.username + '"> ' + logUpdate.user.username + '</a> wants to see <a href="' + film_url + logUpdate.film.id + '">' + logUpdate.film.title + '</a></p>';


    // Add filminfo
    html = html + createFilmInfo(logUpdate.film, logUpdate.userWantsToSee, logUpdate.userHasRated) + '</div>'

    return html;
}


function createRatingUpdateHTML(logUpdate) {
    var rating = logUpdate.rating;
    var commentList = logUpdate.commentList;
    var html = '';

    if (!ratingid_list.includes(logUpdate.rating.id)) {
        // Rating or Review
        html = html + createRatingUpdateHeading(rating);

        // Film info
        html = html + createFilmInfo(rating.film, logUpdate.userWantsToSee, logUpdate.userHasRated) + createLikesHTML(rating) + '</div>'

        // Adding comments
        html = html + createCommentHTML(commentList, rating.id);
    }

    return html;
}

function createRatingUpdateHeading(rating) {
    var html = '';

    if (rating.review == null) {
        html = html +
            '<div class="update" style="background:var(--rating)">\n' +
            '                        <p class="update_date">' + createTimeStamp(rating.dateOfRating)+ '</p>' +
            '                        <p><a class="color_pink-purple" href="' + user_url + rating.user.username + '">' + rating.user.username + '</a> has rated a film <span class="color_pink-purple">' + getRatingString(rating.ratingValue) + '</span></p>\n'

    } else {
        html = html +
            '<div class="update" style="background:var(--rating)">\n' +
            '                        <p class="update_date">' + createTimeStamp(rating.dateOfReview) + '</p>' +
            '                        <p><a class="color_pink-purple" href="' + user_url + rating.user.username + '">' + rating.user.username + '</a> has reviewed a film </p>\n' +
            '<p><span class="color_pink-purple">' + getRatingString(rating.ratingValue) + '</span></p>' +
            '                        <p>"' + rating.review + '"</p>'
    }
    return html;
}

function createFilmInfo(film, userWantsToSee, userHasRated) {
    html =
        '                        <div class="poster">\n' +
        '                            <img src="' + film.posterUrl + '">\n' +
        '                        </div>\n' +
        '                        <h4 style="font-size:25px"><a href="' + film_url + film.id + '">' + film.title + ' <span style="font-size:small">(' + film.releaseYear + ')</a></span></h4>\n' +
        '                        <p style="margin-top:-25px; color:var(--pink-purple)"> <i>' + getNamesString(film.genres, 'genre') + '.</i></p>' +
        createRateAndWtsButtons(userWantsToSee, userHasRated, film) +
        '                        <p> Directed by <i>' + getNamesString(film.director, 'crewname') + '.</i></p>' +
        '                        <p> Written by <i>' + getNamesString(film.writer, 'crewname') + '.</i></p>'

    return html;
}

function createRateAndWtsButtons(userWantsToSee, userHasRated, film) {
    var button_html = ''
    var filmId = film.id;

    if (userHasRated === -1){
        button_html = button_html +
            '<button type="button" onclick="createRatePopup(logged_in_username,\'' + filmId + '\');">RATE</button>';
    } else {
        button_html = button_html +
            '<p class="your_rating" onclick="createRatePopup(logged_in_username,\'' + filmId + '\');">YOUR RATING: ' + getRatingString(userHasRated) +'</p>'
    }

    if (!userWantsToSee && userHasRated === -1) {
        button_html = button_html + createWTSButtonHTML(film.id);
    }

    return button_html;
}




function getRatingString(ratingValue) {
    var half_star = '<span class="fa fa-star-half-o"></span> '//'&#xf123; ';
    var star = '<span class="fa fa-star checked"></span> ' // '&#xf123; '; /* &#9733 */
    var empty_star = '<span class="fa fa-star-o"></span> '; // '&#9734
    var ratingString = ''

    if (ratingValue < 10) ratingString = empty_star + empty_star + empty_star + empty_star + empty_star;
    if (ratingValue >= 10) ratingString = half_star + empty_star + empty_star + empty_star + empty_star;
    if (ratingValue >= 20) ratingString = star + empty_star + empty_star + empty_star + empty_star;
    if (ratingValue >= 30) ratingString = star + half_star + empty_star + empty_star + empty_star;
    if (ratingValue >= 40) ratingString = star + star + empty_star + empty_star + empty_star;
    if (ratingValue >= 50) ratingString = star + star + half_star + empty_star + empty_star;
    if (ratingValue >= 60) ratingString = star + star + star + empty_star + empty_star;
    if (ratingValue >= 70) ratingString = star + star + star + half_star + empty_star;
    if (ratingValue >= 80) ratingString = star + star + star + star + empty_star;
    if (ratingValue >= 90) ratingString = star + star + star + star + half_star;
    if (ratingValue > 99) ratingString = star + star + star + star + star;

    return ratingString;
}

function getUsernames(users) {
    var counter = 0;
    var usernames = ''
    users.forEach(u => {
        if (counter < 3) {
            if (u.username === logged_in_username) usernames = usernames + 'you, ';
            else usernames = usernames + u.username + ', ';
        }
        if (counter === 3) usernames = usernames + "etc..."
    })
    return usernames.slice(0, -2) ;
}

function getNamesString(object, type) {
    var counter = 0;
    var string = '';

    object.forEach(o => {
        if (counter < 3) string = string + '<a href="search.html?' + type + '=' + o.name + '">' + o.name + "</a>, "
        if (counter === 3) string = string + "etc..."
        counter = counter + 1;
    })

    return string.slice(0,-2);
}



function createCommentHTML(commentList, ratingId) {
    var commentString = ''

    if (commentList.length === 0) {
        commentString = '<div class="comments" id="comments_' + ratingId + '"  style="background:var(--comments)" hidden>'
    }
    else {
        commentString = '<div class="comments" id="comments_' + ratingId + '"  style="background:var(--comments)">'
    }

    commentString = commentString + createCommentBody(commentList,ratingId) + '</div>'

    return commentString;
}

function createCommentBody(commentList, ratingId) {
    html = '<p style="font-size:smaller;text-align:center"> COMMENTS </p>' +
        createCommentsString(commentList) +
        createCommentBoxHTML(ratingId);

    return html;
}

function createCommentsString(commentList) {
    var commentString = '';
    commentList.forEach(c => {
        if (c != null && c.user != null && c.user.username != null) {
            var dateOfComment = new Date(c.dateTime);
            commentString = commentString +
                '<p><strong><a class="color_pink-purple" href="' + user_url + c.user.username + '">' + c.user.username + '</strong>:</a>  ' + c.comment +
                '<span style="font-size:x-small; color:#756581; float:right;"> ' + dateOfComment.toLocaleString() + '</span></p>'
        }
    });
    return commentString
}


function fillInFriendList() {
    friendlist_element = document.getElementById("friend_list_bar");
    if (friendlist_element === null) return

    friendlist_html = '';
    friendlist_element.innerHTML = '<p>No friends yet</p>';

    fetch(server_url + "/friendship/" + logged_in_username + "/friendlist")
        .then(resp => resp.json())
        .then(friends => {

            friends.forEach(friend => {

                fetch(server_url + "/rating/findNumberByUsername?username=" + friend.username)
                    .then(resp => resp.json())
                    .then(rating => {
                        friendlist_html = createFriendListHTML(friend, rating);
                        document.getElementById("friend_list_bar").innerHTML = friendlist_html;
                    })


            })
        })
}


function createFriendListHTML(friend, numberOfRatings) {
    friendlist_html = friendlist_html +
        '<p> &#9642; <a href="' + user_url + friend.username + '">' + friend.username + '</a> <span style="color:grey">(' + numberOfRatings + ' ratings) </span></p>'

    return friendlist_html
}


function fillInUsername() {
    document.getElementById("username_top").innerHTML = logged_in_username + '</br>'
}

function fillInLatestRatings() {
    var counter = 0;

    fetch(server_url + "/rating/latestRatings")
        .then( resp => resp.json() )
        .then( ratings => { ratings.forEach( rating => {
            console.log("FETCHING LATEST RATINGS")
            counter = counter + 1;

            if (counter < 4) {

                var title = rating.film.title;
                var releaseYear = rating.film.releaseYear;
                var directors = getNamesString(rating.film.director, 'crewname');
                var posterUrl = rating.film.posterUrl;
                var genres = getNamesString(rating.film.genres, 'genre');
                var average = rating.film.averageRating;

                document.getElementById("new_rating_poster_" + counter).setAttribute("src",posterUrl);
                document.getElementById("new_rating_director_" + counter).innerHTML = 'Directed by ' + directors;
                document.getElementById("new_rating_genres_" + counter).innerHTML = '<i>' + genres + '</i>';
                document.getElementById("new_rating_button_" + counter).innerHTML = '<span id="rate" onclick="createRatePopup(logged_in_username,\'' + rating.film.id + '\');">RATE</span><br>';
                document.getElementById("new_rating_title_" + counter).innerHTML = '<a href="' + film_url + rating.film.id + '">' + title + '<span style="font-size:small"> (' + releaseYear + ')</a></span>';
                if (average != null) document.getElementById("new_rating_average_" + counter).innerHTML = '<ul class="rating_average">' + getRatingString(average) + ' <br>(avg.rating)</ul>'
            }
        })
        })}

function hideNewlyRated() {
    for (counter = 1; counter <= 3; counter++) {
        document.getElementById("new_rating_poster_" + counter).setAttribute("src",'');
        document.getElementById("new_rating_director_" + counter).innerHTML = '';
        document.getElementById("new_rating_genres_" + counter).innerHTML = '';
        document.getElementById("new_rating_button_" + counter).innerHTML = '';
        document.getElementById("new_rating_title_" + counter).innerHTML =  '';
        document.getElementById("new_rating_average_" + counter).innerHTML = ''
    }
}

function fillInWantToSees() {
    var wts_1 = document.getElementsByClassName("wts_1");
    if (wts_1 === null || wts_1.length === 0) {
        return;
    }


    var counter = 0;
    emptyWTS();

    fetch(server_url + "/wantToSee/" + logged_in_username)
        .then( resp => resp.json() )
        .then( wantToSees => { wantToSees.forEach( wts => {

            counter = counter + 1;
            document.getElementById("wts_present").innerHTML = '';

            if (counter < 4) {

                title = wts.film.title;
                releaseYear = wts.film.releaseYear;
                directors = getNamesString(wts.film.director, 'crewname');
                posterUrl = wts.film.posterUrl;
                genres = getNamesString(wts.film.genres, 'genre');


                document.getElementById("wts_title_" + counter).innerHTML = '<a href="' + film_url + wts.film.id + '">' + title + '<span style="font-size:small"> (' + releaseYear + ')</a></span>'
                document.getElementById("wts_director_" + counter).innerHTML = 'Directed by ' + directors;
                document.getElementById("wts_genres_" + counter).innerHTML = '<i>' + genres + '</i>';
                document.getElementById("wts_poster_" + counter).setAttribute("src",posterUrl);
                document.getElementById("seenbutton_" + counter).innerHTML = '<span id="rate" href="" onclick="createRatePopup(logged_in_username,\'' + wts.film.id + '\');">RATE</span><br>';
                document.getElementById("delete_wts_" + counter).innerHTML = createDeleteWTSButton(wts.id, wts.film.id);
            }
            if (counter > 3) {
                document.getElementById("see_more_button").innerHTML = '<b><a href="user.html">SEE MORE</a></b>' // TODO: Fill in link to see more of wts's
            }
        })
        })}

function emptyWTS() {
    for (counter = 1; counter <= 3; counter++) {
        document.getElementById("wts_title_" + counter).innerHTML = ''
        document.getElementById("wts_director_" + counter).innerHTML = ''
        document.getElementById("wts_genres_" + counter).innerHTML = ''
        document.getElementById("wts_poster_" + counter).setAttribute("src",'');
        document.getElementById("seenbutton_" + counter).innerHTML =  ''
        document.getElementById("delete_wts_" + counter).innerHTML =''
        document.getElementById("see_more_button").innerHTML = ''
    }
}

function addToWantToSee(username,filmId) {
    console.log(username + ' wants to see ' + filmId);
    var data = {
        "username": username,
        "filmId": filmId
    }

    fetch(server_url + "/wantToSee/createWTS", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(resp => {
        if (resp.status === 200) return resp.json()
    }).then(wts => {
        console.log(wts);
        fillInWantToSees();
        document.getElementById("wts_button_" + filmId).innerHTML = 'Remove'
        console.log('deleteFromWts("' + logged_in_username + '",\'' + wts.id + '\',\'' + filmId + '\')')
        document.getElementById("wts_button_" + filmId).setAttribute("onclick", 'deleteFromWts(\'' + logged_in_username + '\',\'' + wts.id + '\',\'' + filmId + '\')');
    })
}

function createWTSButtonHTML(filmId) {
    return '<button id="wts_button_' + filmId + '" type="button" onclick="addToWantToSee(logged_in_username,\'' + filmId + '\');">TO SEE</button>';
}


function createDeleteWTSButton(wtsId, filmId) {
    var delete_button_html = '' +
        '<button id="wts_button_' + wtsId + '" class="delete_wts_button" type="button" title="Remove from Want-To-See\'s" onclick="deleteFromWts(logged_in_username,\'' + wtsId + '\',\'' + filmId + '\');"><p>X</p></button>';

    return delete_button_html;
}

function createRemoveWTSButton(wtsId, filmId, message) {
    var delete_button_html = '' +
        '<button id="wts_button_' + wtsId + '" class="delete_wts_button" type="button" title="Remove from Want-To-See\'s" onclick="deleteFromWts(logged_in_username,\'' + wtsId + '\',\'' + filmId + '\');"><p>'+ message + '</p></button>';

    return delete_button_html;
}

function createRatePopup(username, filmId) {

    var pop_up_empty_html =
        '<div id="pop_up_rating_window">' +
        '   <div class="rate_heading">' +
        '          <button class="delete_popup_button" type="button" title="Close" onclick="closePopup();"><p>&nbsp;X&nbsp;</p></button>' +
        '          <p>RATE</p>' +
        '   </div>' +
        '<p><br><br><br><br>Loading Rating...</p>' +
        '</div>'


    document.getElementById("pop_up_wrapper").innerHTML = pop_up_empty_html;

    fetch(server_url + "/rating/currentRatingStatus?username=" + username + "&filmId=" + filmId)
        .then( resp => resp.json() )
        .then( rating => {
            pop_up_html = '<div id="pop_up_rating_window">';

            pop_up_html = pop_up_html + createFilmRatingInfo(rating);

            if (rating.ratingValue !== null) pop_up_html = pop_up_html + createDeleteRatingButton(rating);

            pop_up_html = pop_up_html + createReviewOption(rating);

            document.getElementById("pop_up_wrapper").innerHTML = pop_up_html;
        });
}

function createReviewOption(rating) {
    html = '';
    hasAlreadyRated = false;
    if (rating.ratingValue !== null) hasAlreadyRated = true;

    html = html + '<div id="add_review_box">' +
        '        <label for="review_input"><p style="text-align:left; margin-bottom:0px;">REVIEW: <span style="color:grey" id="review_message"></span></p></label>\n' +
        '        <textarea id="review_input" type="text"  rows="3" name="review" placeholder="(OPTIONAL) Type review..." >'

    if (rating.review !== null) {
        html = html + rating.review
    }

        html = html + '</textarea>' +
        '<button id="submit_review_button" onclick="submitReview(\'' + rating.film.id + '\',' + hasAlreadyRated + ')">SUBMIT</button>' +
        '</div>'
    return html;
}

function submitReview(filmId, hasAlreadyRated) {
    console.log('submit review called for ' + filmId)
    var review = document.getElementById("review_input").value;
    var item = document.getElementById("future_rating");
    var rating_value= item.options[item.selectedIndex].value;

    if (rating_value < 0 && hasAlreadyRated !== true) {
        document.getElementById("review_message").innerHTML = "You need to give a rating"
        return
    }

    if (review === '') {
        submitRating(filmId, logged_in_username,null);
    }

    if (rating_value < 0 && hasAlreadyRated === true) {

        var rating = {
            "review":review,
            "film": {
                "id":filmId
            },
            "user": {
                "username":logged_in_username
            }
        };

        fetch(server_url + "/rating/addReview", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rating)
        }).then(resp => {
            var pop_up_wrapper = document.getElementById("pop_up_wrapper").innerHTML;
            if (pop_up_wrapper === '') {
                fillInFilm(check_page_film());
            } else {
                createRatePopup(logged_in_username,filmId);
            }

        })
    }

}

function createDeleteRatingButton(rating) {
    html = '<button id="delete_rating" class="delete_rating_button" type="button" title="Delete this rating" onclick="deleteRating(\'' + rating.id + '\')">DELETE RATING</button>';

    return html;
}

function deleteRating(ratingId) {
    fetch(server_url + "/rating/delete/" + ratingId, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(resp => {
        fillInWantToSees();
        var pop_up_wrapper = document.getElementById("pop_up_wrapper").innerHTML;
        if (pop_up_wrapper === '') {
            fillInFilm(check_page_film());
        }
        closePopup();

    })
}

function createFilmRatingInfo(rating) {
    var film = rating.film;

    html = '<div class="rate_heading">' +
        '          <button class="delete_popup_button" type="button" title="Close" onclick="closePopup();"><p>&nbsp;X&nbsp;</p></button>' +
        '          <p>RATE</p>' +
        '</div>' +
       ' <div class="rating_wrapper">' +
        '        <div class="poster">\n' +
        '                        <img src="' + film.posterUrl + '">\n' +
        '        </div>' +
        '        <div class="rate_info"">\n' +
        '                        <h4 style="font-size:25px"> <a href="' + film_url + film.id + '">' + film.title + ' <span style="font-size:small">(' + film.releaseYear + ')</a></span></h4>\n' +
        '                        <ul style="margin-top:-25px">' + film.runTime + 'min  <i style="color:var(--pink-purple)">' + getNamesString(film.genres, 'genre') + '. </i></ul>';

    // RATING
    // Your rating
    html = html + createYourRating(rating, rating.film, false);

     html = html +  '</div>'

    return html;
}

function createYourRating(rating, film, addDelete) {
    html = '';

    if (rating !== null && rating.ratingValue !== null) {
        html = html +          '<ul class="your_current_rating"><span style="font-size:small">YOUR RATING: </span><span id="dynamic_rating_value">' + getRatingString(rating.ratingValue) + '</span>'
        if (addDelete) {
            html = html +   '<button type="button" title="Delete this rating" onclick="deleteRating(\'' + rating.id + '\')">DELETE RATING</button>'
        }
    } else {
        html = html + '<ul class="your_future_rating"> RATE: <span id="dynamic_rating_value">' + getRatingString(0) + '</span>'
    }

    html = html +  '<select id="future_rating" onchange="updateRatingBasedOnSelect()"> ' +
        '<option value="-1">rate</option> ' +
        '<option value="100">10</option> ' +
        '<option value="90">9</option> ' +
        '<option value="80">8</option> ' +
        '<option value="70">7</option> ' +
        '<option value="60">6</option> ' +
        '<option value="50">5</option> ' +
        '<option value="40">4</option> ' +
        '<option value="30">3</option> ' +
        '<option value="20">2</option> ' +
        '<option value="10">1</option> ' +
        '<option value="0">0</option> ' +
        '</select>  <input id="submit_rating_button" type="submit" value="RATE" onclick="submitRating(\'' + film.id + '\',\'' + logged_in_username +'\',null)"></ul>'




    html = html + '<div class="rating_box"><ul style="font-size:12px;">'
    // Average Rating
    if (film.averageRating !== null) html = html + '| Avg: ' + getRatingString(film.averageRating) + ' '
    if (film.averageRatingImdb !== null) html = html + '| Avg (IMDB): ' + (film.averageRatingImdb / 10) + '/10 '

    html = html + '|</ul></div>'

    return html;
}

function closePopup() {
    document.getElementById("pop_up_wrapper").innerHTML = '';
}

function deleteFromWts(username, wtsId, filmId) {
    console.log('deleting wts with id ' + wtsId);

    var data = {
        "id": wtsId
    }

    fetch(server_url + "/wantToSee/deleteWTS", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(resp => {
        fillInWantToSees();
        var update = document.getElementById("wts_button_" + filmId);
        if (update !== null) {
            update.innerHTML = 'TO SEE';
            update.setAttribute("onclick",'addToWantToSee(\'' + logged_in_username + '\',\'' + filmId + '\')')
        }
        update = document.getElementById("wts_button_" + wtsId);
        if (update !== null) {
            update.innerHTML = 'TO SEE';
            update.setAttribute("onclick",'addToWantToSee(\'' + logged_in_username + '\',\'' + filmId + '\')')
        }
    })

}





function updateRatingBasedOnSelect() {
    var item = document.getElementById("future_rating");
    var itemvalue= item.options[item.selectedIndex].value;

    document.getElementById("dynamic_rating_value").innerHTML = getRatingString(itemvalue);
}

function submitRating(filmId, username, review) {
    console.log('updating rating for ' + username + ' of ' + filmId);
    var item = document.getElementById("future_rating");
    var rating_value= item.options[item.selectedIndex].value;

    if (rating_value < 0) {
        return;
    }

    var rating = {
        "ratingValue": rating_value,
        "review":review,
        "film": {
            "id":filmId
        },
        "user": {
            "username":username
        }
    };

    fetch(server_url + "/rating/create", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rating)
    }).then(resp => {
        var pop_up_wrapper = document.getElementById("pop_up_wrapper").innerHTML;
        if (pop_up_wrapper === '') {
            fillInFilm(check_page_film());
        } else {
            createRatePopup(username,filmId);
        }

    })

}

function createSearchPopup() {
    var item = document.getElementById("search_inputter");
    var query = item.value;

    console.log('looking for ' + query)

    var pop_up_empty_html =
        '<div id="pop_up_search_window">' +
        '   <div class="search_heading">' +
        '          <button class="delete_popup_button" type="button" title="Close" onclick="closePopup();"><p>&nbsp;X&nbsp;</p></button>' +
        '          <p>SEARCH RESULTS</p>' +
        '   </div>' +
        '<p><br><br><br><br>Loading Results...</p>' +
        '</div>'

    document.getElementById("pop_up_wrapper").innerHTML = pop_up_empty_html;

    fetch(server_url + "/film/findByPartialTitle?partialTitle=" + query)
        .then( resp => {
            if (resp.status === 404) throw new Error("Not found");
            else return resp.json()
        } )
        .then( films => {
            pop_up_html =  '<div id="pop_up_search_window">' +
                '   <div class="search_heading">' +
                '          <button class="delete_popup_button" type="button" title="Close" onclick="closePopup();"><p>&nbsp;X&nbsp;</p></button>' +
                '          <p>SEARCH RESULTS</p>' +
                '   </div>' +
                ' <div class="search_wrapper">';

            pop_up_html = pop_up_html + createSearchResults(films);

            pop_up_html = pop_up_html + '</div></div>';


            document.getElementById("pop_up_wrapper").innerHTML = pop_up_html;
        })
        .catch( ( ) => {
        document.getElementById("pop_up_wrapper").innerHTML =         '<div id="pop_up_search_window">' +
            '   <div class="search_heading">' +
            '          <button class="delete_popup_button" type="button" title="Close" onclick="closePopup();"><p>&nbsp;X&nbsp;</p></button>' +
            '          <p>SEARCH RESULTS</p>' +
            '   </div>' +
            '<p><br><br><br><br>No results.</p>' +
            '</div>'
        });
}

function createSearchResults(films) {
    html = ''

    films.forEach(film => {
        html = html +
            '<div class="film_result">' +

                '<div class="buttons_wrapper_top">' +
                    '<button class="general_wts_button" id="wts_button_' + film.id + '" type="button" onclick="addToWantToSee(logged_in_username,\'' + film.id + '\');">TO SEE</button>' +
                 '</div>'

        updateWTSButton(film);

        html = html +
            '<img src="' + film.posterUrl + '">' +

                '<div class="buttons_wrapper_bottom">' +
                    '<button id="general_rating_button" type="button" onclick="createRatePopup(logged_in_username,\'' + film.id + '\');">RATE</button> ' +
                '</div>' +

            '<p><a href="' + film_url + film.id + '">' + film.title + '<span style="color:var(--lightpurple);font-size:11px"> <br> (' + film.releaseYear + ')</a></span></p>' +

            '</div>'
    })

    return html;
}

function updateWTSButton(film) {
    filmId = film.id

    fetch(server_url + "/wantToSee/findByUsernameAndFilmId?username=" + logged_in_username + "&filmId=" + film.id)
        .then(resp => {
            if (resp.status === 200) return resp.json()
            if (resp.status === 404) return null;
        })
        .then(wtsId => {
            if (wtsId !== null) {
                var wts_button = document.getElementById("wts_button_" + film.id);
                if (wts_button !== null) {
                    document.getElementById("wts_button_" + film.id).innerHTML = "Remove";
                    document.getElementById("wts_button_" + film.id).setAttribute("onclick","deleteFromWts('" + logged_in_username + "','" + wtsId + "','" + filmId + "');");

                }
             }
        })
}


function createLikeListHTML(rating) {
    likes = ''

    if (rating.userLikes.length > 0) {
        likes = '<p> <span class="color_pink-purple">' + rating.userLikes[0].username + ' likes this</span></p>'
        if (rating.userLikes[0].username === logged_in_username) likes = '<p> <span class="color_pink-purple"> you like this</span></p>'
    }
    if (rating.userLikes.length > 1) {
        likes = ' <p><span class="color_pink-purple">' + getUsernames(rating.userLikes) + ' like this' + '</span></p>'
    }

    return likes;
}


function createLikesHTML(rating) {
    var likes = '<div class="likes" id="likes_' + rating.id + '"> ' + createLikeListHTML(rating) +  '</div>';

    userLikesUsernames = []
    rating.userLikes.forEach(u => userLikesUsernames.push(u.username));


    if (userLikesUsernames.includes(logged_in_username)) {
        likes = likes + '<div class="like_and_comment_buttons"><p><span class="like_button" id="like_' + rating.id + '" onclick="removeLikeFromRating(logged_in_username,\'' + rating.id + '\')"> Unlike</span>';
    } else {
        likes = likes + '<div class="like_and_comment_buttons"><p><span class="like_button" id="like_' + rating.id + '" onclick="addLikeToRating(logged_in_username,\'' + rating.id + '\')"> Like</span>';
    }

    likes = likes + ' | <span class="comment_button" onclick="toggleComments(\'' + rating.id + '\')">Comments</span></p></div>'

    return likes
}

function updateLikeListHTML(ratingId) {

    fetch(server_url + "/rating/" + ratingId)
        .then(resp => resp.json())
        .then(rating => {
            if (rating !== null) document.getElementById("likes_" + ratingId).innerHTML = createLikeListHTML(rating);
        })
}

function addLikeToRating(username, ratingId) {
    fetch(server_url + "/rating/addLike?username=" + username + "&ratingId=" + ratingId)
        .then( resp => {
            updateLikeListHTML(ratingId);
        })

    document.getElementById("like_" + ratingId).innerHTML = 'Unlike';
    document.getElementById("like_" + ratingId).setAttribute("onClick","removeLikeFromRating('" + username + "','" + ratingId + "')");

}

function removeLikeFromRating(username, ratingId) {
    fetch(server_url + "/rating/removeLike?username=" + username + "&ratingId=" + ratingId)
        .then( resp => {
            updateLikeListHTML(ratingId);
        })

    document.getElementById("like_" + ratingId).innerHTML = 'Like';
    document.getElementById("like_" + ratingId).setAttribute("onClick","addLikeToRating('" + username + "','" + ratingId + "')");
}

function toggleComments(ratingId) {
    console.log('toggling comments');
    var comments =  document.getElementById("comments_" + ratingId);

    if (comments.hidden === true) comments.hidden = false;
    else comments.hidden = true;
}

function createCommentBoxHTML(ratingId) {
    html = '    <div class="comment_box">\n' +
        '            <input id="comment_box_' + ratingId + '" type="text" placeholder="Write comment..." >\n' +
        '            <button class="submit_comment" type="submit" onclick="addCommentToRating(\'' + ratingId + '\')">COMMENT</button>\n' +
        '        </div>'
    return html;
}

function addCommentToRating(ratingId) {
    var comment = document.getElementById("comment_box_" + ratingId).value;

    var comment = {
        "comment":comment,
        "user":{
            "username":logged_in_username
        },
        "rating":{
            "id":ratingId
        }
    }

    fetch(server_url + "/comment/create", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
    }).then(resp => {
        updateComments(ratingId);
    })
}

function updateComments(ratingId) {
    fetch(server_url + "/comment/findByRatingId?ratingId=" + ratingId)
        .then(resp => resp.json())
        .then(commentList => {
            console.log("updating comments with: ");
            console.log(commentList);
            document.getElementById("comments_" + ratingId).innerHTML = createCommentBody(commentList, ratingId);
        })
}

