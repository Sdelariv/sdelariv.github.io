check_login(loadUserPage);

var username_page = '';


function loadUserPage() {
    fillInUsername();
    fillInFriendList();
    fillInFriendRequests();
    updateNotifications();

    fillInUserPage(check_page_user())


}

function fillInUserPage(username_page) {

    console.log("fillInUserPage called for " + username_page);
    fetch(server_url + "/user/" + username_page)
        .then(resp => resp.json())
        .then(user => {
            username_page = user.username;
            document.getElementById("user_username").innerHTML = username_page
            document.getElementById("user_name").innerHTML = user.firstName + ' ' + user.lastName;

            fillInUserRatings(username_page);
            fillInTheirFriends(username_page);


            var logged_in_user_friends = []

            fetch(server_url + "/friendship/" + logged_in_username + "/friendlist")
                .then(resp => {
                    if (resp.status === 404) return []
                    else return resp.json()
                })
                .then(friends => {
                    friends.forEach(f => logged_in_user_friends.push(f.username));
                    if (logged_in_user_friends.includes(username_page))  {
                        document.getElementById("is_friend").style.display = "contents";
                    } else {
                        document.getElementById("add_friend_button").style.display = "inline-block";
                    }
                    if (username_page === logged_in_username) {
                        document.getElementById("add_friend_button").style.display = "none";
                    }
                    updateFriendRequestedButton();
                })
            })
        .catch((error) =>{
        })
}

function updateFriendRequestedButton() {
    console.log('updating with request');

    var logged_in_user_requested_friends = []

    fetch(server_url + "/friendship/" + logged_in_username + "/friendRequestlist")
        .then(resp => {
            if (resp.status === 404) {
                throw new Error('No friendrequests');
            }
            else return resp.json()
        })
        .then(requestedFriends => {

            requestedFriends.forEach(f => logged_in_user_requested_friends.push(f.username));

            if (logged_in_user_requested_friends.includes(username_page))  {
                document.getElementById("is_friend").style.display = "none";
                document.getElementById("add_friend_button").style.display = "none";
                document.getElementById("friend_request_sent").style.display= "inline-block";
            }

        })
        .catch((error) =>{
        })
}

function requestFriendship() {

    fetch(server_url + "/friendship/sendRequest?senderUsername=" + logged_in_username + "&targetUsername=" + username_page, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        }
    }).then(resp => {
        console.log(resp)
        updateFriendRequestedButton();
    }).catch((error) =>{
    })
}

function fillInTheirFriends(username) {
    their_friendlist_html = '';
    document.getElementById("friend_list_bar").innerHTML = '';

    fetch(server_url + "/friendship/" + username + "/friendlist")
        .then(resp => resp.json())
        .then(friends => {
            friends.forEach(friend => {
                        their_friendlist_html = their_friendlist_html + '<p> &#9642; <a href="' + user_url + friend.username + '">' + friend.username + '</a></p>'
                        document.getElementById("their_friend_list_bar").innerHTML = their_friendlist_html;
            })
        }).catch((error) =>{
    })
}

function fillInUserRatings(username) {
    user_html = '<h3>Ratings: </h3>'
    counter = 0;
    fetch(server_url + "/rating/findByUsername?username=" + username)
        .then(resp => {
            if (resp.status === 404) {
                throw new Error();
            } else {
                return resp.json();
            }
        })
        .then(ratings => {
            if (ratings === null) {
                document.getElementById("number_of_ratings").innerHTML = counter;
                document.getElementById("users_ratings").innerHTML = '<p style="font-size:small; color:var(--lightpurple)">No ratings yet</p>';
            }

            ratings.forEach(rating => {
                user_html = user_html + createUserRatingBox(rating);
                document.getElementById("user_username").innerHTML = rating.user.username;
                document.getElementById("users_ratings").innerHTML = user_html;
                counter++
                document.getElementById("number_of_ratings").innerHTML = counter;
            })
        }).catch((error) =>{
    })
}

function createUserRatingBox(rating) {
    film = rating.film;

    user_rating_html = '' +
        '<div class="rating_result">' +
        getRatingString(rating.ratingValue);


    if (rating.user.username !== logged_in_username) {
        user_rating_html = user_rating_html +
            '<div class="buttons_wrapper_semitop">' +
            '<button id="wts_button" type="button" onclick="addToWantToSee(logged_in_username,\'' + film.id + '\');">TO SEE</button>' +
            '</div>';
    }

    user_rating_html = user_rating_html +
        '<img src="' + film.posterUrl + '">' +

        '<div class="buttons_wrapper_bottom">' +
        '<button id="general_rating_button" type="button" onclick="createRatePopup(logged_in_username,\'' + film.id + '\');">RATE</button> ' +
        '</div>' +

        '<p><a href="' + film_url + film.id + '">' + film.title + '<span style="color:var(--lightpurple);font-size:11px"> <br> (' + film.releaseYear + ')</a></span></p>' +
        '</div>'

    return user_rating_html;
}

function check_page_user() {
    var username = '';

    if (queryString.includes("username=")) {
        username = getParameterByName("username");
    } else {
        username = logged_in_username;
    }

    username_page = username;

    return username;
}