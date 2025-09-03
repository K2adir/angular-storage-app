from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CustomerViewSet, ItemViewSet, ArchivedItemViewSet, OrderViewSet

router = DefaultRouter()
router.register('customers', CustomerViewSet)
router.register('items', ItemViewSet)
router.register('archived', ArchivedItemViewSet)
router.register('orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

