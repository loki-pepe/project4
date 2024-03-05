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
    }).then(response => {
        updateFollowers(followed, btn);
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

function loadPosts(pageNum=1) {
    const postsList = document.getElementById('posts-list');
    postsList.replaceChildren();

    fetch(`/posts${window.location.pathname}?page=${pageNum}`)
    .then(response => response.json())
    .then(page => {
        const posts = page.posts;
        for (let post of posts) {
            postsList.append(makePost(post));
        }
        paginate(pageNum, page.previous_page, page.next_page);
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

function paginate(pageNum, previousPage, nextPage) {
    const paginationDiv = document.getElementById('pagination');

    const prevBtn = document.createElement('button');
    prevBtn.setAttribute('id', 'previous');
    prevBtn.innerHTML = 'Previous';
    const nextBtn = document.createElement('button');
    nextBtn.setAttribute('id', 'next');
    nextBtn.innerHTML = 'Next';

    paginationDiv.replaceChildren(prevBtn, nextBtn);

    if (previousPage) {
        prevBtn.removeAttribute('disabled');
        prevBtn.addEventListener('click', () => loadPosts(pageNum-1));
    } else {
        prevBtn.setAttribute('disabled', '');
    }

    if (nextPage) {
        nextBtn.removeAttribute('disabled');
        nextBtn.addEventListener('click', () => loadPosts(pageNum+1));
    } else {
        nextBtn.setAttribute('disabled', '');
    }
}

function updateFollowers(followed, btn) {
    const followers = document.getElementById('follower-count');
    let followerCount = parseInt(followers.innerHTML);

    if (followed) {
        btn.innerHTML = 'Follow';
        btn.removeAttribute('followed');
        followerCount--;
    } else {
        btn.innerHTML = 'Unfollow';
        btn.setAttribute('followed', "");
        followerCount++;
    }
    followers.innerHTML = followerCount;
}
