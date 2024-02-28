document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        loadPosts();
    }
})

function addPost(postJson) {
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

    document.getElementById('posts-div').append(post);
}

function loadPosts() {

    fetch(`/posts${window.location.pathname}`)
    .then(response => response.json())
    .then(posts => {
        for (let post of posts) {
            addPost(post);
        }
    });
}
