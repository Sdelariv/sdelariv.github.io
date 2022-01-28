// GENERAL VARIABLES

var wall_html ='';
var logged_in_username = "bibi";
var friendlist_html = '';
var ratingid_list = []

// ALL THE METHODS

fetch_updates();
fillInFriendList();
fillInWantToSees();
fillInUsername();
fillInLatestRatings();
fillInNotificationCount();
fillInNotifications(); // Needs to be on click
fillInFriendRequests();



// METHODS

function fetch_updates() {

    fetch("http://localhost:8080/timeline/" + logged_in_username)
        .then( resp => resp.json() )
        .then( logUpdates => {

            logUpdates.forEach( logUpdate => {

                if (logUpdate.type === 'FRIENDS') {
                    wall_html = wall_html + createFriendHTML(logUpdate);
                }

                if (logUpdate.type === 'RATING') {
                    wall_html = wall_html + createRatingHTML(logUpdate);
                    ratingid_list.push(logUpdate.rating.id);
                }

                if (logUpdate.type === 'COMMENT') {
                    wall_html = wall_html + createNewCommentHTML(logUpdate);
                    ratingid_list.push(logUpdate.rating.id);
                }

                if (logUpdate.type === 'WTS') {
                    wall_html = wall_html + createWtsHTML(logUpdate);
                }

                document.getElementsByClassName("content-center")[0].innerHTML = wall_html;
            })
        })
}



// CREATE HTML

function fillInNotificationCount() {
    fetch("http://localhost:8080/notifications/findNumberByUsername?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( count => {
            if (count > 0) document.getElementById("notifications_icon").innerHTML = '<p>' + count + '</p>'
        })

    fetch("http://localhost:8080/notifications/findNumberOfFriendRequestsByUsername?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( count => {
            if (count > 0) document.getElementById("friendrequest_icon").innerHTML = '<p>' + count + '</p>'
        })
}

function fillInNotifications() {
    fetch("http://localhost:8080/notifications/findTenNotifications?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( notifications => {
            var notification_html = '';
            notifications.forEach(notification => {
                if (!notification.seen) notification_html = notification_html + '<p>' + notification.message + '</p>';
                if (notification.seen) notification_html = notification_html + '<p style="color:grey">' + notification.message + '</p>';
            })

            notification_html = notification_html + '<a href="" style="color:black;font-size:small;text-shadow: none;text-decoration:none"> SEE MORE NOTIFICATIONS </a><br> <br>'

            document.getElementById("notification_wrapper").innerHTML =  notification_html
        })
}

function fillInFriendRequests() {
    fetch("http://localhost:8080/notifications/findFriendRequests?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( notifications => {
            var notification_html = '';
            notifications.forEach(notification => {

                if (!notification.seen) notification_html = notification_html + '<p>' + notification.message + '</p>';
                if (notification.seen) notification_html = notification_html + '<p style="color:grey">' + notification.message + '</p>';
                notification_html = notification_html + '<p><a href="">ACCEPT</a> | <a href="""> DECLINE </u></p>'
            })

            document.getElementById("friendrequests_wrapper").innerHTML =  notification_html
        })
}

function createFriendHTML(logUpdate) {
    friendA = 'unknownUser';
    friendB = 'unknownUser';
    if (logUpdate.user != null && logUpdate.user.username != null) friendA = logUpdate.user.username;
    if (logUpdate.otherUser != null && logUpdate.otherUser.username != null)  friendB = logUpdate.otherUser.username;


    if (friendA === logged_in_username) friendA = 'you';
    if (friendB === logged_in_username) friendB = 'you';

    html =  '<div class="update" style="background:var(--friend)">' +
        '<p class="update_date">' + createTimeStamp(logUpdate.dateTime) + '</p>' +
        '<p><span class="color_pink-purple">'+ friendA + '</span> has become friends with <span class="color_pink-purple">'+ friendB + '</span> </p>' +
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

    if (ratingid_list.includes(rating.id)) return '';

    var ratingUser = logUpdate.rating.user.username + '\'s'

    if (ratingUser === logged_in_username  + '\'s') ratingUser = 'your'

    // New Comment heading
    html = '<div class="update"  style="background:var(--comment)"><p><span class="color_pink-purple">' + logUpdate.user.username + '</span> has commented on <br><br>' + ratingUser + ' rating: ' + getRatingString(logUpdate.rating.ratingValue) + '</p>'

    // Film info
    html = html + createFilmInfo(rating.film, logUpdate.userWantsToSee, logUpdate.userHasRated) + addLikes(rating) + '</div>'

    // Adding comments
    html = html + createCommentHTML(commentList);

    return html;
}

function createWtsHTML(logUpdate) {
    var html = '<div class="update" style="background:var(--wts)">'
        + '<p class="update_date">' + createTimeStamp(logUpdate.dateTime)  + '</p>'
        + '<p><span class="color_pink-purple">' + logUpdate.user.username + '</span> wants to see ' + logUpdate.film.title + '</p>';


    // Add filminfo
    html = html + createFilmInfo(logUpdate.film, logUpdate.userWantsToSee, logUpdate.userHasRated) + '</div>'

    return html;
}


function createRatingHTML(logUpdate) {
    var rating = logUpdate.rating;
    var commentList = logUpdate.commentList;
    var html = '';

    if (!ratingid_list.includes(logUpdate.rating.id)) {
        // Rating or Review
        html = html + createRatingHeading(rating);

        // Film info
        html = html + createFilmInfo(rating.film, logUpdate.userWantsToSee, logUpdate.userHasRated) + addLikes(rating) + '</div>'

        // Adding comments
        html = html + createCommentHTML(commentList);
    }

    return html;
}

function createRatingHeading(rating) {
    var html = '';

    if (rating.review == null) {
        html = html +
            '<div class="update" style="background:var(--rating)">\n' +
            '                        <p class="update_date">' + createTimeStamp(rating.dateOfRating)+ '</p>' +
            '                        <p><span class="color_pink-purple">' + rating.user.username + '</span> has rated a film <span class="color_pink-purple">' + getRatingString(rating.ratingValue) + '</span></p>\n'

    } else {
        html = html +
            '<div class="update" style="background:var(--rating)">\n' +
            '                        <p class="update_date">' + createTimeStamp(rating.dateOfReview) + '</p>' +
            '                        <p><span class="color_pink-purple">' + rating.user.username + '</span> has reviewed a film </p>\n' +
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
        '                        <h4 style="font-size:25px">' + film.title + ' <span style="font-size:small">(' + film.releaseYear + ')</span></h4>\n' +
        '                        <p style="margin-top:-25px; color:var(--pink-purple)"> <i>' + getNamesString(film.genres) + '.</i></p>' +
        createRateAndWtsButtons(userWantsToSee, userHasRated, film) +
        '                        <p> Directed by <i>' + getNamesString(film.director) + '.</i></p>' +
        '                        <p> Written by <i>' + getNamesString(film.writer) + '.</i></p>'

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
        button_html = button_html +
            '<button id="wts_button_' + filmId + '" type="button" onclick="addToWantToSee(logged_in_username,\'' + filmId+ '\');">WANT TO SEE</button>';
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
    var usernames = ''
    users.forEach(u => usernames = usernames + u.username + ', ')
    return usernames.slice(0, -2) ;
}

function getNamesString(object) {
    var counter = 0;
    var string = '';
    object.forEach(o => {
        if (counter < 3) string = string + o.name + ", "
        if (counter === 3) string = string + "etc..."
        counter = counter + 1;
    })

    return string.slice(0,-2);
}

function addLikes(rating) {
    var likes = ''
    if (rating.userLikes.length > 0) {
        likes = '<div class="likes"> ' +
            '<p> <span class="color_pink-purple">' + rating.userLikes[0].username + ' likes this</span></p>' +
            '</div>'
    }
    if (rating.userLikes.length > 1) {
        likes = '<div class="likes"> ' +
            ' <p><span class="color_pink-purple">' + getUsernames(rating.userLikes) + ' like this' + '</span></p>' +
            '</div>'
    }
    return likes
}

function createCommentHTML(commentList) {
    if (commentList.length === 0) return '';

    var commentString = '';
    commentList.forEach(c => {
        if (c != null && c.user != null && c.user.username != null) {
            var dateOfComment = new Date(c.dateTime);
            commentString = commentString +
                '<p><strong>' + c.user.username + '</strong>: ' + c.comment +
                '<span style="font-size:x-small; color:#756581; float:right;"> ' + dateOfComment.toLocaleString() + '</span></p>'
        }
    });
    commentString = '<div class="comments"  style="background:var(--comments)"><p style="font-size:smaller;text-align:center">COMMENTS </p> ' + commentString + '</div>'

    return commentString;
}


function fillInFriendList() {
    fetch("http://localhost:8080/friendship/" + logged_in_username + "/friendlist")
        .then(resp => resp.json())
        .then(friends => {

            friends.forEach(friend => {

                fetch("http://localhost:8080/rating/findNumberByUsername?username=" + friend.username)
                    .then(resp => resp.json())
                    .then(rating => {
                        friendlist_html = createFriendListHTML(friend, rating);
                        document.getElementById("friend_list_bar").innerHTML = friendlist_html;
                    })


            })
        })
}


function createFriendListHTML(friend, numberOfRatings) {

    console.log('create HTML called for ' + friend.username)
    friendlist_html = friendlist_html +
        '<p> &#9642; ' + friend.username + ' <span style="color:grey">(' + numberOfRatings + ' ratings) </span></p>'

    return friendlist_html
}


function fillInUsername() {
    document.getElementById("username_top").innerHTML = logged_in_username + '</br>'
}

function fillInLatestRatings() {
    var counter = 0;

    fetch("http://localhost:8080/rating/latestRatings")
        .then( resp => resp.json() )
        .then( ratings => { ratings.forEach( rating => {
            console.log("FETCHING LATEST RATINGS")
            counter = counter + 1;

            if (counter < 4) {

                var title = rating.film.title;
                var releaseYear = rating.film.releaseYear;
                var directors = getNamesString(rating.film.director);
                var posterUrl = rating.film.posterUrl;
                var genres = getNamesString(rating.film.genres);
                var average = rating.film.averageRating;

                document.getElementById("new_rating_poster_" + counter).setAttribute("src",posterUrl);
                document.getElementById("new_rating_director_" + counter).innerHTML = 'Directed by ' + directors;
                document.getElementById("new_rating_genres_" + counter).innerHTML = '<i>' + genres + '</i>';
                document.getElementById("new_rating_button_" + counter).innerHTML = '<span id="rate" href="" onclick="createRatePopup(logged_in_username,\'' + rating.film.id + '\');">RATE</span><br>';
                document.getElementById("new_rating_title_" + counter).innerHTML = title + '<span style="font-size:small"> (' + releaseYear + ')</span>';
                if (average != null) document.getElementById("new_rating_average_" + counter).innerHTML = '<ul class="rating_average">' + getRatingString(average) + ' <br>(avg.rating)</ul>'
            }
        })
        })}

function fillInWantToSees() {
    var counter = 0;

    fetch("http://localhost:8080/wantToSee/" + logged_in_username)
        .then( resp => resp.json() )
        .then( wantToSees => { wantToSees.forEach( wts => {

            counter = counter + 1;
            document.getElementById("wts_present").innerHTML = '';

            if (counter < 4) {

                title = wts.film.title;
                releaseYear = wts.film.releaseYear;
                directors = getNamesString(wts.film.director);
                posterUrl = wts.film.posterUrl;
                genres = getNamesString(wts.film.genres);


                document.getElementById("wts_title_" + counter).innerHTML = title + '<span style="font-size:small"> (' + releaseYear + ')</span>'
                document.getElementById("wts_director_" + counter).innerHTML = 'Directed by ' + directors;
                document.getElementById("wts_genres_" + counter).innerHTML = '<i>' + genres + '</i>';
                document.getElementById("wts_poster_" + counter).setAttribute("src",posterUrl);
                document.getElementById("seenbutton_" + counter).innerHTML = '<span id="rate" href="" onclick="createRatePopup(logged_in_username,\'' + wts.film.id + '\');">RATE</span><br>';
                document.getElementById("delete_wts_" + counter).innerHTML = createDeleteButton(wts.id);
            }
            if (counter > 3) {
                document.getElementById("see_more_button").innerHTML = '<b><a href="">SEE MORE</a></b>' // TODO: Fill in link to see more of wts's
            }
        })
        })}



function addToWantToSee(username,filmId) {
    console.log(username + ' wants to see ' + filmId);
    var data = {
        "username": username,
        "filmId": filmId
    }

    fetch("http://localhost:8080/wantToSee/createWTS", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(resp => {
        document.getElementById("wts_button_" + filmId).innerHTML = '';
        console.log(resp);
        fillInWantToSees();
    })
}

function createDeleteButton(filmId) {
    var delete_button_html = '' +
        '<button id="wts_button_' + filmId + '" class="delete_wts_button" type="button" title="Remove from Want-To-See\'s" onclick="deleteFromWts(logged_in_username,\'' + filmId + '\');"><p>X</p></button>';

    return delete_button_html;
}

function createRatePopup(username, filmId) {

    var pop_up_empty_html =
        '<div id="pop_up_window">' +
        '   <div class="rate_heading">' +
        '          <button class="delete_rate_button" type="button" title="Close" onclick="closeRatePopup();"><p>&nbsp;X&nbsp;</p></button>' +
        '          <p>RATE</p>' +
        '   </div>' +
        '<p><br><br><br><br>Loading Rating...</p>' +
        '</div>'


    document.getElementById("pop_up_wrapper").innerHTML = pop_up_empty_html;

    fetch("http://localhost:8080/rating/currentRatingStatus?username=" + username + "&filmId=" + filmId)
        .then( resp => resp.json() )
        .then( rating => {
            pop_up_html = '<div id="pop_up_window">';

            pop_up_html = pop_up_html + createFilmRatingInfo(rating);

            pop_up_html = pop_up_html + '</div>';

            document.getElementById("pop_up_wrapper").innerHTML = pop_up_html;
        });
}

function createFilmRatingInfo(rating) {
    var film = rating.film;
    console.log(film);

    html = '<div class="rate_heading">' +
        '          <button class="delete_rate_button" type="button" title="Close" onclick="closeRatePopup();"><p>&nbsp;X&nbsp;</p></button>' +
        '          <p>RATE</p>' +
        '</div>' +
       ' <div class="rating_wrapper">' +
        '        <div class="poster">\n' +
        '                        <img src="' + film.posterUrl + '">\n' +
        '        </div>' +
        '        <div class="rate_info"">\n' +
        '                        <h4 style="font-size:25px">' + film.title + ' <span style="font-size:small">(' + film.releaseYear + ')</span></h4>\n' +
        '                        <ul style="margin-top:-25px">' + film.runTime + 'min  <i style="color:var(--pink-purple)">' + getNamesString(film.genres) + '. </i></ul>';

    // RATING
    // Your rating
    if (rating.ratingValue != null) html = html +          '<ul class="your_current_rating">YOUR RATING: <span id="dynamic_rating_value">' + getRatingString(rating.ratingValue) + '</span>'
    else {
        html = html + '<ul class="your_future_rating"> RATE: <span id="dynamic_rating_value">' + getRatingString(0) + '</span>'
    }
    html = html +  '<select id="future_rating" onchange="updateRatingBasedOnSelect()"> ' +
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
        '</select>  <input id="submit_rating_button" type="submit" value="RATE" onclick="submitRating(\'' + film.id + '\',\'' + rating.user.username +'\')"></ul>'


    html = html + '<div class="rating_box"><ul style="font-size:12px;">'
    // Average Rating
    if (film.averageRating !== null) html = html + '| Avg: ' + getRatingString(film.averageRating) + ' '
    if (film.averageRatingImdb !== null) html = html + '| Avg (IMDB): ' + (film.averageRatingImdb / 10) + '/10 '

    html = html + '|</ul></div>'


    html = html +
        '                        <ul> Directed by <i>' + getNamesString(film.director) + '.</i></ul>' +
        '                        <ul> Written by <i>' + getNamesString(film.writer) +
        '        </div>';


    // ADD Tags
    if (film.tags.length > 0) {
        html = html +
            '<ul style="color:var(--lightpurple)"> TAGS:' + getNamesString(film.tags); + '</ul>';

    }

     html = html +  '</div>'

    return html;
}

function closeRatePopup() {
    document.getElementById("pop_up_wrapper").innerHTML = '';
}

function deleteFromWts(username, wtsId) {
    var data = {
        "id": wtsId
    }

    fetch("http://localhost:8080/wantToSee/deleteWTS", {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(resp => {
        console.log(resp);
        fillInWantToSees();
    })
}





function updateRatingBasedOnSelect() {
    var item = document.getElementById("future_rating");
    var itemvalue= item.options[item.selectedIndex].value;

    document.getElementById("dynamic_rating_value").innerHTML = getRatingString(itemvalue);
}

function submitRating(filmId, username) {
    console.log('updating rating for ' + username + ' of ' + filmId);
    var item = document.getElementById("future_rating");
    var rating_value= item.options[item.selectedIndex].value;

    var rating = {
        "ratingValue": rating_value,
        "film": {
            "id":filmId
        },
        "user": {
            "username":username
        }
    };

    fetch("http://localhost:8080/rating/create", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rating)
    }).then(resp => {
        console.log(resp);
        createRatePopup(username,filmId);
    })

}



