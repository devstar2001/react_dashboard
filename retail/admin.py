from django.contrib import admin

from .models import Store, Section


class StoreAdmin(admin.ModelAdmin):
    list_display = ('id', 'device_id', 'store_name')


class SectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'device_id')


admin.site.register(Store, StoreAdmin)
admin.site.register(Section, SectionAdmin)

