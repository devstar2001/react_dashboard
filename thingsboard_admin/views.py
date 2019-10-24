import os
import json

from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings


class ManifestFileView(APIView):
    def get(self, request):
        file_path = os.path.join(settings.BASE_DIR, 'frontend/build/manifest.json')
        with open(file_path) as file:
            data = json.load(file)
        return Response(data=data)

