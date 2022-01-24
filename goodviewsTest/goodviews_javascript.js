// GENERAL VARIABLES

var wall_html ='';
var username = "sdelariv";
var friendlist_html = '';

// ALL THE METHODS

fetch_updates();
fillInFriendList();
fillInWantToSees();
fillInUsername();
fillInLatestRatings();


function fetch_updates() {
    console.log('FETCHING RATINGS CALLED');
    var ratingIds = [];

    fetch("http://localhost:8080/timeline/" + username)
        .then( resp => resp.json() )
        .then( logUpdates => { logUpdates.forEach( logUpdate => {

            if (logUpdate.rating != null) {
                var newRating = createRating(logUpdate.rating);

                var ratingId = newRating.id;
                var commentString = '';

                fetch("http://localhost:8080/comment/findByRatingId?ratingId=" + ratingId)
                    .then( resp => resp.json() )
                    .then(commentList => {

                        if (!ratingIds.includes(ratingId)) {
                            if (newRating.user.username === username) {
                                wall_html = createLogUpdateWithYouHTML(logUpdate,commentList);
                            } else {
                                wall_html = createFullRatingHTML(newRating);
                                if (commentList.length > 0) {
                                    commentString = createCommentHTML(commentList);
                                    wall_html = wall_html + commentString
                                    document.getElementsByClassName("content-center")[0].innerHTML = wall_html
                                    ratingIds.push(ratingId);
                                }
                            }
                        }
                    })
            } else {
                wall_html = createGeneralLogUpdateHTML(logUpdate);
            }

        })})
}



function fillInFriendList() {
    fetch("http://localhost:8080/friendship/" + username + "/friendlist")
        .then(resp => resp.json())
        .then(friends => {
            console.log(JSON.stringify(friends));

            friends.forEach(friend => {

                fetch("http://localhost:8080/rating/findNumberByUsername?username=" + friend.username)
                    .then(resp => resp.json())
                    .then(rating => {
                        friendlist_html = createFriendHTML(friend, rating);
                        document.getElementById("friend_list_bar").innerHTML = friendlist_html;
                        console.log(friendlist_html);
                    })


            })
        })
}

function createFriendHTML(friend, numberOfRatings) {

    console.log('create HTML called for ' + friend.username)
    friendlist_html = friendlist_html +
        '<p> &#9642; ' + friend.username + ' <span style="color:grey">(' + numberOfRatings + ' ratings) </span></p>'

    return friendlist_html
}

function createLogUpdateWithYouHTML(logUpdate, commentList) {
    wall_html = wall_html +
        '<div class="update"><p>'+ logUpdate.updateString.replace(username + "'s",'your') + '</p>'
    if (logUpdate.rating != null) {
        wall_html = createPartialRatingHTML(logUpdate.rating) + '</div>'
        if (commentList != null && commentList.length > 0) {
            var commentString = '';
            commentString = createCommentHTML(commentList);
            wall_html = wall_html + commentString
        }}

    return wall_html ;
}

function createGeneralLogUpdateHTML(logUpdate) {
    wall_html = wall_html +
        '<div class="update"><p>'+ logUpdate.updateString + '</p></div>'
    return wall_html;
}

function fillInUsername() {
    document.getElementById("username_top").innerHTML = username + '</br>'
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
                var directors = getNamesString(rating.film.director).slice(0,-2);
                var posterUrl = rating.film.posterUrl;
                var genres = getNamesString(rating.film.genres).slice(0,-2);
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

    fetch("http://localhost:8080/wantToSee/" + username)
        .then( resp => resp.json() )
        .then( wantToSees => { wantToSees.forEach( wts => {

            counter = counter + 1;
            document.getElementById("wts_present").innerHTML = '';

            if (counter < 4) {

                title = wts.film.title;
                releaseYear = wts.film.releaseYear;
                directors = getNamesString(wts.film.director).slice(0,-2);
                posterUrl = wts.film.posterUrl;
                genres = getNamesString(wts.film.genres).slice(0,-2);


                document.getElementById("wts_title_" + counter).innerHTML = title + '<span style="font-size:small"> (' + releaseYear + ')</span>'
                document.getElementById("wts_director_" + counter).innerHTML = 'Directed by ' + directors;
                document.getElementById("wts_genres_" + counter).innerHTML = '<i>' + genres + '</i>';
                document.getElementById("wts_poster_" + counter).setAttribute("src",posterUrl);
                document.getElementById("seenbutton_" + counter).innerHTML = '<a id="rate" href="">RATE</a><br>';
                document.getElementById("delete_wts_" + counter).innerHTML = ' x';
            }
            if (counter > 3) {
                document.getElementById("see_more_button").innerHTML = '<b><a href="">SEE MORE</a></b>' // TODO: Fill in link to see more of wts's
            }
        })
        })}

function createCommentHTML(commentList) {
    var commentString = '';
    commentList.forEach(c => {
        if (c != null && c.user != null && c.user.username != null) {
            var dateOfComment = new Date(c.dateTime);
            commentString = commentString +
                '<p><strong>' + c.user.username + '</strong>: ' + c.comment +
                '<span style="font-size:x-small; color:#756581; float:right;"> ' + dateOfComment.toLocaleString() + '</span></p>'
        }
    });
    commentString = '<div class="comments"><p style="font-size:smaller;text-align:center">COMMENTS </p> ' + commentString + '</div>'
    return commentString;
}



function createRating(rating)
{
    var newRating = {
        "id":rating.id,
        "ratingValue":rating.ratingValue,
        "dateOfRating":rating.dateOfRating,
        "dateOfReview":rating.dateOfReview,
        "review":rating.review,
        "user":rating.user,
        "film":rating.film,
        "userLikes":rating.userLikes
    }

    return newRating
}


function createFullRatingHTML(rating) {
    console.log('createRatingHTML called');
    if (rating.review == null) {
        var dateOfRating = new Date(rating.dateOfRating);
        wall_html = wall_html +
            '<div class="update">\n' +
            '                        <p class="update_date">' + dateOfRating.toLocaleDateString()+ '</p>' +
            '                        <p><span class="color_pink-purple">' + rating.user.username + '</span> has rated a film <span class="color_pink-purple">' + getRatingString(rating.ratingValue) + '</span></p>\n'

    } else {
        wall_html = wall_html +
            '<div class="update">\n' +
            '                        <p class="update_date">' + rating.dateOfReview + '</p>' +
            '                        <p><span class="color_pink-purple">' + rating.user.username + '</span> has reviewed a film </p>\n' +
            '<p><span class="color_pink-purple">' + getRatingString(rating.ratingValue) + '</span></p>' +
            '                        <p>"' + rating.review + '"</p>'
    }

    wall_html = createPartialRatingHTML(rating)

    return wall_html;
}

function createPartialRatingHTML(rating) {
    wall_html = wall_html +
        '                        <div class="poster">\n' +
        '                            <img src="' + rating.film.posterUrl + '">\n' +
        '                        </div>\n' +
        '                        <h4 style="font-size:25px">' + rating.film.title + ' <span style="font-size:small">(' + rating.film.releaseYear + ')</span></h4>\n' +
        '                        <p style="margin-top:-25px; color:var(--pink-purple)"> <i>' + getNamesString(rating.film.genres).slice(0,-2) + '.</i></p>' +
        '                        <p> Directed by <i>' + getNamesString(rating.film.director).slice(0,-2) + '.</i></p>' +
        '                        <p> Written by <i>' + getNamesString(rating.film.writer).slice(0,-2) + '.</i></p>'
        + addLikes(rating) +
        '</div>'
    return wall_html;
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

function getUsernames(users) {
    var usernames = ''
    users.forEach(u => usernames = usernames + u.username + ', ')
    return usernames.slice(0, -2) ;
}




function getNamesString(object)
{
    var string = '';
    object.forEach(o => string = string + o.name + ", ")

    return string;
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


