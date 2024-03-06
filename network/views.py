import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


@login_required
def create(request):

    # Creating a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    if content := request.POST.get("text"):
        post = Post(
            creator = request.user, content = content
        )
        post.save()

    return HttpResponseRedirect(reverse("index"))


def following(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("index"))
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=400)
    
    data = json.loads(request.body)

    if request.method == "POST":
        if request.user != post.creator:
            return JsonResponse({"error": "Invalid user."}, status=400)
        if data.get("content"):
            if data["content"] == post.content:
                return JsonResponse({"error": "False edit."}, status=400)
            post.content = data["content"]
            post.edited = True
            post.save()
            return HttpResponse(status=204)
        else:
            return JsonResponse({"error": "Post cannot be empty"}, status=400)
    elif request.method == "PUT":
        ...
        return HttpResponse(status=204)
    else:
        return JsonResponse({"error": "POST or PUT request required."}, status=400)


def posts(request, username=""):

    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400)

    # Filter posts based on username
    if not username:
        posts = Post.objects.all()
    elif username == 'following':
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Forbidden"}, status=400)
        following = request.user.following.all()
        posts = Post.objects.filter(creator__in=following)
    else:
        try:
            profile = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({"error": "Invalid username"}, status=400)

        posts = Post.objects.filter(creator=profile)

    paginator = Paginator(posts, 10)
    page_num = request.GET.get("page")
    page = paginator.get_page(page_num)

    return JsonResponse({
        "previous_page": page.has_previous(),
        "next_page": page.has_next(),
        "posts": [post.serialize() for post in page],
        }, safe=False)


def profile(request, username):

    try:
        profile_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponseRedirect(reverse("index"))

    if request.method == "GET":
        return render(request, "network/profile.html", {
            "username": username, 
            "follower_count": profile_user.follower_count(),
            "following_count": profile_user.following_count(),
            "follow": profile_user.followers.filter(id=request.user.id).exists(),
        })

    elif request.method == "PUT":
        data = json.loads(request.body)
        if data["follow"]:
            profile_user.followers.add(request.user)
        else:
            profile_user.followers.remove(request.user)

        return HttpResponse(status=204)


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        if username.lower() in ["login", "register", "admin", "following"]:
            return render(request, "network/register.html", {
                "message": "Invalid username."
            })

        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
