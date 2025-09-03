from django.contrib import admin
from .models import Customer, Item, ArchivedItem, Order

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'phone', 'created_at')
    search_fields = ('name', 'email', 'company', 'phone')

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'customer', 'quantity', 'barcode', 'date_added')
    search_fields = ('name', 'barcode', 'customer__email')

@admin.register(ArchivedItem)
class ArchivedItemAdmin(admin.ModelAdmin):
    list_display = ('customer', 'item', 'reason', 'archived_at')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('customer', 'item', 'quantity', 'status', 'date', 'created_at')
    search_fields = ('customer__email', 'item__name', 'tracking_number')

