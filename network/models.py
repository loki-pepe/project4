from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    following = models.ManyToManyField("self", blank=True, symmetrical=False, related_name="followers")

class Post(models.Model):
    id = models.BigAutoField(primary_key=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(blank=False, null=False, max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)
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
            "likes": self.likes,
            "edited": self.edited,
        }
