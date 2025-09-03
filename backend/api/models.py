from django.db import models


class Customer(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200)
    first_name = models.CharField(max_length=100, blank=True, default='')
    last_name = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    company = models.CharField(max_length=200, blank=True, default='')
    address_line1 = models.CharField(max_length=200, blank=True, default='')
    address_line2 = models.CharField(max_length=200, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    county = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    postal_code = models.CharField(max_length=50, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    notes = models.TextField(blank=True, default='')

    rate_per_m3 = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    prep_cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fulfillment_cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"


PRICING_CHOICES = (
    ('auto', 'Auto'),
    ('manual', 'Manual'),
)


class Item(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    quantity = models.IntegerField(default=0)
    barcode = models.CharField(max_length=200, blank=True, default='')
    width_cm = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    length_cm = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    height_cm = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pricing_mode = models.CharField(max_length=10, choices=PRICING_CHOICES, default='auto')
    manual_monthly_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    prep_pricing_mode = models.CharField(max_length=10, choices=PRICING_CHOICES, default='auto')
    manual_prep_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fulfillment_pricing_mode = models.CharField(max_length=10, choices=PRICING_CHOICES, default='auto')
    manual_fulfillment_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=200, blank=True, default='')
    date_added = models.DateField()

    def __str__(self):
        return f"{self.name} ({self.customer.email})"


class ArchivedItem(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='archived_items')
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=200)
    notes = models.TextField(blank=True, default='')
    archived_at = models.DateTimeField(auto_now_add=True)


ORDER_STATUS = (
    ('Preparing', 'Preparing'),
    ('Shipped', 'Shipped'),
    ('Delivered', 'Delivered'),
    ('Cancelled', 'Cancelled'),
)


class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField(default=1)
    date = models.DateField()
    material_cost_per_fulfillment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='Preparing')
    tracking_number = models.CharField(max_length=200, blank=True, default='')
    email_subject = models.CharField(max_length=200, blank=True, default='')
    email_body = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

