from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    following = models.ManyToManyField("self", blank=True, symmetrical=False, related_name="followers")

    def following_count(self):
        return self.following.all().count()

    def follower_count(self):
        return self.followers.all().count()


class Post(models.Model):
    id = models.BigAutoField(primary_key=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(blank=False, null=False, max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name="liked_posts")
    edited = models.BooleanField(default=False, blank=False, null=False)

    class Meta:
        indexes = [
            models.Index(fields=["creator"])
        ]
        ordering = ["-timestamp"]

    def serialize(self):
        return {
            "id": self.id,
            "creator": self.creator.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%a %d %b %Y, %I:%M%p"),
            "likes_count": self.likes.all().count(),
            "liked_by": [user.username for user in self.likes.all()],
            "edited": self.edited,
        }
