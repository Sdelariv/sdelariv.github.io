check_login(loadFilmPage);


function loadFilmPage() {

    fillInUsername();
    updateNotifications();
    fillInFriendRequests();

    fillInFilm(check_page_film())

}


function fillInFilm(filmId) {
    console.log('going to fill in for ' + filmId);

    fetch(server_url + "/film/findFilmAndRatingsByIdAndForUser?filmId=" + filmId)
        .then( resp => {
            if (resp.status !== 200) {
                document.getElementsByClassName("content-center-and-right")[0].innerHTML = '<br><br> <p>FILM NOT FOUND</p> <br><br><br><img style="width:40%; margin-left:100px; opacity:0.7" src="/img/filmnotfound.png">';
            }
            else return resp.json();
        })
        .then( filmInfoDTO => {
            console.log(filmInfoDTO);
            film_poster_box_html = createFilmPosterBoxHtml(filmInfoDTO);
            film_info_box_html = createFilmInfoBoxHtml(filmInfoDTO);
            document.getElementsByClassName("content-left")[0].innerHTML = film_poster_box_html;
            document.getElementsByClassName("content-center-and-right")[0].innerHTML = film_info_box_html
        })

}

function createFilmPosterBoxHtml(filmInfoDTO) {
    var film = filmInfoDTO.film;
    html = '';

    if (film === null || film.posterUrl === null) return html;

    html = html + '<div id="big_poster_box">' +
        '<img src="' + film.posterUrl + '">' +
        '</div>'

    return html;
}

function createFilmInfoBoxHtml(filmInfoDTO) {
    var film = filmInfoDTO.film;
    var ratings = filmInfoDTO.ratings;
    var wtsId = filmInfoDTO.userWtsId;
    var user_rating = filmInfoDTO.userRating;

    html ='';



    html = html + '<div class="film_info">'

    html = html + '<h2>' + film.title + ' <span style="font-size:small">(' + film.releaseYear + ')</a></span></h2>' +
        '                        <ul style="margin-top:-15px"><span class="color_pink-purple">' + film.runTime + 'min </span> <i style="color:var(--pink-purple)">' + getNamesString(film.genres, 'genre') + '. </i></ul>'

    if (wtsId === null && user_rating === null) {
        html = html + createWTSButtonHTML(film.id);
    }
        // TODO: make function of creating the button that also calls a fetch afterwards that changes what's been made, if need be
    if (wtsId !== null && user_rating === null) {
        html = html + createRemoveWTSButton(wtsId,film.id, "No interest");
    }


    html = html +  createYourRating(user_rating, film)



    html = html +
        ' <p> Directed by <i>' + getNamesString(film.director, 'crewname') + '.</i></p>' +
        ' <p> Written by <i>' + getNamesString(film.writer, 'crewname') + '.</i></p>'

    if (film.tags.length > 0) {
        html = html +
            '<ul style="color:var(--lightpurple)"> TAGS:' + getNamesString(film.tags, 'tag'); + '</ul>';

    }

    html = html + '</div>'

    html = html + '<div class="user_ratings">' +
        '<p>USER RATINGS:</p>' + createUserRatingsList(ratings) +
        '</div>'

    return html;
}

function createUserRatingsList(ratings) {
    html = '';
    console.log(ratings);

    ratings.forEach(rating => {
        html = html + '<ul style="color:var(--lightpurple)">' + getRatingString(rating.ratingValue) + ' <a class="color_pink-purple" href="' + user_url + rating.user.username+ '">' + rating.user.username + '</a> <span style="font-size:x-small">' + createTimeStamp(rating.dateOfRating) + '</span></ul>'
        if (rating.review !== null) html = html + '<ul> "' + rating.review + '" </ul>'
        html = html + '<br>'
    })

    if (html === '') html = '<p style="font-size:small; color:grey"> No ratings yet</p>'

    return html;
}

function check_page_film() {
    var filmId = '';

    if (queryString.includes("filmId=")) filmId = getParameterByName("filmId");

    return filmId;
}

