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

function editPost(post) {
    const editBtn = post.querySelector('.edit-btn');
    editBtn.style.display = 'none';

    const contentDiv = post.querySelector('.content');
    const content = contentDiv.innerHTML;
    const editContent = document.createElement('textarea');
    editContent.value = content;

    const cancelBtn = document.createElement('button');
    cancelBtn.setAttribute('class', 'cancel-btn');
    cancelBtn.innerHTML = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        contentDiv.replaceChildren(content);
        editBtn.style.display = 'inline';
    });

    const saveBtn = document.createElement('button');
    saveBtn.disabled = true;
    saveBtn.setAttribute('class', 'save-btn');
    saveBtn.innerHTML = 'Save';
    saveBtn.addEventListener('click', () => {
        saveEdit(post.id, editContent.value);
        contentDiv.replaceChildren(editContent.value);
        editBtn.style.display = 'inline';
    });

    editContent.addEventListener('input', () => {
        if (editContent.value.length > 0  && editContent.value !== content) {
            saveBtn.disabled = false;
        } else {
            saveBtn.disabled = true;
        }
    })

    contentDiv.replaceChildren(editContent, cancelBtn, saveBtn);
}

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
    post.setAttribute('id', postJson.id)

    const creator = document.createElement('div');
    creator.innerHTML = `<a href="${postJson.creator}">${postJson.creator}</a>`;

    const content = document.createElement('div');
    content.setAttribute('class', 'content')
    content.innerHTML = postJson.content;

    const likes = document.createElement('div');
    likes.innerHTML = postJson.likes_count;

    const timestamp = document.createElement('div');
    timestamp.innerHTML = postJson.timestamp;

    post.append(creator, content, likes, timestamp);

    if (postJson.creator === document.getElementById('username').innerHTML) {
        const editBtn = document.createElement('button');
        editBtn.innerHTML = 'Edit';
        editBtn.setAttribute('class', 'edit-btn')
        editBtn.addEventListener('click', () => editPost(post));
        creator.append(editBtn);
    }

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
        prevBtn.disabled = false;
        prevBtn.addEventListener('click', () => loadPosts(pageNum-1));
    } else {
        prevBtn.disabled = true;
    }

    if (nextPage) {
        nextBtn.disabled = false;
        nextBtn.addEventListener('click', () => loadPosts(pageNum+1));
    } else {
        nextBtn.disabled = true;
    }
}

function saveEdit(id, newContent) {
    const csrftoken = getCookie('csrftoken');

    fetch(`/post/${id}`, {
        method: 'POST',
        body: JSON.stringify({
            content: newContent
        }),
        headers: {
            'X-CSRFToken': csrftoken
        }
    });
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
