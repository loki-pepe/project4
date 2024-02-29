import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post


def index(request):
    return render(request, "network/index.html", {
        "profile": "all",
    })


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

    return HttpResponseRedirect(reverse(index))


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


def posts(request, username=""):

    # Filter posts based on username
    if not username:
        posts = Post.objects.all()
    else:
        try:
            profile = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({"error": "Invalid username"}, status=400)

        posts = Post.objects.filter(creator=profile)

    return JsonResponse([post.serialize() for post in posts], safe=False)


def profile(request, username):

    try:
        profile_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponseRedirect(reverse(index))

    if request.method == "GET":
        follower_count = profile_user.followers.all().count()
        following_count = profile_user.following.all().count()
        follow = profile_user.followers.filter(id=request.user.id).exists()

        return render(request, "network/profile.html", {
            "username": username, 
            "follower_count": follower_count,
            "following_count": following_count,
            "follow": follow,
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
