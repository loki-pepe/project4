
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("create", views.create, name="create"),
    path("<str:username>", views.profile, name="profile"),

    # API routes
    path("posts/<str:username>", views.posts, name="posts"),
    path("posts/", views.posts, name="posts"),
]
