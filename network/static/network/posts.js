document.addEventListener('DOMContentLoaded', () => {

    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        loadPosts();
    }

    if (followToggleBtn = document.getElementById('follow-toggle')) {
        followToggleBtn.addEventListener('click', () => {
            followToggle(followToggleBtn);
        })
    }
})

function followToggle(btn) {

    const csrftoken = getCookie('csrftoken');

    let followed = btn.hasAttribute('followed');

    fetch(window.location.pathname, {
        method: 'PUT',
        body: JSON.stringify({
            follow: !followed
        }),
        headers: {
            'X-CSRFToken': csrftoken
        }
    }).then(response => {  // .then je privremeno, dodat ces API za followere
        location.reload();
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function loadPosts() {
    fetch(`/posts${window.location.pathname}`)
    .then(response => response.json())
    .then(posts => {
        for (let post of posts) {
            document.getElementById('posts-div').append(makePost(post));
        }
    });
}

function makePost(postJson) {
    const post = document.createElement('li');

    const creator = document.createElement('div');
    creator.innerHTML = `<a href="${postJson.creator}">${postJson.creator}</a>`;

    const content = document.createElement('div');
    content.innerHTML = postJson.content;

    const likes = document.createElement('div');
    likes.innerHTML = postJson.likes;

    const timestamp = document.createElement('div');
    timestamp.innerHTML = postJson.timestamp;

    post.append(creator, content, likes, timestamp);

    return post;
}
