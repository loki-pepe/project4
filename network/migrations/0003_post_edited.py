# Generated by Django 5.0.1 on 2024-03-06 10:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("network", "0002_user_followers_alter_user_id_post"),
    ]

    operations = [
        migrations.AddField(
            model_name="post",
            name="edited",
            field=models.BooleanField(default=False),
        ),
    ]