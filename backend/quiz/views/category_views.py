from rest_framework import generics
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

from quiz.models import Category
from quiz.serializers.category_serializer import CategorySerializer


@permission_classes([IsAuthenticated])
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
