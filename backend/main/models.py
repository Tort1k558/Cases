from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    balance = models.FloatField(default=0.0)
    trade_link = models.CharField(max_length=200, default='')

    def __str__(self):
        return self.username


class Item(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField(default=0.0)
    rarity = models.IntegerField(default=0)
    image = models.ImageField(upload_to='images/skins/', default='')

    def __str__(self):
        return self.name + f' price: {self.price}'


class Section(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Case(models.Model):
    name = models.CharField(max_length=100)
    price = models.FloatField(default=0.0)
    items = models.ManyToManyField('Item', through='CaseItem')
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True)
    image = models.ImageField(upload_to='images/cases/', default='')

    def __str__(self):
        return self.name


class CaseItem(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.case.name} - {self.item.name}"


class CaseHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    case = models.ForeignKey(Case, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    opened_at = models.DateTimeField(auto_now_add=True)
    withdrawn = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} opened {self.case.name} and got {self.item.name} at {self.opened_at}"


#class OpeningSystem(models.Model):
#    desired_profit = models.FloatField(default=0.0)
#    current_profit = models.FloatField(default=0.0)
#    profit_period = models.DurationField()
#    start_period = models.DateTimeField()
#
#    def save(self, *args, **kwargs):
#        if not self.pk and OpeningSystem.objects.exists():
#            raise Exception("There can be only one instance of OpeningSystem model")
#        super(OpeningSystem, self).save(*args, **kwargs)
#
#    def delete(self, *args, **kwargs):
#        pass
#
#    def __str__(self):
#        return "OpeningSystem"
