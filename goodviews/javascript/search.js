check_login(loadSearchPage);

function loadSearchPage() {
    fillInUsername();
    updateNotifications();
    fillInFriendRequests();
    fillInWantToSees();
}

function performSearch() {
    var search_query = document.getElementById("adv_search_inputter").value;
    if (search_query === '') {
        document.getElementsByClassName("search_results")[0].innerHTML = '<p>No search-query</p>'
    }

    var search_types = document.getElementsByName("search_type");
    var input_type = '';
    for(var i = 0; i < search_types.length; i++){
        if(search_types[i].checked){
            input_type = search_types[i].value;
        }
    }

    if (input_type === 'title') searchFilmsByPartialTitle(search_query);
    if (input_type === 'crew') searchFilmsByCrew(search_query);
    if (input_type === 'tag') searchFilmsByTag(search_query);
    if (input_type === 'genre') searchFilmsByGenre(search_query);
    if (input_type === 'user') searchUsersByPartialName(search_query);
}

function searchFilmsByPartialTitle(partialTitle) {
    fetch(server_url + "/film/findByPartialTitle?partialTitle=" + partialTitle)
        .then( resp => {
            if (resp.status === 404) {
                document.getElementsByClassName("search_results")[0].innerHTML = '<p>No results</p>'
            }
            else return resp.json()
        } )
        .then( films => {
            fillInFilmResults(films);
        })
}

function searchFilmsByCrew(partialCrewName) {
    fetch(server_url + "/film/findByPersonName?name=" + partialCrewName)
        .then( resp => {
            if (resp.status === 404) {
                document.getElementsByClassName("search_results")[0].innerHTML = '<p>No results</p>'
            }
            else return resp.json()
        } )
        .then( films => {
            fillInFilmResults(films);
        })
}

function searchFilmsByTag(tag) {
    fetch(server_url + "/film/findByTag?tagName=" + tag)
        .then( resp => {
            if (resp.status === 404) {
                document.getElementsByClassName("search_results")[0].innerHTML = '<p>No results</p>'
            }
            else return resp.json()
        } )
        .then( films => {
            fillInFilmResults(films);
        })
}

function searchFilmsByGenre(genre) {
    fetch(server_url + "/film/findByGenre?genreName=" + genre)
        .then( resp => {
            if (resp.status === 404) {
                document.getElementsByClassName("search_results")[0].innerHTML = '<p>No results</p>'
            }
            else return resp.json()
        } )
        .then( films => {
            fillInFilmResults(films);
        })
}

function searchUsersByPartialName(partialName) {
    fetch(server_url + "/user/findByPartialUsername?username=" + partialName)
        .then( resp => {
            if (resp.status === 404) {
                document.getElementsByClassName("search_results")[0].innerHTML = '<p>No results</p>'
            }
            else return resp.json()
        } )
        .then( users => {
            fillInUserResults(users);
        })
}

function fillInFilmResults(films) {
    html ='';

    films.forEach(film => {
        html = html + '<div class=rating_result>'
        html = html + createFilmResultBox(film);
        html = html + '</div>'

        document.getElementsByClassName("search_results")[0].innerHTML = html;
    })

}


function fillInUserResults(users) {
    html ='';

    users.forEach(user => {
        html = html + '<p> &#9642; <a class=" href="' + user_url + user.username + '">' + user.username + '</a> </p>'
        document.getElementsByClassName("search_results")[0].innerHTML = html;
    })

}

function createFilmResultBox(film) {

    html =                 '<div class="buttons_wrapper_semitop">' +
        '<button class= "wts_button" id="wts_button_'+ film.id + '" type="button" onclick="addToWantToSee(logged_in_username,\'' + film.id + '\');">TO SEE</button>' +
        '</div>';

    html = html + '<img src="' + film.posterUrl + '">' +

        '<div class="buttons_wrapper_bottom">' +
        '<button id="general_rating_button" type="button" onclick="createRatePopup(logged_in_username,\'' + film.id + '\');">RATE</button> ' +
        '</div>' +

        '<p><a href="' + film_url + film.id + '">' + film.title + '<span style="color:var(--lightpurple);font-size:11px"> <br> (' + film.releaseYear + ')</a></span></p>' +
        '</div>'

    return html;
}