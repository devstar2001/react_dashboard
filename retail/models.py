from django.db import models

# Create your models here.


class Section(models.Model):
    device_id = models.CharField(max_length=255, unique=True)
    access_token = models.CharField(max_length=255)
    data = models.TextField(null=True)
    image_path = models.TextField(null=True)


class Store(models.Model):
    device_id = models.CharField(max_length=255, unique=True)
    store_name = models.CharField(max_length=255)


class StoreSales(models.Model):
    device_id = models.CharField(max_length=255)
    date = models.DateField()
    number_of_customers = models.IntegerField(default=0)

