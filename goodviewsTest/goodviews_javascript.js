// GENERAL VARIABLES

var wall_html ='';
var logged_in_username = "sdelariv";
var friendlist_html = '';
var ratingid_list = []

// ALL THE METHODS

fetch_updates();
fillInFriendList();
fillInWantToSees();
fillInUsername();
fillInLatestRatings();
fillInNotificationCount();

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
                console.log(JSON.stringify(count));
                document.getElementById("notifications_icon").innerHTML = '<p>' + count + '</p>'
        })

    fetch("http://localhost:8080/notifications/findNumberOfFriendRequestsByUsername?username=" + logged_in_username)
        .then( resp => resp.json() )
        .then( count => {
            console.log(JSON.stringify(count));
            document.getElementById("friendrequest_icon").innerHTML = '<p>' + count + '</p>'
        })
}

function createFriendHTML(logUpdate) {
    friendA = logUpdate.user.username;
    friendB = logUpdate.otherUser.username;

    if (friendA === logged_in_username) friendA = 'you';
    if (friendB === logged_in_username) friendB = 'you';

    html = '<div class="update" style="background:var(--friend)"><p><span class="color_pink-purple">'+ friendA + '</span> has become friends with <span class="color_pink-purple">'+ friendB + '</span> </p></div>'
    return html;
}

function createNewCommentHTML(logUpdate) {
    var html = '';
    var rating = logUpdate.rating;
    var commentList = logUpdate.commentList;

    if (ratingid_list.includes(rating.id)) return '';

    var ratingUser = logUpdate.rating.user.username + '\'s'

    if (ratingUser === logged_in_username  + '\'s') ratingUser = 'your'

    // New Comment heading
    html = '<div class="update"  style="background:var(--comment)"><p><span class="color_pink-purple">' + logUpdate.user.username + '</span> has commented on ' + ratingUser + ' rating</p>'

    // Film info
    html = html + createFilmInfo(rating.film) + addLikes(rating) + '</div>'

    // Adding comments
    html = html + createCommentHTML(commentList);

    return html;
}

function createWtsHTML(logUpdate) {
    var html = '<div class="update" style="background:var(--wts)">'
        + '<p><span class="color_pink-purple">' + logUpdate.user.username + '</span> wants to see ' + logUpdate.film.title + '</p>';

    // Add filminfo
    html = html + createFilmInfo(logUpdate.film) + '</div>'

    return html;
}


function createRatingHTML(logUpdate) {
    var rating = logUpdate.rating;
    var commentList = logUpdate.commentList;
    var html = '';

    // Rating or Review
    html = html + createRatingHeading(rating);

    // Film info
    html = html + createFilmInfo(rating.film) + addLikes(rating) + '</div>'

    // Adding comments
    html = html + createCommentHTML(commentList);

    return html;
}

function createRatingHeading(rating) {
    var html = '';

    if (rating.review == null) {
        var dateOfRating = new Date(rating.dateOfRating);
        html = html +
            '<div class="update" style="background:var(--rating)">\n' +
            '                        <p class="update_date">' + dateOfRating.toLocaleDateString()+ '</p>' +
            '                        <p><span class="color_pink-purple">' + rating.user.username + '</span> has rated a film <span class="color_pink-purple">' + getRatingString(rating.ratingValue) + '</span></p>\n'

    } else {
        html = html +
            '<div class="update" style="background:var(--rating)">\n' +
            '                        <p class="update_date">' + rating.dateOfReview + '</p>' +
            '                        <p><span class="color_pink-purple">' + rating.user.username + '</span> has reviewed a film </p>\n' +
            '<p><span class="color_pink-purple">' + getRatingString(rating.ratingValue) + '</span></p>' +
            '                        <p>"' + rating.review + '"</p>'
    }
    return html;
}

function createFilmInfo(film) {
    html =
        '                        <div class="poster">\n' +
        '                            <img src="' + film.posterUrl + '">\n' +
        '                        </div>\n' +
        '                        <h4 style="font-size:25px">' + film.title + ' <span style="font-size:small">(' + film.releaseYear + ')</span></h4>\n' +
        '                        <p style="margin-top:-25px; color:var(--pink-purple)"> <i>' + getNamesString(film.genres) + '.</i></p>' +
        '                        <p> Directed by <i>' + getNamesString(film.director) + '.</i></p>' +
        '                        <p> Written by <i>' + getNamesString(film.writer) + '.</i></p>'

    return html;
}


function getRatingString(ratingValue) {
    var ratingString = ''
    if (ratingValue >= 20) ratingString = '&#9733 &#9734 &#9734 &#9734 &#9734'
    if (ratingValue >= 40) ratingString = '&#9733 &#9733 &#9734 &#9734 &#9734'
    if (ratingValue >= 60) ratingString = '&#9733 &#9733 &#9733 &#9734 &#9734'
    if (ratingValue >= 80) ratingString = '&#9733 &#9733 &#9733 &#9733 &#9734'
    if (ratingValue > 99) ratingString = '&#9733 &#9733 &#9733 &#9733 &#9733 '
    return ratingString;
}

function getUsernames(users) {
    var usernames = ''
    users.forEach(u => usernames = usernames + u.username + ', ')
    return usernames.slice(0, -2) ;
}

function getNamesString(object)
{
    var string = '';
    object.forEach(o => string = string + o.name + ", ")

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
            console.log(JSON.stringify(friends));

            friends.forEach(friend => {

                fetch("http://localhost:8080/rating/findNumberByUsername?username=" + friend.username)
                    .then(resp => resp.json())
                    .then(rating => {
                        friendlist_html = createFriendListHTML(friend, rating);
                        document.getElementById("friend_list_bar").innerHTML = friendlist_html;
                        console.log(friendlist_html);
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
            console.log(rating);
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
                document.getElementById("new_rating_button_" + counter).innerHTML = '<a id="rate" href="">RATE</a><br>';
                document.getElementById("new_rating_title_" + counter).innerHTML = title + '<span style="font-size:small"> (' + releaseYear + ')</span>';
                if (average != null) document.getElementById("new_rating_average_" + counter).innerHTML = getRatingString(average) + ' <br>(avg.rating)'
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
                document.getElementById("seenbutton_" + counter).innerHTML = '<a id="rate" href="">RATE</a><br>';
                document.getElementById("delete_wts_" + counter).innerHTML = ' X';
            }
            if (counter > 3) {
                document.getElementById("see_more_button").innerHTML = '<b><a href="">SEE MORE</a></b>' // TODO: Fill in link to see more of wts's
            }
        })
        })}


function addNotificationNumber() {

}








